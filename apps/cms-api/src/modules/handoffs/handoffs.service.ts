import { Injectable, NotFoundException } from '@nestjs/common';
import { HandoffStatus, Prisma } from '@prisma/client';
import { HandoffsRepository } from './handoffs.repository';
import { BotControlService } from '../conversations/bot-control.service';
import { BotAction, BotControlDto, HandoffNotesDto } from './dto/handoff.dto';

const OPEN_STATUSES: HandoffStatus[] = ['new', 'active', 'assigned'];

@Injectable()
export class HandoffsService {
  constructor(
    private readonly handoffsRepository: HandoffsRepository,
    private readonly botControlService: BotControlService,
  ) {}

  list(status?: HandoffStatus | 'open') {
    const where: Prisma.HandoffWhereInput = {};
    if (status && status !== 'open') {
      where.status = status;
    } else {
      // Default view: the open work queue.
      where.status = { in: OPEN_STATUSES };
    }
    return this.handoffsRepository.findMany(where);
  }

  async get(id: number) {
    const handoff = await this.handoffsRepository.findById(id);
    if (!handoff) throw new NotFoundException('Handoff not found');
    return handoff;
  }

  /** Accept a handoff: assign it to the rep and pause the bot on the thread. */
  async accept(id: number, userId: number) {
    const handoff = await this.get(id);
    await this.handoffsRepository.updateConversation(handoff.conversationId, {
      botActive: false,
      status: 'assigned',
      assignedTo: { connect: { id: userId } },
    });
    await this.pushBotState(handoff.conversation.threadId, false);
    return this.handoffsRepository.update(id, {
      status: 'assigned',
      assignedTo: { connect: { id: userId } },
    });
  }

  async botControl(id: number, dto: BotControlDto) {
    const handoff = await this.get(id);

    if (dto.action === BotAction.pause) {
      await this.handoffsRepository.updateConversation(handoff.conversationId, {
        botActive: false,
      });
      await this.pushBotState(handoff.conversation.threadId, false);
      return this.get(id);
    }

    if (dto.action === BotAction.resume) {
      await this.handoffsRepository.updateConversation(handoff.conversationId, {
        botActive: true,
      });
      await this.pushBotState(handoff.conversation.threadId, true);
      return this.get(id);
    }

    // return_to_bot: reactivate the conversation, clear the assignee, resolve.
    await this.handoffsRepository.updateConversation(handoff.conversationId, {
      botActive: true,
      status: 'active',
      assignedTo: { disconnect: true },
    });
    await this.pushBotState(handoff.conversation.threadId, true);
    return this.handoffsRepository.update(id, {
      status: 'resolved',
      resolvedAt: new Date(),
      assignedTo: { disconnect: true },
    });
  }

  /** Resolve a handoff and hand the thread back to the bot (mirrors return_to_bot). */
  async resolve(id: number) {
    const handoff = await this.get(id);
    await this.handoffsRepository.updateConversation(handoff.conversationId, {
      botActive: true,
      status: 'active',
    });
    await this.pushBotState(handoff.conversation.threadId, true);
    return this.handoffsRepository.update(id, {
      status: 'resolved',
      resolvedAt: new Date(),
    });
  }

  /**
   * Tell the BOT about a pause/resume. Updating `Conversation.botActive` alone is
   * a panel-only write the bot never sees — it would keep replying while this page
   * showed it as paused. Resuming also clears the bot's escalation gate, which is
   * what lets a thread leave the queue for good.
   */
  private pushBotState(threadId: string | null | undefined, active: boolean) {
    return this.botControlService.setBotActive(threadId, active);
  }

  async setNotes(id: number, dto: HandoffNotesDto) {
    await this.get(id);
    return this.handoffsRepository.update(id, { notes: dto.notes });
  }
}
