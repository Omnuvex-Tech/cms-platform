import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePrivacyPolicySettingsDto } from './dto/update-settings.dto';
import { CreatePrivacyPolicySectionDto } from './dto/create-section.dto';
import { UpdatePrivacyPolicySectionDto } from './dto/update-section.dto';

@Injectable()
export class PrivacyPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSettings() {
    return this.prisma.privacyPolicySettings.findFirst({
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  }

  async createSettings() {
    return this.prisma.privacyPolicySettings.create({ data: {} });
  }

  async updateSettings(id: number, data: UpdatePrivacyPolicySettingsDto) {
    return this.prisma.privacyPolicySettings.update({
      where: { id },
      data,
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  }

  async countSections(settingsId: number) {
    return this.prisma.privacyPolicySection.count({ where: { settingsId } });
  }

  async createSection(settingsId: number, dto: CreatePrivacyPolicySectionDto) {
    return this.prisma.privacyPolicySection.create({
      data: { ...dto, settingsId },
    });
  }

  async findSectionById(id: number) {
    return this.prisma.privacyPolicySection.findUnique({ where: { id } });
  }

  async updateSection(id: number, dto: UpdatePrivacyPolicySectionDto) {
    return this.prisma.privacyPolicySection.update({ where: { id }, data: dto });
  }

  async deleteSection(id: number) {
    return this.prisma.privacyPolicySection.delete({ where: { id } });
  }

  async reorderSections(items: { id: number; order: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.privacyPolicySection.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }
}