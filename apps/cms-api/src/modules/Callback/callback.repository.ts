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

  // role is required by the CallbackRequest table; CreateCallbackDto.role is
  // optional at the DTO/validation layer (homepage CTA omits it), so the
  // service defaults it before calling this method — enforce that here too.
  create(data: CreateCallbackDto & { role: string }) {
    return this.prisma.callbackRequest.create({ data });
  }

  delete(id: string) {
    return this.prisma.callbackRequest.delete({ where: { id } });
  }
}
