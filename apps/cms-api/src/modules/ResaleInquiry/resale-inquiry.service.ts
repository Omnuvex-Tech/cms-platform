import { Injectable, NotFoundException } from '@nestjs/common';
import { ResaleInquiryRepository } from './resale-inquiry.repository';
import { CreateResaleInquiryDto } from './dto/create-resale-inquiry.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class ResaleInquiryService {
  constructor(
    private readonly repo: ResaleInquiryRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async create(dto: CreateResaleInquiryDto) {
    const created = await this.repo.create(dto);

    const listing = [dto.rooms, dto.area, dto.floor && `${dto.floor} floor`]
      .filter(Boolean)
      .join(', ');

    const comments = [
      listing && `Listing: ${listing}`,
      dto.price && `Price: ${dto.price}`,
      dto.agentName && `Agent: ${dto.agentName}`,
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
      sourceDescription: 'Resale viewing request',
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
