import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto';
import { CreateFooterNavLinkDto } from './dto/create-footer-nav-link.dto';
import { UpdateFooterNavLinkDto } from './dto/update-footer-nav-link.dto';
import { CreateFooterSocialLinkDto } from './dto/create-footer-social-link.dto';
import { UpdateFooterSocialLinkDto } from './dto/update-footer-social-link.dto';
import { ReorderFooterLinkItemDto } from './dto/reorder-footer-links.dto';

@Injectable()
export class FooterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst() {
    return this.prisma.footerSettings.findFirst({
      include: {
        navLinks: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });
  }

  async create() {
    return this.prisma.footerSettings.create({
      data: {},
      include: {
        navLinks: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });
  }

 async updateSettings(id: number, dto: UpdateFooterSettingsDto) {
    return this.prisma.footerSettings.update({
        where: { id },
        data: {
            ...(dto.logoImage !== undefined && { logoImage: dto.logoImage }),
            ...(dto.logoAlt !== undefined && { logoAlt: dto.logoAlt }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.copyrightText !== undefined && { copyrightText: dto.copyrightText }),
            ...(dto.privacyText !== undefined && { privacyText: dto.privacyText }),
            ...(dto.locationLabel !== undefined && { locationLabel: dto.locationLabel }),
            ...(dto.phoneLabel !== undefined && { phoneLabel: dto.phoneLabel }),
            ...(dto.emailLabel !== undefined && { emailLabel: dto.emailLabel }),
            ...(dto.locationValue !== undefined && { locationValue: dto.locationValue }),
            ...(dto.phoneValue !== undefined && { phoneValue: dto.phoneValue }),
            ...(dto.emailValue !== undefined && { emailValue: dto.emailValue }),
        },
        include: {
            navLinks: { orderBy: { order: 'asc' } },
            socialLinks: { orderBy: { order: 'asc' } },
        },
    });
}

  // Nav Links
  async createNavLink(footerId: number, dto: CreateFooterNavLinkDto) {
    return this.prisma.footerNavLink.create({
      data: {
        label: dto.label,
        href: dto.href,
        order: dto.order ?? 0,
        isVisible: dto.isVisible ?? true,
        openInNewTab: dto.openInNewTab ?? false,
        footerId,
      },
    });
  }

  async updateNavLink(id: number, dto: UpdateFooterNavLinkDto) {
    return this.prisma.footerNavLink.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.href !== undefined && { href: dto.href }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        ...(dto.openInNewTab !== undefined && { openInNewTab: dto.openInNewTab }),
      },
    });
  }

  async deleteNavLink(id: number) {
    return this.prisma.footerNavLink.delete({ where: { id } });
  }

  async findNavLinkById(id: number) {
    return this.prisma.footerNavLink.findUnique({ where: { id } });
  }

  async reorderNavLinks(links: ReorderFooterLinkItemDto[]) {
    return this.prisma.$transaction(
      links.map((l) =>
        this.prisma.footerNavLink.update({
          where: { id: l.id },
          data: { order: l.order },
        }),
      ),
    );
  }

  // Social Links
  async createSocialLink(footerId: number, dto: CreateFooterSocialLinkDto) {
    return this.prisma.footerSocialLink.create({
      data: {
        icon: dto.icon,
        href: dto.href,
        order: dto.order ?? 0,
        isVisible: dto.isVisible ?? true,
        footerId,
      },
    });
  }

  async updateSocialLink(id: number, dto: UpdateFooterSocialLinkDto) {
    return this.prisma.footerSocialLink.update({
      where: { id },
      data: {
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.href !== undefined && { href: dto.href }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
      },
    });
  }

  async deleteSocialLink(id: number) {
    return this.prisma.footerSocialLink.delete({ where: { id } });
  }

  async findSocialLinkById(id: number) {
    return this.prisma.footerSocialLink.findUnique({ where: { id } });
  }

  async reorderSocialLinks(links: ReorderFooterLinkItemDto[]) {
    return this.prisma.$transaction(
      links.map((l) =>
        this.prisma.footerSocialLink.update({
          where: { id: l.id },
          data: { order: l.order },
        }),
      ),
    );
  }
}