import { Injectable } from '@nestjs/common';
import { LeadTimelineType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  createContactRequest(data: Prisma.ContactRequestCreateInput) {
    return this.prisma.contactRequest.create({ data });
  }

  updateContactRequest(id: number, data: Prisma.ContactRequestUpdateInput) {
    return this.prisma.contactRequest.update({ where: { id }, data });
  }

  createLead(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  updateLead(id: number, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({ where: { id }, data });
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
