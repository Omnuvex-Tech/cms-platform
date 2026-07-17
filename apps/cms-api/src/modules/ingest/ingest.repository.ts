import {
  ContactRequestStatus,
  LeadTimelineType,
  Prisma,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Requests still awaiting a callback. A repeat push for the same phone folds
// into one of these; once a request is completed/closed it becomes history and
// a later push starts a fresh row. Mirrors OPEN_STATUSES in the contact-requests
// service.
const OPEN_CONTACT_STATUSES: ContactRequestStatus[] = [
  'new',
  'assigned',
  'scheduled',
];

@Injectable()
export class IngestRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The bot is the single writer for ingested leads and sends a stable `phone`
   * string per lead, so an exact-phone match is a reliable idempotency key.
   */
  findLeadByPhone(phone: string) {
    return this.prisma.lead.findFirst({ where: { phone } });
  }

  /**
   * Fuzzy phone match for linking a contact request to its lead. The bot may
   * store the phone in a different format on the lead vs. the contact request
   * (e.g. "+994513879613" vs "0513879613"), so match on the national-significant
   * tail (last 9 digits) rather than the exact string.
   */
  findLeadByPhoneFuzzy(phone: string) {
    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length < 6) return Promise.resolve(null);
    const tail = digits.length > 9 ? digits.slice(-9) : digits;
    return this.prisma.lead.findFirst({
      where: { phone: { contains: tail } },
      orderBy: { id: 'desc' },
    });
  }

  findContactRequestByExternalId(externalId: string) {
    return this.prisma.contactRequest.findUnique({ where: { externalId } });
  }

  /**
   * Find a still-open contact request for the same customer, so a repeat push
   * with a different `request_id` folds into the live request instead of
   * creating a duplicate. Uses the same national-significant-tail (last 9
   * digits) match as `findLeadByPhoneFuzzy` because the phone may be formatted
   * differently across pushes. Only open requests match; a completed/closed
   * request is left as history and a new push starts a fresh row.
   */
  findOpenContactRequestByPhone(phone: string) {
    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length < 6) return Promise.resolve(null);
    const tail = digits.length > 9 ? digits.slice(-9) : digits;
    return this.prisma.contactRequest.findFirst({
      where: {
        customerPhone: { contains: tail },
        status: { in: OPEN_CONTACT_STATUSES },
      },
      orderBy: { id: 'desc' },
    });
  }

  createContactRequest(data: Prisma.ContactRequestCreateInput) {
    return this.prisma.contactRequest.create({ data });
  }

  updateContactRequest(id: number, data: Prisma.ContactRequestUpdateInput) {
    return this.prisma.contactRequest.update({ where: { id }, data });
  }

  findConversationByThreadId(threadId: string) {
    return this.prisma.conversation.findUnique({ where: { threadId } });
  }

  createConversation(data: Prisma.ConversationCreateInput) {
    return this.prisma.conversation.create({ data });
  }

  updateConversation(id: number, data: Prisma.ConversationUpdateInput) {
    return this.prisma.conversation.update({ where: { id }, data });
  }

  findHandoffByConversationId(conversationId: number) {
    return this.prisma.handoff.findUnique({ where: { conversationId } });
  }

  createHandoff(data: Prisma.HandoffCreateInput) {
    return this.prisma.handoff.create({ data });
  }

  updateHandoff(id: number, data: Prisma.HandoffUpdateInput) {
    return this.prisma.handoff.update({ where: { id }, data });
  }

  /**
   * How many of this conversation's messages came from the bot's transcript.
   *
   * Excludes `human` — an operator's reply is written straight to our DB by
   * ConversationsService.reply() and is deliberately never recorded into the
   * bot's message_store, so it does not exist in the transcript the bot pushes.
   * Counting it would run this number ahead of the bot's transcript length and
   * make the caller's `messages.slice(count)` silently discard exactly that many
   * real customer messages, permanently, for the rest of the conversation.
   */
  countMessages(conversationId: number) {
    return this.prisma.message.count({
      where: { conversationId, role: { not: 'human' } },
    });
  }

  addMessages(data: Prisma.MessageCreateManyInput[]) {
    return this.prisma.message.createMany({ data });
  }

  createLead(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  updateLead(id: number, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  findLeadSalesStatus(id: number) {
    return this.prisma.lead.findUnique({
      where: { id },
      select: { salesStatus: true },
    });
  }

  addTimelineEvent(
    leadId: number,
    type: LeadTimelineType,
    description: string,
  ) {
    return this.prisma.leadTimelineEvent.create({
      data: { leadId, type, description },
    });
  }
}
