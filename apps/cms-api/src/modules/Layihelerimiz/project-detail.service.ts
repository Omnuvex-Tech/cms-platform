import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProjectDetailRepository } from './project-detail.repository';
import { CreateProjectDetailDto } from './dto/create-project-detail.dto';
import { UpdateProjectDetailDto } from './dto/update-project-detail.dto';
import { withSections } from './project-sections';

@Injectable()
export class ProjectDetailService {
  constructor(private readonly repo: ProjectDetailRepository) {}

  async findAll() {
    const items = await this.repo.findAll();
    return items.map((item) => withSections(item));
  }

  async findBySlug(slug: string) {
    const item = await this.repo.findBySlug(slug);
    if (!item) throw new NotFoundException('Layihə detalları tapılmadı');
    return withSections(item);
  }

  async create(dto: CreateProjectDetailDto) {
    const existing = await this.repo.findBySlug(dto.categorySlug);
    if (existing)
      throw new ConflictException('Bu slug üçün artıq detallar mövcuddur');
    return withSections(await this.repo.create(dto));
  }

  async update(id: string, dto: UpdateProjectDetailDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Layihə detalları tapılmadı');
    if (dto.categorySlug && dto.categorySlug !== existing.categorySlug) {
      const slugTaken = await this.repo.findBySlug(dto.categorySlug);
      if (slugTaken) throw new ConflictException('Bu slug artıq istifadə olunur');
    }
    return withSections(await this.repo.update(id, dto));
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Layihə detalları tapılmadı');
    return this.repo.delete(id);
  }
}
