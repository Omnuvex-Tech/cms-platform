import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { CreateContactSocialLinkDto } from './dto/create-contact-social-link.dto';
import { UpdateContactSocialLinkDto } from './dto/update-contact-social-link.dto';
import { CreateContactOptionDto } from './dto/create-contact-option.dto';
import { UpdateContactOptionDto } from './dto/update-contact-option.dto';
import { ReorderContactLinksDto } from './dto/reorder-contact-links.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { Public } from '../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/contact';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml)$/)) {
        return cb(new Error('Yalnız şəkil faylları qəbul edilir'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/contact/${file.filename}` };
  }


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


  @Public()
  @Post('submit')
  createSubmission(@Body() dto: CreateContactSubmissionDto) {
    return this.service.createSubmission(dto);
  }

  @Get('submissions')
  findAllSubmissions() {
    return this.service.findAllSubmissions();
  }
}