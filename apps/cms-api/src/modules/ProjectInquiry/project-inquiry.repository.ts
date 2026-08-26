import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectInquiryDto } from './dto/create-project-inquiry.dto';

@Injectable()
export class ProjectInquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.projectInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateProjectInquiryDto) {
    return this.prisma.projectInquiry.create({ data });
  }

  delete(id: string) {
    return this.prisma.projectInquiry.delete({ where: { id } });
  }
}
