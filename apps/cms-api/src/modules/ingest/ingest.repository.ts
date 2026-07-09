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
