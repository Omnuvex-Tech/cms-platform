import { Injectable, NotFoundException } from '@nestjs/common';
import { BrokerRegistrationRepository } from './broker-registration.repository';
import { CreateBrokerRegistrationDto } from './dto/create-broker-registration.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class BrokerRegistrationService {
  constructor(
    private readonly repo: BrokerRegistrationRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  async create(dto: CreateBrokerRegistrationDto) {
    const created = await this.repo.create(dto);

    const comments = [
      dto.city && `City: ${dto.city}`,
      dto.brokerType && `Broker type: ${dto.brokerType}`,
      dto.experience && `Experience: ${dto.experience}`,
      dto.website && `Website: ${dto.website}`,
      dto.message,
    ]
      .filter(Boolean)
      .join('\n');

    // Fire-and-forget: never blocks or fails the CTA's own response.
    this.bitrixService.createLead({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      comments,
      sourceDescription: 'Broker registration',
      sourceId: BITRIX_SOURCE.BROKER,
    });

    return created;
  }

  findAll() {
    return this.repo.findAll();
  }

  async delete(id: number) {
    const item = await this.repo.delete(id).catch(() => null);
    if (!item) throw new NotFoundException('Broker registration not found');
    return item;
  }
}
