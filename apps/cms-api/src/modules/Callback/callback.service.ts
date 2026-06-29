import { Injectable, NotFoundException } from '@nestjs/common';
import { CallbackRepository } from './callback.repository';
import { CreateCallbackDto } from './dto/create-callback.dto';

@Injectable()
export class CallbackService {
  constructor(private readonly repo: CallbackRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  create(dto: CreateCallbackDto) {
    return this.repo.create(dto);
  }

  async delete(id: string) {
    const item = await this.repo.findAll();
    const found = item.find((r) => r.id === id);
    if (!found) throw new NotFoundException('Sorğu tapılmadı');
    return this.repo.delete(id);
  }
}
