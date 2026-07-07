import { Injectable, NotFoundException } from '@nestjs/common';
import { HandoffStatus, Prisma } from '@prisma/client';
import { HandoffsRepository } from './handoffs.repository';
import { BotAction, BotControlDto, HandoffNotesDto } from './dto/handoff.dto';

const OPEN_STATUSES: HandoffStatus[] = ['new', 'active', 'assigned'];

@Injectable()
export class HandoffsService {
  constructor(private readonly handoffsRepository: HandoffsRepository) {}

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
      return this.get(id);
    }

    if (dto.action === BotAction.resume) {
      await this.handoffsRepository.updateConversation(handoff.conversationId, {
        botActive: true,
      });
      return this.get(id);
    }

    // return_to_bot: reactivate the conversation, clear the assignee, resolve.
    await this.handoffsRepository.updateConversation(handoff.conversationId, {
      botActive: true,
      status: 'active',
      assignedTo: { disconnect: true },
    });
    return this.handoffsRepository.update(id, {
      status: 'resolved',
      resolvedAt: new Date(),
      assignedTo: { disconnect: true },
    });
  }

  async resolve(id: number) {
    await this.get(id);
    return this.handoffsRepository.update(id, {
      status: 'resolved',
      resolvedAt: new Date(),
    });
  }

  async setNotes(id: number, dto: HandoffNotesDto) {
    await this.get(id);
    return this.handoffsRepository.update(id, { notes: dto.notes });
  }
}
