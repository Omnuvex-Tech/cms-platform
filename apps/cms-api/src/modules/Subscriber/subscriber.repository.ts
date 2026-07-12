import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string }) {
    return this.prisma.subscriber.upsert({
      where: { email: data.email },
      update: { isActive: true },
      create: { email: data.email },
    });
  }

  async findAll() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async unsubscribe(email: string) {
    return this.prisma.subscriber.update({
      where: { email },
      data: { isActive: false },
    });
  }
}
