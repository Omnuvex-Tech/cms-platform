import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const listSelect = {
  id: true,
  threadId: true,
  channel: true,
  language: true,
  status: true,
  customerHandle: true,
  customerPhone: true,
  stage: true,
  botActive: true,
  unreadCount: true,
  lastMessageAt: true,
  assignedTo: { select: { id: true, name: true, email: true } },
  leadId: true,
};

const detailInclude = {
  messages: { orderBy: { createdAt: 'asc' as const } },
  notes: {
    orderBy: { createdAt: 'desc' as const },
    include: { author: { select: { id: true, name: true } } },
  },
  assignedTo: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, salesStatus: true, temperature: true } },
  handoff: { select: { id: true, status: true, priority: true } },
};

@Injectable()
export class ConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.ConversationWhereInput) {
    return this.prisma.conversation.findMany({
      where,
      select: listSelect,
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  addMessage(data: Prisma.MessageUncheckedCreateInput) {
    return this.prisma.message.create({ data });
  }

  update(id: number, data: Prisma.ConversationUpdateInput) {
    return this.prisma.conversation.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }

  addNote(data: Prisma.InternalNoteUncheckedCreateInput) {
    return this.prisma.internalNote.create({
      data,
      include: { author: { select: { id: true, name: true } } },
    });
  }

  deleteNote(id: number) {
    return this.prisma.internalNote.delete({ where: { id } });
  }

  countByStatus() {
    return this.prisma.conversation.count({
      where: {
        status: { in: ['active', 'waiting_for_human', 'assigned'] },
        unreadCount: { gt: 0 },
      },
    });
  }
}
