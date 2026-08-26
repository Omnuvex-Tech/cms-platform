import { Injectable, NotFoundException } from '@nestjs/common';
import { CallbackRepository } from './callback.repository';
import { CreateCallbackDto } from './dto/create-callback.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

/** Maps the Callback widget's role field (Müştəri/Broker/Developer) to a Bitrix24 SOURCE_ID. */
function bitrixSourceForRole(role: string): string {
  const normalized = role.trim().toLowerCase();
  if (normalized.includes('broker')) return BITRIX_SOURCE.BROKER;
  if (normalized.includes('developer')) return BITRIX_SOURCE.DEVELOPER;
  return BITRIX_SOURCE.CUSTOMER; // Müştəri / anything else
}

@Injectable()
export class CallbackService {
  constructor(
    private readonly repo: CallbackRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async create(dto: CreateCallbackDto) {
    // Homepage callback CTA has no role selector and is always a customer
    // lead — default here so it can reuse this same endpoint (see
    // CreateCallbackDto.role) instead of needing a separate one.
    const role = dto.role?.trim() || 'Müştəri';
    const created = await this.repo.create({ ...dto, role });

    // Fire-and-forget: never blocks or fails the CTA's own response.
    this.bitrixService.createLead({
      name: dto.name,
      phone: dto.phone,
      comments: `Contact type: ${role}`,
      sourceDescription: 'Callback request',
      sourceId: bitrixSourceForRole(role),
    });

    return created;
  }

  async delete(id: string) {
    const item = await this.repo.findAll();
    const found = item.find((r) => r.id === id);
    if (!found) throw new NotFoundException('Sorğu tapılmadı');
    return this.repo.delete(id);
  }
}
