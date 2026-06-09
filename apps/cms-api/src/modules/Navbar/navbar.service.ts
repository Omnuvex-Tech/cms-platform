// navbar-settings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { NavbarSettingsRepository } from './navbar.repository';
import { CreateNavLinkDto } from './dto/create-nav-link.dto';
import { UpdateNavLinkDto } from './dto/update-nav-link.dto';
import { UpdateNavbarSettingsDto } from './dto/update-navbar-settings.dto';
import { ReorderNavLinksDto } from './dto/reorder-nav-links.dto';

@Injectable()
export class NavbarSettingsService {
  constructor(private readonly repo: NavbarSettingsRepository) {}

  async getNavbar() {
    const settings = await this.repo.findFirst();
    if (!settings) {
      return {
        logoText: 'trenders',
        logoImage: null,
        showSearch: true,
        showLang: true,
        links: [],
      };
    }
    return settings;
  }

  async getOrCreate() {
    const existing = await this.repo.findFirst();
    if (existing) return existing;
    return this.repo.create();
  }

  async updateSettings(dto: UpdateNavbarSettingsDto) {
    const existing = await this.repo.findFirst();
    if (!existing) {
      const created = await this.repo.create();
      return this.repo.updateSettings(created.id, dto);
    }
    return this.repo.updateSettings(existing.id, dto);
  }

  async reorderLinks(dto: ReorderNavLinksDto) {
    return this.repo.reorderLinks(dto.links);
  }

  async createLink(dto: CreateNavLinkDto) {
    const navbar = await this.getOrCreate();
    return this.repo.createLink(navbar.id, dto);
  }

async updateLink(id: number, dto: UpdateNavLinkDto) {
  const link = await this.repo.findLinkById(id);
  if (!link) throw new NotFoundException(`NavLink #${id} tapılmadı`);
  return this.repo.updateLink(id, dto);
}

async deleteLink(id: number) {
  const link = await this.repo.findLinkById(id);
  if (!link) throw new NotFoundException(`NavLink #${id} tapılmadı`);
  return this.repo.deleteLink(id);
}
}