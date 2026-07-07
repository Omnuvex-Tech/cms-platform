import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const listInclude = {
  conversation: {
    select: {
      id: true,
      threadId: true,
      channel: true,
      customerHandle: true,
      customerPhone: true,
      status: true,
      botActive: true,
      leadId: true,
    },
  },
  assignedTo: { select: { id: true, name: true, email: true } },
};

const detailInclude = {
  conversation: {
    include: {
      messages: { orderBy: { createdAt: 'asc' as const } },
      lead: { select: { id: true, salesStatus: true, temperature: true } },
    },
  },
  assignedTo: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class HandoffsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.HandoffWhereInput) {
    return this.prisma.handoff.findMany({
      where,
      include: listInclude,
      // urgent -> high -> normal (enum defined ascending), then oldest first.
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  findById(id: number) {
    return this.prisma.handoff.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  update(id: number, data: Prisma.HandoffUpdateInput) {
    return this.prisma.handoff.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }

  updateConversation(id: number, data: Prisma.ConversationUpdateInput) {
    return this.prisma.conversation.update({ where: { id }, data });
  }

  countOpen() {
    return this.prisma.handoff.count({
      where: { status: { in: ['new', 'active', 'assigned'] } },
    });
  }
}
