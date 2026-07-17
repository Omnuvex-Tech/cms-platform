import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BotSyncService } from '../bot-sync/bot-sync.service';
import {
  CreateTrevaInfoSectionDto,
  UpdateTrevaInfoSectionDto,
} from './dto/treva-info-section.dto';
import { writeAboutTrevaMd } from './treva-info-md';

const sectionsOrdered = { sections: { orderBy: { sortOrder: 'asc' as const } } };

/**
 * TREVA Information is a single, permanent company-info record made of
 * freely editable headed sections (mirrors the bot's about_treva.md
 * structure). It has no draft/published state — the company always has this
 * information, so it's always live. We always operate on the first row,
 * creating an empty one on first access if none exists.
 *
 * The panel is the single source of truth: every section add/edit/delete
 * regenerates the bot's about_treva.md file directly (writeAboutTrevaMd) and
 * pushes to the bot webhook (BotSyncService, additive — a no-op until a
 * bot-side receiver exists).
 */
@Injectable()
export class TrevaInfoService {
  private readonly logger = new Logger(TrevaInfoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly botSync: BotSyncService,
  ) {}

  async get() {
    const existing = await this.prisma.trevaInfo.findFirst({
      orderBy: { id: 'asc' },
      include: sectionsOrdered,
    });
    if (existing) return existing;
    return this.prisma.trevaInfo.create({ data: {}, include: sectionsOrdered });
  }

  async addSection(dto: CreateTrevaInfoSectionDto) {
    const record = await this.get();
    const last = record.sections.at(-1);
    const section = await this.prisma.trevaInfoSection.create({
      data: {
        trevaInfoId: record.id,
        heading: dto.heading,
        content: dto.content ?? '',
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    await this.afterMutate(record.id);
    return section;
  }

  async updateSection(id: number, dto: UpdateTrevaInfoSectionDto) {
    const existing = await this.prisma.trevaInfoSection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Section not found');
    const section = await this.prisma.trevaInfoSection.update({
      where: { id },
      data: dto,
    });
    await this.afterMutate(existing.trevaInfoId);
    return section;
  }

  async removeSection(id: number) {
    const existing = await this.prisma.trevaInfoSection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Section not found');
    await this.prisma.trevaInfoSection.delete({ where: { id } });
    await this.afterMutate(existing.trevaInfoId);
    return { deleted: true };
  }

  /**
   * Runs after every section add/edit/delete: regenerates about_treva.md
   * from the panel's current sections (always — the panel is authoritative),
   * and pushes to the bot webhook.
   */
  private async afterMutate(trevaInfoId: number) {
    const record = await this.prisma.trevaInfo.findUnique({
      where: { id: trevaInfoId },
      include: sectionsOrdered,
    });
    if (!record) return;

    const written = writeAboutTrevaMd(record.sections);
    if (!written.ok) {
      this.logger.error(
        `Failed to write about_treva.md at ${written.path}: ${written.error}`,
      );
    }

    void this.botSync.syncTrevaInfo(record.sections);
  }
}
