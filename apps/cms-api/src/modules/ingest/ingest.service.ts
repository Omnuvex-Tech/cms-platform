import { Injectable, Logger } from '@nestjs/common';
import { Channel, Language, Prisma } from '@prisma/client';
import { IngestRepository } from './ingest.repository';
import { IngestLeadDto } from './dto/ingest-lead.dto';

const CHANNELS: Channel[] = ['web', 'whatsapp', 'telegram', 'instagram', 'phone'];

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(private readonly ingestRepository: IngestRepository) {}

  /**
   * Upsert a lead pushed by the bot, keyed by phone (idempotent). Mirrors the
   * bot's LeadRecord into the panel's Lead model without touching sales-team
   * fields (salesStatus / temperature / owner / nextAction) once a lead exists,
   * so a human's triage in the panel is never overwritten by a later bot push.
   */
  async upsertLead(dto: IngestLeadDto) {
    const phone = (dto.phone ?? dto.lead_id)?.trim() || null;
    if (!phone) {
      // No contact number -> not a lead the panel can key on. Ignore quietly;
      // the bot already refuses to persist anonymous leads on its side.
      return { skipped: true, reason: 'no phone' };
    }

    const prefs = dto.preferences ?? {};
    const interested = dto.interested_projects ?? [];

    const shared = {
      name: dto.name ?? null,
      surname: dto.surname ?? null,
      channel: this.mapChannel(dto.channel),
      language: this.mapLanguage(dto.language),
      phone,
      threadId: dto.thread_id ?? undefined,
      topProject: interested[0] ?? null,
      interestedProjects: interested,
      budget: this.formatBudget(prefs),
      budgetRaw: prefs.budget_input ?? null,
      budgetFlexible: prefs.budget_flexible ?? false,
      bedrooms: prefs.bedrooms != null ? String(prefs.bedrooms) : null,
      location: prefs.location ?? null,
      botNotes: this.buildBotNotes(dto),
    };

    const existing = await this.ingestRepository.findLeadByPhone(phone);

    if (existing) {
      const updated = await this.ingestRepository.updateLead(existing.id, shared);
      return { id: updated.id, created: false };
    }

    const created = await this.ingestRepository.createLead(
      shared as Prisma.LeadCreateInput,
    );
    await this.ingestRepository.addTimelineEvent(
      created.id,
      'created',
      `Lead captured from ${shared.channel} via the chatbot.`,
    );
    this.logger.log(`Ingested new lead ${created.id} (${phone})`);
    return { id: created.id, created: true };
  }

  /** Bot channels already match our enum; anything unexpected falls back to web. */
  private mapChannel(raw: string | undefined): Channel {
    const value = (raw ?? '').trim().toLowerCase() as Channel;
    return CHANNELS.includes(value) ? value : 'web';
  }

  /** The bot stores language as a full word ("russian") or a code ("ru"). */
  private mapLanguage(raw: string | null | undefined): Language {
    const v = (raw ?? '').trim().toLowerCase();
    if (v.startsWith('ru')) return 'ru';
    if (v.startsWith('az')) return 'az';
    return 'en';
  }

  private formatBudget(
    prefs: IngestLeadDto['preferences'],
  ): string | null {
    if (!prefs) return null;
    if (prefs.budget_input) return prefs.budget_input;
    if (typeof prefs.budget_usd === 'number' && prefs.budget_usd > 0) {
      return `$${prefs.budget_usd.toLocaleString('en-US')}`;
    }
    return null;
  }

  private buildBotNotes(dto: IngestLeadDto): string | null {
    const parts: string[] = [];
    if (dto.llm_notes) parts.push(dto.llm_notes.trim());
    if (dto.selected_payment_plan) {
      parts.push(`Selected payment plan: ${dto.selected_payment_plan.trim()}`);
    }
    if (dto.interested_unit_ids?.length) {
      parts.push(`Selected units: ${dto.interested_unit_ids.join(', ')}`);
    }
    return parts.length ? parts.join('\n') : null;
  }
}
