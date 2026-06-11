import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { CreateContactSocialLinkDto } from './dto/create-contact-social-link.dto';
import { UpdateContactSocialLinkDto } from './dto/update-contact-social-link.dto';
import { CreateContactOptionDto } from './dto/create-contact-option.dto';
import { UpdateContactOptionDto } from './dto/update-contact-option.dto';
import { ReorderContactLinksDto } from './dto/reorder-contact-links.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Get()
  getContact() {
    return this.service.getContact();
  }

  @Get('admin')
  getForAdmin() {
    return this.service.getOrCreate();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateContactSettingsDto) {
    return this.service.updateSettings(dto);
  }

  // ── Social Links ────────────────────────────────────────────────────────────

  @Post('social-links')
  createSocialLink(@Body() dto: CreateContactSocialLinkDto) {
    return this.service.createSocialLink(dto);
  }

  @Patch('social-links/reorder')
  reorderSocialLinks(@Body() dto: ReorderContactLinksDto) {
    return this.service.reorderSocialLinks(dto);
  }

  @Patch('social-links/:id')
  updateSocialLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactSocialLinkDto,
  ) {
    return this.service.updateSocialLink(id, dto);
  }

  @Delete('social-links/:id')
  deleteSocialLink(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSocialLink(id);
  }

  // ── Budget Options ──────────────────────────────────────────────────────────

  @Post('budget-options')
  createBudgetOption(@Body() dto: CreateContactOptionDto) {
    return this.service.createBudgetOption(dto);
  }

  @Patch('budget-options/:id')
  updateBudgetOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactOptionDto,
  ) {
    return this.service.updateBudgetOption(id, dto);
  }

  @Delete('budget-options/:id')
  deleteBudgetOption(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteBudgetOption(id);
  }

  // ── Timeline Options ────────────────────────────────────────────────────────

  @Post('timeline-options')
  createTimelineOption(@Body() dto: CreateContactOptionDto) {
    return this.service.createTimelineOption(dto);
  }

  @Patch('timeline-options/:id')
  updateTimelineOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactOptionDto,
  ) {
    return this.service.updateTimelineOption(id, dto);
  }

  @Delete('timeline-options/:id')
  deleteTimelineOption(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteTimelineOption(id);
  }

  // ── Submissions ─────────────────────────────────────────────────────────────

  @Post('submit')
  createSubmission(@Body() dto: CreateContactSubmissionDto) {
    return this.service.createSubmission(dto);
  }

  @Get('submissions')
  findAllSubmissions() {
    return this.service.findAllSubmissions();
  }
}