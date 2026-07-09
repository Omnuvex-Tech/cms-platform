import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialsRepository } from './testimonials.repository';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ReorderTestimonialDto } from './dto/reorder-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly repo: TestimonialsRepository) {}
  findSection() {
    return this.repo.findSection();
  }

  createSection(dto: CreateSectionDto) {
    return this.repo.createSection(dto);
  }

  async updateSection(id: number, dto: UpdateSectionDto) {
    const section = await this.repo.findSection();
    if (!section) throw new NotFoundException('Section tapılmadı');
    return this.repo.updateSection(id, dto);
  }

  async findOneTestimonial(id: number) {
    const t = await this.repo.findOneTestimonial(id);
    if (!t) throw new NotFoundException('Testimonial tapılmadı');
    return t;
  }

  createTestimonial(dto: CreateTestimonialDto) {
    return this.repo.createTestimonial(dto);
  }

  async updateTestimonial(id: number, dto: UpdateTestimonialDto) {
    await this.findOneTestimonial(id);
    return this.repo.updateTestimonial(id, dto);
  }

  async deleteTestimonial(id: number) {
    await this.findOneTestimonial(id);
    return this.repo.deleteTestimonial(id);
  }

  reorder(dto: ReorderTestimonialDto) {
    return this.repo.reorder(dto.ids);
  }
}