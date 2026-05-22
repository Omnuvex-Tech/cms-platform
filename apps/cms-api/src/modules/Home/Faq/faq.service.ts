import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqRepository } from './faq.repository';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ReorderFaqDto } from './dto/reorder-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly faqRepository: FaqRepository) {}

  findAll() {
    return this.faqRepository.findAll();
  }

  findAllVisible() {
    return this.faqRepository.findAllVisible();
  }

  async findOne(id: number) {
    const faq = await this.faqRepository.findOne(id);
    if (!faq) throw new NotFoundException('FAQ tapılmadı');
    return faq;
  }

  create(dto: CreateFaqDto) {
    return this.faqRepository.create(dto);
  }

  async update(id: number, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.faqRepository.update(id, dto);
  }

  async toggleVisibility(id: number, isVisible: boolean) {
    await this.findOne(id);
    return this.faqRepository.toggleVisibility(id, isVisible);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.faqRepository.delete(id);
  }

  reorder(dto: ReorderFaqDto) {
  return this.faqRepository.reorder(dto.ids);
}
}