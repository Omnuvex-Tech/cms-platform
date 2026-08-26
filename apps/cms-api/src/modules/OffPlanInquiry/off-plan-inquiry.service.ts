import { Injectable, NotFoundException } from '@nestjs/common';
import { OffPlanInquiryRepository } from './off-plan-inquiry.repository';
import { CreateOffPlanInquiryDto } from './dto/create-off-plan-inquiry.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class OffPlanInquiryService {
  constructor(
    private readonly repo: OffPlanInquiryRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async create(dto: CreateOffPlanInquiryDto) {
    const created = await this.repo.create(dto);

    const comments = [
      (dto.projectName || dto.projectSlug) && `Project: ${dto.projectName || dto.projectSlug}`,
      dto.tower && `Tower: ${dto.tower}`,
      dto.unitNumber && `Unit: ${dto.unitNumber}`,
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
      sourceDescription: 'Off-plan unit inquiry',
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
