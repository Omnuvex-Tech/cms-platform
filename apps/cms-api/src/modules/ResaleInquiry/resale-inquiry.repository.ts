import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResaleInquiryDto } from './dto/create-resale-inquiry.dto';

@Injectable()
export class ResaleInquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.resaleInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateResaleInquiryDto) {
    return this.prisma.resaleInquiry.create({ data });
  }

  delete(id: string) {
    return this.prisma.resaleInquiry.delete({ where: { id } });
  }
}
