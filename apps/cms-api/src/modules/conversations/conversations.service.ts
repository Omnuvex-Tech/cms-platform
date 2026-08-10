import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationStatus, Channel, Prisma } from '@prisma/client';
import { ConversationsRepository } from './conversations.repository';
import { BotControlService } from './bot-control.service';
import { TelegramAlertsService } from '../telegram/telegram-alerts.service';
import {
  AddNoteDto,
  AssignDto,
  ExportThreadsDto,
  ReplyDto,
  SetBotDto,
  SetStatusDto,
} from './dto/conversation.dto';
import {
  buildBundleExport,
  buildSingleExport,
  ExportFile,
  ExportFormat,
} from './conversation-export';

interface ListFilters {
  search?: string;
  status?: ConversationStatus;
  channel?: Channel;
  assignedToId?: number;
}

/**
 * A bundle export pulls every message of every matching thread into memory, so
 * "all time" on a busy inbox is capped instead of being allowed to OOM the API.
 * The export reports the cut so nobody analyses a silently trimmed file.
 */
const EXPORT_MAX_CONVERSATIONS = 500;

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly botControlService: BotControlService,
    private readonly telegramAlerts: TelegramAlertsService,
  ) {}

  private buildWhere(filters: ListFilters): Prisma.ConversationWhereInput {
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
    return where;
  }

  list(filters: ListFilters) {
    return this.conversationsRepository.findMany(this.buildWhere(filters));
  }

  async get(id: number) {
    const conversation = await this.conversationsRepository.findById(id);
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async reply(id: number, dto: ReplyDto) {
    const conversation = await this.get(id);
    // A human and the bot must never reply over each other on the same
    // thread — require the operator to pause the bot before sending manually.
    if (conversation.botActive) {
      throw new BadRequestException('Pause the bot before replying manually.');
    }
    await this.conversationsRepository.addMessage({
      conversationId: id,
      role: 'human',
      content: dto.content,
      channel: conversation.channel,
    });
    const updated = await this.conversationsRepository.update(id, {
      lastMessageAt: new Date(),
      unreadCount: 0,
    });
    // Fire-and-forget: push the reply to the bot so it reaches the customer.
    // A bot outage must never break the panel's reply action.
    void this.botControlService.sendMessage(
      conversation.threadId,
      conversation.channel,
      dto.content,
    );
    return updated;
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

  async setBot(id: number, dto: SetBotDto, userId?: number) {
    const conversation = await this.get(id);
    const data: Prisma.ConversationUpdateInput = { botActive: dto.active };
    // Resuming the bot ends the human's turn on this thread, so it also ends the
    // handoff — an operator who wraps up here should not have to go to the Handoff
    // Queue and resolve it a second time (and vice versa: resolving there resumes
    // the bot). Mirrors HandoffsService.resolve / return_to_bot.
    if (dto.active && conversation.status === 'waiting_for_human') {
      data.status = 'active';
    }
    const updated = await this.conversationsRepository.update(id, data);
    if (dto.active) {
      // Read the handoff id before closing it: the Telegram alert is keyed by
      // handoff, and resolveOpenHandoff only reports how many rows it touched.
      const open = await this.conversationsRepository.findOpenHandoffId(id);
      await this.conversationsRepository.resolveOpenHandoff(id);
      if (open) void this.telegramAlerts.markResolved(open.id, { userId });
    }
    // Fire-and-forget: tell the bot to actually stop/resume replying on this
    // thread (a resume also clears its escalation gate). A bot outage must never
    // break the panel's toggle action.
    void this.botControlService.setBotActive(conversation.threadId, dto.active);
    return updated;
  }

  /**
   * Accepts `YYYY-MM-DD` or a full ISO timestamp. A bare date is widened to the
   * edge of that UTC day so `?since=2026-07-01&until=2026-07-31` covers all of
   * July rather than stopping at midnight on the 31st.
   */
  private parseBoundary(
    value: string | undefined,
    edge: 'start' | 'end',
  ): Date | undefined {
    if (!value) return undefined;
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const parsed = new Date(
      dateOnly
        ? `${value}T${edge === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`
        : value,
    );
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }
    return parsed;
  }

  async exportOne(id: number, format: ExportFormat): Promise<ExportFile> {
    const conversation =
      await this.conversationsRepository.findByIdForExport(id);
    if (!conversation) throw new NotFoundException('Conversation not found');
    return buildSingleExport(conversation, format);
  }

  async exportMany(dto: ExportThreadsDto): Promise<ExportFile> {
    // html is the default: it's the format a non-technical reader can actually
    // open, so a caller that doesn't specify one should get that, not the
    // markdown a browser or Notepad would otherwise show as raw `**`/`>` text.
    const format = dto.format ?? 'html';
    const since = this.parseBoundary(dto.since, 'start');
    const until = this.parseBoundary(dto.until, 'end');
    if (since && until && since > until) {
      throw new BadRequestException('`since` must not be after `until`.');
    }

    const where = this.buildWhere({
      search: dto.search,
      status: dto.status,
      channel: dto.channel,
      assignedToId: dto.assignedToId ? Number(dto.assignedToId) : undefined,
    });
    // Ranged on last activity, not creation: the operator asking for "the last
    // week" wants the threads that were live that week, including long-running
    // ones that opened earlier.
    if (since || until) {
      where.lastMessageAt = {
        ...(since ? { gte: since } : {}),
        ...(until ? { lte: until } : {}),
      };
    }

    // One extra row is the truncation probe — if it comes back, there was more.
    const rows = await this.conversationsRepository.findManyForExport(
      where,
      EXPORT_MAX_CONVERSATIONS + 1,
    );
    const truncated = rows.length > EXPORT_MAX_CONVERSATIONS;

    return buildBundleExport(
      truncated ? rows.slice(0, EXPORT_MAX_CONVERSATIONS) : rows,
      format,
      {
        since,
        until,
        filters: {
          search: dto.search,
          status: dto.status,
          channel: dto.channel,
          assignedToId: dto.assignedToId,
        },
        truncated,
        limit: EXPORT_MAX_CONVERSATIONS,
      },
    );
  }
}
