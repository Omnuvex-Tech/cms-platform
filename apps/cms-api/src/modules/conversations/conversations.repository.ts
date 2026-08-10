import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { exportInclude } from './conversation-export';

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

  findByIdForExport(id: number) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: exportInclude,
    });
  }

  /**
   * Full threads (every message + note) for a download. `take` is required by
   * the caller rather than optional: this pulls whole transcripts into memory,
   * so an unbounded "all time" export on a busy inbox must not be one typo away.
   */
  findManyForExport(where: Prisma.ConversationWhereInput, take: number) {
    return this.prisma.conversation.findMany({
      where,
      include: exportInclude,
      orderBy: { lastMessageAt: 'desc' },
      take,
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

  /**
   * Close any open handoff on this conversation. Called when the bot is resumed
   * from the Conversations page: handing the thread back to the bot IS the end of
   * the handoff, and leaving the queue item open would strand it there forever
   * just because the operator finished up on this page instead of that one.
   *
   * `updateMany` so a conversation with no handoff is a silent no-op rather than
   * a "record not found" throw. Reaches the Handoff table via Prisma rather than
   * HandoffsService because HandoffsModule already imports ConversationsModule
   * (for BotControlService) — injecting it back would be a circular dependency.
   */
  resolveOpenHandoff(conversationId: number) {
    return this.prisma.handoff.updateMany({
      where: { conversationId, status: { in: ['new', 'active', 'assigned'] } },
      data: { status: 'resolved', resolvedAt: new Date(), assignedToId: null },
    });
  }

  /**
   * The id of the open handoff resolveOpenHandoff is about to close, read
   * beforehand because `updateMany` reports only a count — and the Telegram
   * alert has to be edited by handoff id.
   */
  findOpenHandoffId(conversationId: number) {
    return this.prisma.handoff.findFirst({
      where: { conversationId, status: { in: ['new', 'active', 'assigned'] } },
      select: { id: true },
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
