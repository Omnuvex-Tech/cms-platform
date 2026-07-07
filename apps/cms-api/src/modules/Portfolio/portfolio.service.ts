import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PortfolioRepository } from './portfolio.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { ReorderPortfolioDto } from './dto/reorder-portfolio.dto';
import { CreatePortfolioSettingsDto } from './dto/create-portfolio-settings.dto';
import { UpdatePortfolioSettingsDto } from './dto/update-portfolio-settings.dto';
import { generatePortfolioSchema } from './portfolio-schema-generator';

@Injectable()
export class PortfolioService {
  constructor(private readonly repo: PortfolioRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  findAllVisible() {
    return this.repo.findAllVisible();
  }

  async findOne(id: number) {
    const portfolio = await this.repo.findOne(id);
    if (!portfolio) throw new NotFoundException('Portfolio tapılmadı');
    return portfolio;
  }

  async findBySlug(slug: string) {
    const portfolio = await this.repo.findBySlug(slug);
    if (!portfolio) throw new NotFoundException('Portfolio tapılmadı');
    return portfolio;
  }

  async create(dto: CreatePortfolioDto) {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) throw new ConflictException('Bu slug artıq mövcuddur');
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdatePortfolioDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Bu slug artıq mövcuddur');
      }
    }
    return this.repo.update(id, dto);
  }

  async generateSchema(id: number) {
    const portfolio = await this.findOne(id);
    const baseUrl = process.env.SITE_URL!;
    return generatePortfolioSchema(portfolio, baseUrl);
  }

  async saveSchema(id: number, schema: Record<string, any> | null) {
    await this.findOne(id);
    return this.repo.saveSchema(id, schema);
  }
  
  async toggleVisibility(id: number, isVisible: boolean) {
    await this.findOne(id);
    return this.repo.toggleVisibility(id, isVisible);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  reorder(dto: ReorderPortfolioDto) {
    return this.repo.reorder(dto.ids);
  }


  findHomepage() {
  return this.repo.findHomepage();
}

async toggleHomepage(id: number, isHomepage: boolean) {
  await this.findOne(id);
  return this.repo.toggleHomepage(id, isHomepage);
}


getPortfolioSettings() {
    return this.repo.getPortfolioSettings();
  }

  createPortfolioSettings(dto: CreatePortfolioSettingsDto) {
    return this.repo.createPortfolioSettings(dto);
  }

  updatePortfolioSettings(
    id: number,
    dto: UpdatePortfolioSettingsDto,
  ) {
    return this.repo.updatePortfolioSettings(id, dto);
  }
}