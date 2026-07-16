import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationStatus, Channel, Prisma } from '@prisma/client';
import { ConversationsRepository } from './conversations.repository';
import { BotControlService } from './bot-control.service';
import {
  AddNoteDto,
  AssignDto,
  ReplyDto,
  SetBotDto,
  SetStatusDto,
} from './dto/conversation.dto';

interface ListFilters {
  search?: string;
  status?: ConversationStatus;
  channel?: Channel;
  assignedToId?: number;
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly botControlService: BotControlService,
  ) {}

  list(filters: ListFilters) {
    const where: Prisma.ConversationWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.channel) where.channel = filters.channel;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.search) {
      where.OR = [
        { threadId: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search, mode: 'insensitive' } },
        { customerHandle: { contains: filters.search, mode: 'insensitive' } },
        { messages: { some: { content: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }
    return this.conversationsRepository.findMany(where);
  }

  async get(id: number) {
    const conversation = await this.conversationsRepository.findById(id);
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async reply(id: number, dto: ReplyDto) {
    const conversation = await this.get(id);
    await this.conversationsRepository.addMessage({
      conversationId: id,
      role: 'human',
      content: dto.content,
      channel: conversation.channel,
    });
    return this.conversationsRepository.update(id, {
      lastMessageAt: new Date(),
      unreadCount: 0,
    });
  }

  async setStatus(id: number, dto: SetStatusDto) {
    await this.get(id);
    return this.conversationsRepository.update(id, { status: dto.status });
  }

  async assign(id: number, dto: AssignDto) {
    const current = await this.get(id);
    const data: Prisma.ConversationUpdateInput = {
      assignedTo:
        dto.assignedToId == null
          ? { disconnect: true }
          : { connect: { id: dto.assignedToId } },
    };
    // Assigning a live thread moves it into the "assigned" status.
    if (
      dto.assignedToId != null &&
      (current.status === 'active' || current.status === 'waiting_for_human')
    ) {
      data.status = 'assigned';
    }
    return this.conversationsRepository.update(id, data);
  }

  async addNote(id: number, dto: AddNoteDto, authorId?: number) {
    await this.get(id);
    await this.conversationsRepository.addNote({
      conversationId: id,
      authorId: authorId ?? null,
      body: dto.body,
    });
    return this.get(id);
  }

  async deleteNote(id: number, noteId: number) {
    await this.conversationsRepository.deleteNote(noteId);
    return this.get(id);
  }

  async setBot(id: number, dto: SetBotDto) {
    const conversation = await this.get(id);
    const updated = await this.conversationsRepository.update(id, {
      botActive: dto.active,
    });
    // Fire-and-forget: tell the bot to actually stop/resume replying on this
    // thread. A bot outage must never break the panel's toggle action.
    void this.botControlService.setBotActive(conversation.threadId, dto.active);
    return updated;
  }
}
