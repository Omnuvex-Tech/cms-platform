// navbar-settings.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNavLinkDto } from './dto/create-nav-link.dto';
import { UpdateNavLinkDto } from './dto/update-nav-link.dto';
import { UpdateNavbarSettingsDto } from './dto/update-navbar-settings.dto';
import { ReorderNavLinkItemDto } from './dto/reorder-nav-links.dto';

@Injectable()
export class NavbarSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst() {
    return this.prisma.navbarSettings.findFirst({
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create() {
    return this.prisma.navbarSettings.create({
      data: {},
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateSettings(id: number, dto: UpdateNavbarSettingsDto) {
    return this.prisma.navbarSettings.update({
      where: { id },
      data: {
        ...(dto.logoText !== undefined && { logoText: dto.logoText }),
        ...(dto.logoImage !== undefined && { logoImage: dto.logoImage }),
        ...(dto.showSearch !== undefined && { showSearch: dto.showSearch }),
        ...(dto.showLang !== undefined && { showLang: dto.showLang }),
      },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async reorderLinks(links: ReorderNavLinkItemDto[]) {
    return this.prisma.$transaction(
      links.map((link) =>
        this.prisma.navLink.update({
          where: { id: link.id },
          data: { order: link.order },
        }),
      ),
    );
  }

  async createLink(navbarId: number, dto: CreateNavLinkDto) {
    return this.prisma.navLink.create({
      data: {
        label: dto.label,
        href: dto.href,
        order: dto.order ?? 0,
        isVisible: dto.isVisible ?? true,
        openInNewTab: dto.openInNewTab ?? false,
        navbarId,
      },
    });
  }

  async updateLink(id: number, dto: UpdateNavLinkDto) {
    return this.prisma.navLink.update({
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

  async deleteLink(id: number) {
    return this.prisma.navLink.delete({ where: { id } });
  }

async findLinkById(id: number) {
  return this.prisma.navLink.findUnique({ where: { id } });
}
}