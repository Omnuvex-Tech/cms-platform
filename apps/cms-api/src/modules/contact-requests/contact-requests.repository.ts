import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const listInclude = {
  owner: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, salesStatus: true, temperature: true } },
  conversation: { select: { id: true, threadId: true } },
};

const detailInclude = {
  owner: { select: { id: true, name: true, email: true } },
  conversation: { select: { id: true, threadId: true, channel: true } },
  lead: true,
};

@Injectable()
export class ContactRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.ContactRequestWhereInput) {
    return this.prisma.contactRequest.findMany({
      where,
      include: listInclude,
      orderBy: { availabilityAt: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.contactRequest.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  update(id: number, data: Prisma.ContactRequestUpdateInput) {
    return this.prisma.contactRequest.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }
}
