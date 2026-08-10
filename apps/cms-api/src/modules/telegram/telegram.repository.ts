import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

/** Everything the alert message renders, in one read. */
const alertInclude = {
  conversation: {
    select: {
      id: true,
      threadId: true,
      channel: true,
      customerHandle: true,
      customerPhone: true,
      topProject: true,
      budget: true,
      stage: true,
    },
  },
  telegramAlert: true,
};

export type HandoffForAlert = NonNullable<
  Awaited<ReturnType<TelegramRepository['findHandoffForAlert']>>
>;

@Injectable()
export class TelegramRepository {
  constructor(private readonly prisma: PrismaService) {}

  findHandoffForAlert(handoffId: number) {
    return this.prisma.handoff.findUnique({
      where: { id: handoffId },
      include: alertInclude,
    });
  }

  /**
   * Remember (or replace) the posted message for this handoff. A re-escalation
   * reuses the same handoff row, so the previous message's coordinates and the
   * previous episode's claim are overwritten rather than kept.
   */
  saveAlert(
    handoffId: number,
    chatId: string,
    messageId: number,
    body: string,
  ) {
    const fresh = {
      chatId,
      messageId,
      body,
      claimedBy: null,
      claimedAt: null,
      resolvedBy: null,
      resolvedAt: null,
    };
    return this.prisma.telegramAlert.upsert({
      where: { handoffId },
      create: { handoffId, ...fresh },
      update: fresh,
    });
  }

  /**
   * Claim the alert for `by`, but only if nobody has claimed or resolved it —
   * the `null` guards inside `where` make this an atomic compare-and-set, so
   * two people tapping Accept at the same moment produce exactly one winner.
   * Returns true if this caller won.
   */
  async claimAlert(handoffId: number, by: string): Promise<boolean> {
    const { count } = await this.prisma.telegramAlert.updateMany({
      where: { handoffId, claimedAt: null, resolvedAt: null },
      data: { claimedBy: by, claimedAt: new Date() },
    });
    return count === 1;
  }

  /** Same compare-and-set shape: only the first resolve is recorded. */
  async resolveAlert(handoffId: number, by: string | null): Promise<boolean> {
    const { count } = await this.prisma.telegramAlert.updateMany({
      where: { handoffId, resolvedAt: null },
      data: { resolvedBy: by, resolvedAt: new Date() },
    });
    return count === 1;
  }

  findAlert(handoffId: number) {
    return this.prisma.telegramAlert.findUnique({ where: { handoffId } });
  }

  /**
   * A Telegram claim is not tied to a panel account (nobody is asked to link
   * one), so it moves the handoff to `active` — being worked — rather than
   * `assigned`, which means assigned to a specific user. Only a still-open
   * handoff is touched, so a tap that races a panel-side resolve is inert.
   */
  markHandoffActive(handoffId: number) {
    return this.prisma.handoff.updateMany({
      where: { id: handoffId, status: 'new' },
      data: { status: 'active' },
    });
  }

  /** Display name for a panel-side actor, for the "Taken by …" line. */
  async findUserLabel(
    userId: number | null | undefined,
  ): Promise<string | null> {
    if (!userId) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) return null;
    return user.name?.trim() || user.email;
  }
}
