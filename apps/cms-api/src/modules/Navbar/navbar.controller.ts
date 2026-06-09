// navbar-settings.controller.ts
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
import { NavbarSettingsService } from './navbar.service';
import { CreateNavLinkDto } from './dto/create-nav-link.dto';
import { UpdateNavLinkDto } from './dto/update-nav-link.dto';
import { UpdateNavbarSettingsDto } from './dto/update-navbar-settings.dto';
import { ReorderNavLinksDto } from './dto/reorder-nav-links.dto';

@Controller('navbar-settings')
export class NavbarSettingsController {
  constructor(private readonly service: NavbarSettingsService) {}

  @Get()
  getNavbar() {
    return this.service.getNavbar();
  }

  @Get('admin')
  getForAdmin() {
    return this.service.getOrCreate();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateNavbarSettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Patch('links/reorder')
  reorderLinks(@Body() dto: ReorderNavLinksDto) {
    return this.service.reorderLinks(dto);
  }

  @Post('links')
  createLink(@Body() dto: CreateNavLinkDto) {
    return this.service.createLink(dto);
  }

  @Patch('links/:id')
  updateLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNavLinkDto,
  ) {
    return this.service.updateLink(id, dto);
  }

  @Delete('links/:id')
  deleteLink(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLink(id);
  }
}