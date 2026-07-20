import { Injectable, Logger } from '@nestjs/common';
import {
  Channel,
  ContactRequestStatus,
  Language,
  LeadStatus,
  MessageRole,
  Prisma,
} from '@prisma/client';
import { IngestRepository } from './ingest.repository';
import { BotControlService } from '../conversations/bot-control.service';
import { IngestLeadDto } from './dto/ingest-lead.dto';
import { IngestContactRequestDto } from './dto/ingest-contact-request.dto';
import { IngestConversationDto } from './dto/ingest-conversation.dto';

const CHANNELS: Channel[] = ['webchat', 'whatsapp', 'telegram', 'instagram', 'phone'];

// The pipeline a lead moves through. Used to auto-advance salesStatus from
// signals the bot/panel already gives us (e.g. a contact request coming in)
// without ever regressing a stage a human has already progressed past.
const LEAD_STAGE_ORDER: LeadStatus[] = [
  'new',
  'qualified',
  'contact_requested',
  'assigned',
  'in_follow_up',
  'visit_scheduled',
  'negotiation',
  'won',
  'lost',
  'invalid',
];

// Same idea for a contact request: a customer giving a concrete callback time
// ("call me tomorrow at 6pm") already means "scheduled", without waiting for a
// rep to flip the dropdown — but never regress a request a human already
// worked further (contacted it, completed it, marked no-answer/cancelled).
const CONTACT_STAGE_ORDER: ContactRequestStatus[] = [
  'new',
  'assigned',
  'contacted',
  'scheduled',
  'completed',
  'no_answer',
  'cancelled',
];

