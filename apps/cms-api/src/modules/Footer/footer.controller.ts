import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FooterService } from './footer.service';
import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto';
import { CreateFooterNavLinkDto } from './dto/create-footer-nav-link.dto';
import { UpdateFooterNavLinkDto } from './dto/update-footer-nav-link.dto';
import { CreateFooterSocialLinkDto } from './dto/create-footer-social-link.dto';
import { UpdateFooterSocialLinkDto } from './dto/update-footer-social-link.dto';
import { ReorderFooterLinksDto } from './dto/reorder-footer-links.dto';

@Controller('footer')
export class FooterController {
  constructor(private readonly service: FooterService) {}

  @Get()
  getFooter() {
    return this.service.getFooter();
  }

  @Get('admin')
  getForAdmin() {
    return this.service.getOrCreate();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateFooterSettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Post('nav-links')
  createNavLink(@Body() dto: CreateFooterNavLinkDto) {
    return this.service.createNavLink(dto);
  }

  @Patch('nav-links/reorder')
  reorderNavLinks(@Body() dto: ReorderFooterLinksDto) {
    return this.service.reorderNavLinks(dto);
  }

  @Patch('nav-links/:id')
  updateNavLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFooterNavLinkDto,
  ) {
    return this.service.updateNavLink(id, dto);
  }

  @Delete('nav-links/:id')
  deleteNavLink(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteNavLink(id);
  }

  @Post('social-links')
  createSocialLink(@Body() dto: CreateFooterSocialLinkDto) {
    return this.service.createSocialLink(dto);
  }

  @Patch('social-links/reorder')
  reorderSocialLinks(@Body() dto: ReorderFooterLinksDto) {
    return this.service.reorderSocialLinks(dto);
  }

  @Patch('social-links/:id')
  updateSocialLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFooterSocialLinkDto,
  ) {
    return this.service.updateSocialLink(id, dto);
  }

  @Delete('social-links/:id')
  deleteSocialLink(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSocialLink(id);
  }
}