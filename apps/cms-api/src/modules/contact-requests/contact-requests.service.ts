import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRequestStatus, Prisma } from '@prisma/client';
import { ContactRequestsRepository } from './contact-requests.repository';
import {
  AssignContactDto,
  OutcomeDto,
  SetContactStatusDto,
} from './dto/contact-request.dto';

// Requests still awaiting a callback (used to compute overdue/due-today).
const OPEN_STATUSES: ContactRequestStatus[] = ['new', 'assigned', 'scheduled'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class ContactRequestsService {
  constructor(
    private readonly contactRequestsRepository: ContactRequestsRepository,
  ) {}

  async list(status?: ContactRequestStatus) {
    const where: Prisma.ContactRequestWhereInput = {};
    if (status) where.status = status;

    const rows = await this.contactRequestsRepository.findMany(where);
    const now = new Date();
    const todayEnd = endOfToday();
    const todayStart = startOfToday();

    const enriched = rows.map((r) => {
      const open = OPEN_STATUSES.includes(r.status);
      const isOverdue =
        open && !!r.availabilityAt && r.availabilityAt < now;
      const isDueToday =
        open &&
        !!r.availabilityAt &&
        r.availabilityAt >= todayStart &&
        r.availabilityAt <= todayEnd &&
        r.availabilityAt >= now;
      return { ...r, isOverdue, isDueToday };
    });

    // Float overdue to the very top, then due-today, then the rest (by time).
    const rank = (x: { isOverdue: boolean; isDueToday: boolean }) =>
      x.isOverdue ? 0 : x.isDueToday ? 1 : 2;
    enriched.sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const at = a.availabilityAt?.getTime() ?? Infinity;
      const bt = b.availabilityAt?.getTime() ?? Infinity;
      return at - bt;
    });

    return {
      items: enriched,
      overdueCount: enriched.filter((r) => r.isOverdue).length,
      dueTodayCount: enriched.filter((r) => r.isDueToday).length,
    };
  }

  async get(id: number) {
    const request = await this.contactRequestsRepository.findById(id);
    if (!request) throw new NotFoundException('Contact request not found');
    return request;
  }

  async setStatus(id: number, dto: SetContactStatusDto) {
    await this.get(id);
    return this.contactRequestsRepository.update(id, { status: dto.status });
  }

  async assign(id: number, dto: AssignContactDto) {
    const current = await this.get(id);
    const data: Prisma.ContactRequestUpdateInput = {
      owner:
        dto.ownerId == null
          ? { disconnect: true }
          : { connect: { id: dto.ownerId } },
    };
    if (dto.ownerId != null && current.status === 'new') {
      data.status = 'assigned';
    }
    return this.contactRequestsRepository.update(id, data);
  }

  async recordOutcome(id: number, dto: OutcomeDto) {
    await this.get(id);
    return this.contactRequestsRepository.update(id, {
      followUpOutcome: dto.followUpOutcome,
    });
  }
}
