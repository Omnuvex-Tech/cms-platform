import { Injectable, NotFoundException } from '@nestjs/common';
import { PrivacyPolicyRepository } from './privacy-policy.repository';
import { UpdatePrivacyPolicySettingsDto } from './dto/update-settings.dto';
import { CreatePrivacyPolicySectionDto } from './dto/create-section.dto';
import { UpdatePrivacyPolicySectionDto } from './dto/update-section.dto';
import { ReorderPrivacyPolicySectionsDto } from './dto/reorder-sections.dto';

@Injectable()
export class PrivacyPolicyService {
    constructor(private readonly repository: PrivacyPolicyRepository) { }

    async getOrCreateSettings() {
        const existing = await this.repository.findSettings();
        if (existing) return existing;

        await this.repository.createSettings();
        const settings = await this.repository.findSettings();
        if (!settings) {
            throw new Error('Failed to create privacy policy settings');
        }
        return settings;
    }

    async updateSettings(dto: UpdatePrivacyPolicySettingsDto) {
        const settings = await this.getOrCreateSettings();
        return this.repository.updateSettings(settings.id, dto);
    }

    async createSection(dto: CreatePrivacyPolicySectionDto) {
        const settings = await this.getOrCreateSettings();
        const order = dto.order ?? (await this.repository.countSections(settings.id));
        return this.repository.createSection(settings.id, { ...dto, order });
    }

    async updateSection(id: number, dto: UpdatePrivacyPolicySectionDto) {
        const section = await this.repository.findSectionById(id);
        if (!section) throw new NotFoundException('Privacy policy section not found');
        return this.repository.updateSection(id, dto);
    }

    async deleteSection(id: number) {
        const section = await this.repository.findSectionById(id);
        if (!section) throw new NotFoundException('Privacy policy section not found');
        return this.repository.deleteSection(id);
    }

    async reorderSections(dto: ReorderPrivacyPolicySectionsDto) {
        return this.repository.reorderSections(dto.items);
    }
}