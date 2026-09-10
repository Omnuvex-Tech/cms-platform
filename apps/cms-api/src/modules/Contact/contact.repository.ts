import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(dto: CreateContactSubmissionDto) {
    return this.prisma.contactSubmission.create({ data: dto });
  }

  async findAllSubmissions() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSubmission(id: number) {
    return this.prisma.contactSubmission.findUnique({ where: { id } });
  }

  async deleteSubmission(id: number) {
    return this.prisma.contactSubmission.delete({ where: { id } });
  }
}
