import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectInquiryRepository } from './project-inquiry.repository';
import { CreateProjectInquiryDto } from './dto/create-project-inquiry.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class ProjectInquiryService {
  constructor(
    private readonly repo: ProjectInquiryRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async create(dto: CreateProjectInquiryDto) {
    const created = await this.repo.create(dto);

    const comments = [
      (dto.projectName || dto.projectSlug) && `Project: ${dto.projectName || dto.projectSlug}`,
      dto.message,
    ]
      .filter(Boolean)
      .join('\n');

    // Fire-and-forget: never blocks or fails the CTA's own response.
    this.bitrixService.createLead({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      comments,
      sourceDescription: 'Project inquiry',
      sourceId: BITRIX_SOURCE.CUSTOMER,
    });

    return created;
  }

  async delete(id: string) {
    const items = await this.repo.findAll();
    const found = items.find((r) => r.id === id);
    if (!found) throw new NotFoundException('Inquiry not found');
    return this.repo.delete(id);
  }
}
