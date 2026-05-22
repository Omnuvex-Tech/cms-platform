import { Injectable, NotFoundException } from '@nestjs/common';
import { PartnersRepository } from './partners.repository';
import { CreatePartnerSectionDto } from './dto/create-partner-section.dto';
import { UpdatePartnerSectionDto } from './dto/update-partner-section.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReorderPartnerDto } from './dto/reorder-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly repo: PartnersRepository) {}

  findSection() { return this.repo.findSection(); }
  findHomepage() { return this.repo.findHomepage(); }
  createSection(dto: CreatePartnerSectionDto) { return this.repo.createSection(dto); }

  async updateSection(id: number, dto: UpdatePartnerSectionDto) {
    const section = await this.repo.findSection();
    if (!section) throw new NotFoundException('Section tapılmadı');
    return this.repo.updateSection(id, dto);
  }

  async findOnePartner(id: number) {
    const p = await this.repo.findOnePartner(id);
    if (!p) throw new NotFoundException('Partner tapılmadı');
    return p;
  }

  createPartner(dto: CreatePartnerDto) { return this.repo.createPartner(dto); }

  async updatePartner(id: number, dto: UpdatePartnerDto) {
    await this.findOnePartner(id);
    return this.repo.updatePartner(id, dto);
  }

  async deletePartner(id: number) {
    await this.findOnePartner(id);
    return this.repo.deletePartner(id);
  }

  async toggleHomepage(id: number, isHomepage: boolean) {
    await this.findOnePartner(id);
    return this.repo.toggleHomepage(id, isHomepage);
  }

  reorder(dto: ReorderPartnerDto) { return this.repo.reorder(dto.ids); }


  async toggleVisibility(id: number, isVisible: boolean) {
  await this.findOnePartner(id);
  return this.repo.toggleVisibility(id, isVisible);
}
}