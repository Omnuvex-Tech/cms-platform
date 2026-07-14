import { Injectable, Logger } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BotSyncOp,
  ProjectWithChildren,
  projectToBotPayload,
} from './bot-sync.mapper';

interface BotSyncSettings {
  enabled: boolean;
  url: string;
  apiKey: string;
  timeoutMs: number;
  maxAttempts: number;
}

export interface BotSyncResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  status?: number;
  attempts?: number;
  error?: string;
}

const childrenInclude = {
  bedroomPricing: { orderBy: { sortOrder: 'asc' as const } },
  standardPlans: { orderBy: { sortOrder: 'asc' as const } },
  internationalTiers: { orderBy: { sortOrder: 'asc' as const } },
};

/**
 * Pushes published projects to the treva_sales_bot's knowledge base.
 *
 * This is the panel side of the "panel pushes on publish" bridge: when a
 * project is published (or an already-published project is edited or removed),
 * the panel POSTs it — mapped into the bot's KB schema — to the bot's KB-sync
 * webhook. The bot-side receiver is built in a later session; until it exists,
 * this feature stays OFF (BOT_SYNC_ENABLED unset) and is a complete no-op.
 *
 * Design notes:
 *  - Settings are read live from process.env on each call (same pattern as
 *    ApiKeyGuard) so a URL/key added to .env is picked up without a rebuild.
 *  - syncProject NEVER throws: a bot outage must never break the admin's
 *    publish/edit action. Failures are logged and returned as a result.
 *  - There is no durable outbox table here (kept intentionally light for the
 *    panel-only phase). Reliability at cutover comes from `syncAllPublished`,
 *    the admin-triggered backfill that re-pushes every published project.
 */
@Injectable()
export class BotSyncService {
  private readonly logger = new Logger(BotSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  private settings(): BotSyncSettings {
    // SYNC_ENABLED is the single master switch for every cms<->bot sync; the
    // legacy per-flow BOT_SYNC_ENABLED remains a fallback when it is unset.
    const raw = process.env.SYNC_ENABLED ?? process.env.BOT_SYNC_ENABLED ?? '';
    const flag = raw.trim().toLowerCase();
    return {
      enabled: ['1', 'true', 'yes', 'on'].includes(flag),
      url: (process.env.BOT_KB_WEBHOOK_URL ?? '').trim(),
      apiKey: (process.env.BOT_SYNC_API_KEY ?? '').trim(),
      timeoutMs: Number(process.env.BOT_SYNC_TIMEOUT_MS ?? 15000) || 15000,
      maxAttempts: Number(process.env.BOT_SYNC_MAX_ATTEMPTS ?? 4) || 4,
    };
  }

  /**
   * Push one project to the bot. Safe to call fire-and-forget or awaited; it
   * resolves to a result and never rejects.
   */
  async syncProject(
    project: ProjectWithChildren,
    op: BotSyncOp,
  ): Promise<BotSyncResult> {
    const settings = this.settings();
    if (!settings.enabled) return { ok: false, skipped: true, reason: 'disabled' };
    if (!settings.url || !settings.apiKey) {
      this.logger.warn(
        'BOT_SYNC_ENABLED is on but BOT_KB_WEBHOOK_URL/BOT_SYNC_API_KEY is unset; skipping push',
      );
      return { ok: false, skipped: true, reason: 'unconfigured' };
    }

    const payload = projectToBotPayload(project, op);
    return this.post(settings, payload, `${op} "${project.name}"`);
  }

  /**
   * Backfill: re-push every published project. The recovery/cutover tool — run
   * it once the bot-side receiver is live, or after the bot was unreachable.
   */
  async syncAllPublished(): Promise<{
    total: number;
    synced: number;
    failed: number;
    skipped?: string;
  }> {
    const settings = this.settings();
    if (!settings.enabled) return { total: 0, synced: 0, failed: 0, skipped: 'disabled' };

    const projects = (await this.prisma.project.findMany({
      where: { status: ProjectStatus.published },
      include: childrenInclude,
    })) as ProjectWithChildren[];

    let synced = 0;
    let failed = 0;
    for (const project of projects) {
      const result = await this.syncProject(project, 'upsert');
      if (result.ok) synced += 1;
      else failed += 1;
    }
    this.logger.log(
      `Backfill complete: ${synced}/${projects.length} projects pushed to the bot (${failed} failed)`,
    );
    return { total: projects.length, synced, failed };
  }

  /** POST the payload with bounded exponential backoff. Never throws. */
  private async post(
    settings: BotSyncSettings,
    payload: unknown,
    label: string,
  ): Promise<BotSyncResult> {
    let lastError = '';
    for (let attempt = 1; attempt <= settings.maxAttempts; attempt += 1) {
      try {
        const res = await fetch(settings.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(settings.timeoutMs),
        });

        if (res.ok) {
          this.logger.log(`Bot sync ${label} -> HTTP ${res.status} (ok)`);
          return { ok: true, status: res.status, attempts: attempt };
        }

        // 4xx (bad request / auth) is permanent — retrying won't help.
        if (res.status >= 400 && res.status < 500) {
          const body = (await res.text().catch(() => '')).slice(0, 300);
          this.logger.error(`Bot sync ${label} rejected: HTTP ${res.status} ${body}`);
          return { ok: false, status: res.status, attempts: attempt, error: body };
        }

        lastError = `HTTP ${res.status}`; // 5xx — transient, fall through to retry
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err); // network/timeout
      }

      if (attempt < settings.maxAttempts) {
        await this.sleep(Math.min(500 * 2 ** (attempt - 1), 5000));
      }
    }

    this.logger.error(
      `Bot sync ${label} failed after ${settings.maxAttempts} attempts: ${lastError}`,
    );
    return { ok: false, attempts: settings.maxAttempts, error: lastError };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
