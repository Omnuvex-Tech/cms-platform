import { Injectable } from '@nestjs/common';
import { LeadTimelineType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const listInclude = {
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { conversations: true, contactRequests: true } },
};

const detailInclude = {
  owner: { select: { id: true, name: true, email: true } },
  timeline: { orderBy: { createdAt: 'desc' as const } },
  conversations: {
    select: {
      id: true,
      threadId: true,
      channel: true,
      status: true,
      lastMessageAt: true,
    },
  },
  contactRequests: {
    select: {
      id: true,
      customerPhone: true,
      preferredChannel: true,
      status: true,
      availabilityAt: true,
    },
  },
};

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.LeadWhereInput) {
    return this.prisma.lead.findMany({
      where,
      include: listInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  update(id: number, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({
      where: { id },
      data,
      include: detailInclude,
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
