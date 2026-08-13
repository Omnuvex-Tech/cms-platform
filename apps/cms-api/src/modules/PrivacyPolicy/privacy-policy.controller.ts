import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { UpdatePrivacyPolicySettingsDto } from './dto/update-settings.dto';
import { CreatePrivacyPolicySectionDto } from './dto/create-section.dto';
import { UpdatePrivacyPolicySectionDto } from './dto/update-section.dto';
import { ReorderPrivacyPolicySectionsDto } from './dto/reorder-sections.dto';

@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly service: PrivacyPolicyService) {}

  @Get()
  getSettings() {
    return this.service.getOrCreateSettings();
  }

  @Patch()
  updateSettings(@Body() dto: UpdatePrivacyPolicySettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Post('sections')
  createSection(@Body() dto: CreatePrivacyPolicySectionDto) {
    return this.service.createSection(dto);
  }

  @Patch('sections/reorder')
  reorderSections(@Body() dto: ReorderPrivacyPolicySectionsDto) {
    return this.service.reorderSections(dto);
  }

  @Patch('sections/:id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrivacyPolicySectionDto,
  ) {
    return this.service.updateSection(id, dto);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSection(id);
  }
}