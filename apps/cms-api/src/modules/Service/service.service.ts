import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ReorderServiceDto } from './dto/reorder-service.dto';
import { generateServiceSchema } from './service-schema-generator';

@Injectable()
export class ServiceService {
  constructor(private readonly repo: ServiceRepository) {}

  findAll() { return this.repo.findAll(); }
  findAllVisible() { return this.repo.findAllVisible(); }

  async findOne(id: number) {
    const s = await this.repo.findOne(id);
    if (!s) throw new NotFoundException('Service tapılmadı');
    return s;
  }

  async findBySlug(slug: string) {
    const s = await this.repo.findBySlug(slug);
    if (!s) throw new NotFoundException('Service tapılmadı');
    return s;
  }

  async create(dto: CreateServiceDto) {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) throw new ConflictException('Bu slug artıq mövcuddur');
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) throw new ConflictException('Bu slug artıq mövcuddur');
    }
    return this.repo.update(id, dto);
  }

  async toggleVisibility(id: number, isVisible: boolean) {
    await this.findOne(id);
    return this.repo.toggleVisibility(id, isVisible);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  reorder(dto: ReorderServiceDto) {
    return this.repo.reorder(dto.ids);
  }


  async generateSchema(id: number) {
    const service = await this.findOne(id);
    const baseUrl = process.env.SITE_URL!;
    return generateServiceSchema(service, baseUrl);
  }

  async saveSchema(id: number, schema: Record<string, any> | null) {
    await this.findOne(id);
    return this.repo.saveSchema(id, schema);
  }
}