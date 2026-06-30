import { Injectable, NotFoundException } from '@nestjs/common';
import { BrokerRegistrationRepository } from './broker-registration.repository';
import { CreateBrokerRegistrationDto } from './dto/create-broker-registration.dto';

@Injectable()
export class BrokerRegistrationService {
  constructor(private readonly repo: BrokerRegistrationRepository) {}

  create(dto: CreateBrokerRegistrationDto) {
    return this.repo.create(dto);
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
