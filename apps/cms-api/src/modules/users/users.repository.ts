import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const publicSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  isActive: true,
  lastActivityAt: true,
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: publicSelect,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, select: publicSelect });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: publicSelect,
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id }, select: { id: true } });
  }

  async countAdmins() {
    return this.prisma.user.count({ where: { role: 'admin', isActive: true } });
  }

  /**
   * Work this user still owns. Every one of these relations is a nullable FK
   * with no cascade, so deleting would either fail at the DB or silently
   * orphan records — we check first and steer the admin to deactivation.
   */
  async countAssignedRecords(id: number) {
    const [conversations, handoffs, contactRequests, leads, notes] =
      await this.prisma.$transaction([
        this.prisma.conversation.count({ where: { assignedToId: id } }),
        this.prisma.handoff.count({ where: { assignedToId: id } }),
        this.prisma.contactRequest.count({ where: { ownerId: id } }),
        this.prisma.lead.count({ where: { ownerId: id } }),
        this.prisma.internalNote.count({ where: { authorId: id } }),
      ]);

    return {
      conversations,
      handoffs,
      contactRequests,
      leads,
      notes,
      total: conversations + handoffs + contactRequests + leads + notes,
    };
  }
}