// A handoff already in one of these is being worked (queued, claimed, or owned
// by a rep) — a repeat `escalated:true` push from the bot on the same episode
// must not touch it, so a human's in-progress triage (or an explicit "resume
// bot") is never fought by the bot re-asserting the flag on its next turn.
const OPEN_HANDOFF_STATUSES = ['new', 'active', 'assigned'] as const;

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly ingestRepository: IngestRepository,
    private readonly botControlService: BotControlService,
  ) {}

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

  /**
   * Upsert a contact request pushed by the bot, keyed by the bot's `request_id`
   * (idempotent). Bot-captured fields are refreshed on every push; the panel's
   * sales-team fields (status / owner / followUpOutcome) are never overwritten
   * once the request exists, so triage in the panel survives a later bot push.
   * The request is linked to its lead by a fuzzy phone match when one exists.
   */
  async upsertContactRequest(dto: IngestContactRequestDto) {
    const externalId = dto.request_id?.trim();
    if (!externalId) {
      return { skipped: true, reason: 'no request_id' };
    }

    const phone = (dto.phone ?? '').trim();
    const availabilityAt = this.parseDate(dto.availability_datetime);
    const isFlexible = dto.availability_flexible ?? false;
    const availabilityText = dto.availability_text?.trim() || null;
    // A concrete callback ask ("call me tomorrow at 6pm") already means the
    // request is scheduled, not still "new" waiting for a rep to triage it.
    // Flexible availability ("whenever works") isn't a fixed slot, so it
    // doesn't count.
    const hasFixedTime = !isFlexible && (availabilityAt != null || !!availabilityText);

    const botFields = {
      customerPhone: phone,
      preferredChannel: this.mapPreferredChannel(dto.preferred_channel),
      availabilityAt,
      availabilityText,
      isFlexible,
      customerWords: (dto.latest_user_message ?? dto.notes)?.trim() || null,
    };

    const existing =
      await this.ingestRepository.findContactRequestByExternalId(externalId);

    if (existing) {
      // Re-link to a lead if we didn't have one before (never unlink).
      const data: Prisma.ContactRequestUpdateInput = { ...botFields };
      let leadId = existing.leadId;
      if (existing.leadId == null && phone) {
        const lead = await this.ingestRepository.findLeadByPhoneFuzzy(phone);
        if (lead) {
          data.lead = { connect: { id: lead.id } };
          leadId = lead.id;
        }
      }
      if (
        hasFixedTime &&
        CONTACT_STAGE_ORDER.indexOf(existing.status) <
          CONTACT_STAGE_ORDER.indexOf('scheduled')
      ) {
        data.status = 'scheduled';
      }
      const updated = await this.ingestRepository.updateContactRequest(
        existing.id,
        data,
      );
      if (leadId) await this.advanceLeadStatus(leadId, 'contact_requested');
      return { id: updated.id, created: false };
    }

    const lead = phone
      ? await this.ingestRepository.findLeadByPhoneFuzzy(phone)
      : null;

    // Before creating a new row, fold this push into an already-open request for
    // the same phone (a repeat/duplicate request within one live episode). A
    // completed/closed request is left as history, so a genuinely new request
    // after resolution still starts a fresh row.
    if (phone) {
      const openRequest =
        await this.ingestRepository.findOpenContactRequestByPhone(phone);
      if (openRequest) {
        const data: Prisma.ContactRequestUpdateInput = { ...botFields };
        // Keep the original request_id as the stable idempotency key; only
        // adopt this one if the open request has none (created outside ingest).
        if (openRequest.externalId == null) data.externalId = externalId;
        let leadId = openRequest.leadId;
        if (openRequest.leadId == null && lead) {
          data.lead = { connect: { id: lead.id } };
          leadId = lead.id;
        }
        if (
          hasFixedTime &&
          CONTACT_STAGE_ORDER.indexOf(openRequest.status) <
            CONTACT_STAGE_ORDER.indexOf('scheduled')
        ) {
          data.status = 'scheduled';
        }
        const updated = await this.ingestRepository.updateContactRequest(
          openRequest.id,
          data,
        );
        if (leadId) await this.advanceLeadStatus(leadId, 'contact_requested');
        this.logger.log(
          `Folded contact request ${externalId} into open request ` +
            `${updated.id} (${phone})`,
        );
        return {
          id: updated.id,
          created: false,
          leadId: updated.leadId ?? lead?.id ?? null,
        };
      }
    }

    const created = await this.ingestRepository.createContactRequest({
      externalId,
      ...botFields,
      ...(hasFixedTime ? { status: 'scheduled' } : {}),
      ...(lead ? { lead: { connect: { id: lead.id } } } : {}),
    });
    if (lead) await this.advanceLeadStatus(lead.id, 'contact_requested');
    this.logger.log(
      `Ingested contact request ${created.id} (${phone})` +
        (lead ? ` linked to lead ${lead.id}` : ''),
    );
    return { id: created.id, created: true, leadId: lead?.id ?? null };
  }

  /**
   * Advance a lead's salesStatus to `target` only if it hasn't already
   * reached (or passed) that stage — e.g. a contact request coming in always
   * means at least "contact_requested", but never regresses a lead a human
   * has already moved further along (negotiation, won, etc.).
   */
  private async advanceLeadStatus(leadId: number, target: LeadStatus) {
    const lead = await this.ingestRepository.findLeadSalesStatus(leadId);
    if (!lead) return;
    const currentIdx = LEAD_STAGE_ORDER.indexOf(lead.salesStatus);
    const targetIdx = LEAD_STAGE_ORDER.indexOf(target);
    if (currentIdx >= targetIdx) return;

    await this.ingestRepository.updateLead(leadId, { salesStatus: target });
    await this.ingestRepository.addTimelineEvent(
      leadId,
      target === 'contact_requested' ? 'contact_requested' : 'status_changed',
      `Sales status changed from “${lead.salesStatus}” to “${target}” automatically.`,
    );
  }

  /**
   * Upsert a conversation transcript pushed by the bot, keyed by `thread_id`
   * (idempotent). The bot sends the full transcript on every push; we create the
   * conversation on first sight and append only the messages we don't already
   * have (by count — the transcript is ordered and append-only), so retries and
   * re-pushes never duplicate messages. The count deliberately ignores `human`
   * messages, which are ours alone and absent from the bot's transcript — see
   * IngestRepository.countMessages.
   *
   * Human-owned conversation fields (status / assignedToId / botActive /
   * unreadCount / internal notes / handoff) are never written here, so a human's
   * triage in the panel survives a later bot push. Only bot-owned trace fields
   * (channel / language / customerHandle / customerPhone / stage / lastMessageAt,
   * and leadId only while unset) are refreshed.
   */
  async upsertConversation(dto: IngestConversationDto) {
    const threadId = dto.thread_id?.trim();
    if (!threadId) {
      return { skipped: true, reason: 'no thread_id' };
    }

    const channel = this.mapChannel(dto.channel);
    const messages = dto.messages ?? [];
    const phone = dto.phone?.trim() || null;

    const botFields = {
      channel,
      language: this.mapLanguage(dto.language),
      // Prefer the customer's real name once the bot has captured it; fall back
      // to the channel-native sender id. The UI renders this as the thread title
      // (customerHandle ?? customerPhone ?? threadId).
      customerHandle: dto.name?.trim() || dto.user_id?.trim() || null,
      customerPhone: phone,
      stage: dto.stage?.trim() || null,
      // Reuses the same formatter as /ingest/leads, so a conversation's budget
      // always reads identically to the linked lead's.
      budget: this.formatBudget(dto.preferences),
      topProject: dto.top_project?.trim() || null,
      selectedUnits: dto.interested_unit_ids ?? [],
      lastMessageAt: this.parseDate(dto.last_message_at) ?? new Date(),
    };

    const existing =
      await this.ingestRepository.findConversationByThreadId(threadId);

    if (existing) {
      await this.ingestRepository.updateConversation(existing.id, {
        ...botFields,
        // Link to a lead if we didn't have one before (never unlink).
        ...(existing.leadId == null && phone
          ? await this.connectLeadByPhone(phone)
          : {}),
      });

      const have = await this.ingestRepository.countMessages(existing.id);
      const fresh = messages.slice(have);
      if (fresh.length) {
        await this.ingestRepository.addMessages(
          fresh.map((m) => ({
            conversationId: existing.id,
            role: this.mapRole(m.role),
            content: m.content,
            channel,
            createdAt: this.parseDate(m.ts) ?? undefined,
          })),
        );
      }
      if (dto.awaiting_human) {
        await this.handleEscalation(existing.id, threadId, dto);
      }
      return { id: existing.id, created: false, appended: fresh.length };
    }

    const lead = phone
      ? await this.ingestRepository.findLeadByPhoneFuzzy(phone)
      : null;

    const created = await this.ingestRepository.createConversation({
      threadId,
      ...botFields,
      messages: {
        create: messages.map((m) => ({
          role: this.mapRole(m.role),
          content: m.content,
          channel,
          createdAt: this.parseDate(m.ts) ?? undefined,
        })),
      },
      ...(lead ? { lead: { connect: { id: lead.id } } } : {}),
    });
    this.logger.log(
      `Ingested conversation ${created.id} (${threadId}, ${messages.length} msgs)` +
        (lead ? ` linked to lead ${lead.id}` : ''),
    );
    if (dto.awaiting_human) {
      await this.handleEscalation(created.id, threadId, dto);
    }
    return { id: created.id, created: true, appended: messages.length };
  }

  /**
   * The bot reports a live human is needed on this thread (`awaiting_human`).
   * Queue it in the Handoff Queue and pause the bot so a human takes over —
   * mirrors the Bitrix-side handoff, but as a first-class queue item instead
   * of a comment on the CRM lead.
   *
   * Keyed on `awaiting_human`, NOT `escalated`: the latter is a sticky
   * lead-level marker the bot never clears, so acting on it would re-queue a
   * handoff on every subsequent turn forever. `awaiting_human` goes false as
   * soon as an operator resumes the bot, which ends the episode cleanly.
   *
   * A `Handoff` is 1:1 with its conversation (see schema.prisma). If one is
   * already open (new/active/assigned) this is a repeat push for the same live
   * episode and must be a no-op, or it would fight a rep's in-progress triage.
   * A resolved/cancelled handoff means a prior episode wrapped up; a fresh
   * escalation reopens that same row rather than creating a second one.
   */
  private async handleEscalation(
    conversationId: number,
    threadId: string,
    dto: IngestConversationDto,
  ) {
    const existingHandoff =
      await this.ingestRepository.findHandoffByConversationId(conversationId);
    if (
      existingHandoff &&
      OPEN_HANDOFF_STATUSES.includes(
        existingHandoff.status as (typeof OPEN_HANDOFF_STATUSES)[number],
      )
    ) {
      return;
    }

    const reason = this.buildEscalationReason(dto);
    if (existingHandoff) {
      await this.ingestRepository.updateHandoff(existingHandoff.id, {
        status: 'new',
        priority: 'normal',
        slaState: 'on_track',
        reason,
        dueAt: null,
        resolvedAt: null,
        assignedTo: { disconnect: true },
      });
    } else {
      await this.ingestRepository.createHandoff({
        conversation: { connect: { id: conversationId } },
        status: 'new',
        priority: 'normal',
        reason,
      });
    }

    await this.ingestRepository.updateConversation(conversationId, {
      status: 'waiting_for_human',
      botActive: false,
    });
    // The DB write above only moves the panel's own row — the bot keeps replying
    // until it is told. Never write botActive without this call.
    await this.botControlService.setBotActive(threadId, false);
    this.logger.log(`Escalation queued: handoff for conversation ${conversationId}`);
  }

  /** Best-effort human-readable reason: the customer's own last message. */
  private buildEscalationReason(dto: IngestConversationDto): string {
    const messages = dto.messages ?? [];
    const lastUser = [...messages]
      .reverse()
      .find((m) => (m.role ?? '').trim().toLowerCase() === 'user');
    const quote = lastUser?.content?.trim();
    if (!quote) return 'Customer requested a human agent.';
    const trimmed = quote.length > 300 ? `${quote.slice(0, 300)}…` : quote;
    return `Customer requested a human agent: "${trimmed}"`;
  }

  /** Build a lead-connect update fragment via fuzzy phone match, or {} if none. */
  private async connectLeadByPhone(
    phone: string,
  ): Promise<Prisma.ConversationUpdateInput> {
    const lead = await this.ingestRepository.findLeadByPhoneFuzzy(phone);
    return lead ? { lead: { connect: { id: lead.id } } } : {};
  }

  /** The bot sends "user" | "bot" (or "assistant"/"ai"); map to our enum. */
  private mapRole(raw: string | null | undefined): MessageRole {
    const v = (raw ?? '').trim().toLowerCase();
    if (v === 'user') return 'user';
    if (v === 'human') return 'human';
    if (v === 'system') return 'system';
    // "agent" = a human operator's HITL reply on the bot side. The bot's
    // outbox already filters these out of the conversation push (the panel
    // wrote its own `human` copy when the operator hit send), so they should
    // never arrive here. Map to `human` — NOT the `bot` default — as defense
    // in depth: countMessages() excludes `human`, so a leaked agent message
    // can't inflate the bot-message count and desync the append-by-count sync,
    // and it can never again masquerade as a duplicate bot bubble.
    if (v === 'agent') return 'human';
    return 'bot'; // bot | assistant | ai | anything else
  }

  private parseDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  /** The bot sends "phone" | "whatsapp"; fall back to phone for anything else. */
  private mapPreferredChannel(raw: string | null | undefined): Channel {
    return (raw ?? '').trim().toLowerCase() === 'whatsapp'
      ? 'whatsapp'
      : 'phone';
  }

  /**
   * Bot channels already match our enum; anything unexpected falls back to
   * webchat — historically the generic `web` catch-all this replaced was, in
   * practice, always the browser widget anyway (see the 2026-07-20 migration
   * that removed `web` from the Channel enum and backfilled those rows).
   */
  private mapChannel(raw: string | undefined): Channel {
    const value = (raw ?? '').trim().toLowerCase() as Channel;
    return CHANNELS.includes(value) ? value : 'webchat';
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
