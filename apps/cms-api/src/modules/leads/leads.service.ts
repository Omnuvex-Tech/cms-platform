import { Injectable, NotFoundException } from '@nestjs/common';
import { Channel, LeadStatus, Prisma, Temperature } from '@prisma/client';
import { LeadsRepository } from './leads.repository';
import { UpdateLeadDto } from './dto/lead.dto';

interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  temperature?: Temperature;
  channel?: Channel;
}

// The pipeline a lead moves through. Mirrors LEAD_STAGE_ORDER in
// ingest.service.ts — kept separate since each side reaches it from a
// different signal (bot ingest vs. panel actions) and duplicating a short
// array is cheaper than a shared module for two call sites.
const LEAD_STAGE_ORDER: LeadStatus[] = [
  'new',
  'qualified',
  'contact_requested',
  'assigned',
  'in_follow_up',
  'visit_scheduled',
  'negotiation',
  'won',
  'lost',
  'invalid',
];

@Injectable()
export class LeadsService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

  private buildWhere(filters: LeadFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};
    if (filters.status) where.salesStatus = filters.status;
    if (filters.temperature) where.temperature = filters.temperature;
    if (filters.channel) where.channel = filters.channel;
    if (filters.search) {
      where.OR = [
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { threadId: { contains: filters.search, mode: 'insensitive' } },
        { topProject: { contains: filters.search, mode: 'insensitive' } },
        { botNotes: { contains: filters.search, mode: 'insensitive' } },
        { nextAction: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  list(filters: LeadFilters) {
    return this.leadsRepository.findMany(this.buildWhere(filters));
  }

  async get(id: number) {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: number, dto: UpdateLeadDto) {
    const current = await this.get(id);

    const data: Prisma.LeadUpdateInput = {};
    if (dto.temperature) data.temperature = dto.temperature;
    if (dto.nextAction !== undefined) data.nextAction = dto.nextAction;
    if (dto.salesStatus) data.salesStatus = dto.salesStatus;
    if (dto.ownerId !== undefined) {
      data.owner =
        dto.ownerId == null
          ? { disconnect: true }
          : { connect: { id: dto.ownerId } };
    }

    // Assigning an owner is itself the "assigned" signal — don't also make the
    // rep flip the status dropdown by hand. Only kicks in when the rep didn't
    // already set an explicit status in the same request, and never regresses
    // a stage the lead has already passed.
    let nextStatus = dto.salesStatus;
    if (!nextStatus && dto.ownerId != null) {
      const currentIdx = LEAD_STAGE_ORDER.indexOf(current.salesStatus);
      const assignedIdx = LEAD_STAGE_ORDER.indexOf('assigned');
      if (currentIdx < assignedIdx) {
        nextStatus = 'assigned';
        data.salesStatus = nextStatus;
      }
    }

    // Append a timeline event automatically when the sales status changes.
    if (nextStatus && nextStatus !== current.salesStatus) {
      await this.leadsRepository.addTimelineEvent(
        id,
        'status_changed',
        `Sales status changed from “${current.salesStatus}” to “${nextStatus}”.`,
      );
    }

    return this.leadsRepository.update(id, data);
  }

  async exportCsv(filters: LeadFilters): Promise<string> {
    const leads = await this.leadsRepository.findMany(this.buildWhere(filters));
    const header = [
      'id',
      'phone',
      'threadId',
      'channel',
      'topProject',
      'budget',
      'salesStatus',
      'temperature',
      'owner',
      'language',
      'interestedProjects',
      'nextAction',
      'updatedAt',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = leads.map((l) =>
      [
        l.id,
        l.phone,
        l.threadId,
        l.channel,
        l.topProject,
        l.budget,
        l.salesStatus,
        l.temperature,
        l.owner?.name ?? l.owner?.email ?? '',
        l.language,
        l.interestedProjects.join(' | '),
        l.nextAction,
        l.updatedAt.toISOString(),
      ]
        .map(escape)
        .join(','),
    );
    return [header.join(','), ...rows].join('\n');
  }
}
