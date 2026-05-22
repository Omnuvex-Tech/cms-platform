import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Section
  findSection() {
    return this.prisma.testimonialsSection.findFirst({
      include: { testimonials: { orderBy: { order: 'asc' } } },
    });
  }

  createSection(dto: CreateSectionDto) {
    return this.prisma.testimonialsSection.create({ data: dto });
  }

  updateSection(id: number, dto: UpdateSectionDto) {
    return this.prisma.testimonialsSection.update({ where: { id }, data: dto });
  }

  // Testimonials
  findAllTestimonials(sectionId: number) {
    return this.prisma.testimonial.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });
  }

  findOneTestimonial(id: number) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  createTestimonial(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data: dto });
  }

  updateTestimonial(id: number, dto: UpdateTestimonialDto) {
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  deleteTestimonial(id: number) {
    return this.prisma.testimonial.delete({ where: { id } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.testimonial.update({
        where: { id },
        data: { order: index },
      })
    );
    return this.prisma.$transaction(updates);
  }
}