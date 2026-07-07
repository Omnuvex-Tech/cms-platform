import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

/** Live counters for the sidebar badges. */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async badges() {
    const now = new Date();

    const [conversations, handoffs, contactRequestsOpen, overdue, newLeads] =
      await Promise.all([
        this.prisma.conversation.count({
          where: {
            status: { in: ['active', 'waiting_for_human', 'assigned'] },
            unreadCount: { gt: 0 },
          },
        }),
        this.prisma.handoff.count({
          where: { status: { in: ['new', 'active', 'assigned'] } },
        }),
        this.prisma.contactRequest.count({
          where: { status: { in: ['new', 'assigned', 'scheduled'] } },
        }),
        this.prisma.contactRequest.count({
          where: {
            status: { in: ['new', 'assigned', 'scheduled'] },
            availabilityAt: { lt: now },
          },
        }),
        this.prisma.lead.count({ where: { salesStatus: 'new' } }),
      ]);

    return {
      conversations,
      handoffs,
      contactRequests: contactRequestsOpen,
      contactRequestsOverdue: overdue,
      leads: newLeads,
    };
  }
}
