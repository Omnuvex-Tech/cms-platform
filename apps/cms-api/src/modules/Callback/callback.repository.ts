import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCallbackDto } from './dto/create-callback.dto';

@Injectable()
export class CallbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.callbackRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateCallbackDto) {
    return this.prisma.callbackRequest.create({ data });
  }

  delete(id: string) {
    return this.prisma.callbackRequest.delete({ where: { id } });
  }
}
