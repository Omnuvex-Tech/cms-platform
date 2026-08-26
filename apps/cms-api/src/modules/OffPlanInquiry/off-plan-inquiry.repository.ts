import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOffPlanInquiryDto } from './dto/create-off-plan-inquiry.dto';

@Injectable()
export class OffPlanInquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.offPlanInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateOffPlanInquiryDto) {
    return this.prisma.offPlanInquiry.create({ data });
  }

  delete(id: string) {
    return this.prisma.offPlanInquiry.delete({ where: { id } });
  }
}
