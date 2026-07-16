import { Injectable, Logger } from '@nestjs/common';
import { Channel, Language, Prisma } from '@prisma/client';
import { IngestRepository } from './ingest.repository';
import { IngestLeadDto } from './dto/ingest-lead.dto';
import { IngestContactRequestDto } from './dto/ingest-contact-request.dto';

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

    const botFields = {
      customerPhone: phone,
      preferredChannel: this.mapPreferredChannel(dto.preferred_channel),
      availabilityAt,
      availabilityText: dto.availability_text?.trim() || null,
      isFlexible: dto.availability_flexible ?? false,
      customerWords: (dto.latest_user_message ?? dto.notes)?.trim() || null,
    };

    const existing =
      await this.ingestRepository.findContactRequestByExternalId(externalId);

    if (existing) {
      // Re-link to a lead if we didn't have one before (never unlink).
      const data: Prisma.ContactRequestUpdateInput = { ...botFields };
      if (existing.leadId == null && phone) {
        const lead = await this.ingestRepository.findLeadByPhoneFuzzy(phone);
        if (lead) data.lead = { connect: { id: lead.id } };
      }
      const updated = await this.ingestRepository.updateContactRequest(
        existing.id,
        data,
      );
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
        if (openRequest.leadId == null && lead) {
          data.lead = { connect: { id: lead.id } };
        }
        const updated = await this.ingestRepository.updateContactRequest(
          openRequest.id,
          data,
        );
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
      ...(lead ? { lead: { connect: { id: lead.id } } } : {}),
    });
    this.logger.log(
      `Ingested contact request ${created.id} (${phone})` +
        (lead ? ` linked to lead ${lead.id}` : ''),
    );
    return { id: created.id, created: true, leadId: lead?.id ?? null };
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
