import { Injectable, NotFoundException } from '@nestjs/common';
import { FooterRepository } from './footer.repository';
import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto';
import { CreateFooterNavLinkDto } from './dto/create-footer-nav-link.dto';
import { UpdateFooterNavLinkDto } from './dto/update-footer-nav-link.dto';
import { CreateFooterSocialLinkDto } from './dto/create-footer-social-link.dto';
import { UpdateFooterSocialLinkDto } from './dto/update-footer-social-link.dto';
import { ReorderFooterLinksDto } from './dto/reorder-footer-links.dto';

@Injectable()
export class FooterService {
  constructor(private readonly repo: FooterRepository) {}

  async getFooter() {
    const settings = await this.repo.findFirst();
    if (!settings) {
      return {
        logoImage: null,
        logoAlt: 'trenders',
        description: '',
        copyrightText: '© 2023 Trenders',
        privacyText: 'Məxfilik siyasəti | Bütün hüquqlar qorunur',
        locationLabel: 'Location',
        phoneLabel: 'Phone',
        emailLabel: 'Email Adress',
        locationValue: '',
        phoneValue: '',
        emailValue: '',
        navLinks: [],
        socialLinks: [],
      };
    }
    return settings;
  }

  async getOrCreate() {
    const existing = await this.repo.findFirst();
    if (existing) return existing;
    return this.repo.create();
  }

  async updateSettings(dto: UpdateFooterSettingsDto) {
    const existing = await this.repo.findFirst();
    if (!existing) {
      const created = await this.repo.create();
      return this.repo.updateSettings(created.id, dto);
    }
    return this.repo.updateSettings(existing.id, dto);
  }

  async createNavLink(dto: CreateFooterNavLinkDto) {
    const footer = await this.getOrCreate();
    return this.repo.createNavLink(footer.id, dto);
  }

  async updateNavLink(id: number, dto: UpdateFooterNavLinkDto) {
    const link = await this.repo.findNavLinkById(id);
    if (!link) throw new NotFoundException(`FooterNavLink #${id} tapılmadı`);
    return this.repo.updateNavLink(id, dto);
  }

  async deleteNavLink(id: number) {
    const link = await this.repo.findNavLinkById(id);
    if (!link) throw new NotFoundException(`FooterNavLink #${id} tapılmadı`);
    return this.repo.deleteNavLink(id);
  }

  async reorderNavLinks(dto: ReorderFooterLinksDto) {
    return this.repo.reorderNavLinks(dto.links);
  }

  async createSocialLink(dto: CreateFooterSocialLinkDto) {
    const footer = await this.getOrCreate();
    return this.repo.createSocialLink(footer.id, dto);
  }

  async updateSocialLink(id: number, dto: UpdateFooterSocialLinkDto) {
    const link = await this.repo.findSocialLinkById(id);
    if (!link) throw new NotFoundException(`FooterSocialLink #${id} tapılmadı`);
    return this.repo.updateSocialLink(id, dto);
  }

  async deleteSocialLink(id: number) {
    const link = await this.repo.findSocialLinkById(id);
    if (!link) throw new NotFoundException(`FooterSocialLink #${id} tapılmadı`);
    return this.repo.deleteSocialLink(id);
  }

  async reorderSocialLinks(dto: ReorderFooterLinksDto) {
    return this.repo.reorderSocialLinks(dto.links);
  }
}