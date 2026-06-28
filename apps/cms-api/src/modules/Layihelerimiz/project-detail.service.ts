import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProjectDetailRepository } from './project-detail.repository';
import { CreateProjectDetailDto } from './dto/create-project-detail.dto';
import { UpdateProjectDetailDto } from './dto/update-project-detail.dto';

@Injectable()
export class ProjectDetailService {
  constructor(private readonly repo: ProjectDetailRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  findBySlug(slug: string) {
    const item = this.repo.findBySlug(slug);
    if (!item) throw new NotFoundException('Layihə detalları tapılmadı');
    return item;
  }

  async create(dto: CreateProjectDetailDto) {
    const existing = await this.repo.findBySlug(dto.categorySlug);
    if (existing) throw new ConflictException('Bu slug üçün artıq detallar mövcuddur');
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateProjectDetailDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Layihə detalları tapılmadı');
    if (dto.categorySlug && dto.categorySlug !== existing.categorySlug) {
      const slugTaken = await this.repo.findBySlug(dto.categorySlug);
      if (slugTaken) throw new ConflictException('Bu slug artıq istifadə olunur');
    }
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Layihə detalları tapılmadı');
    return this.repo.delete(id);
  }
}
