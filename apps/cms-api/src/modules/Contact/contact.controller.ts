import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Public()
  @Post('submit')
  createSubmission(@Body() dto: CreateContactSubmissionDto) {
    return this.service.createSubmission(dto);
  }

  @Get('submissions')
  findAllSubmissions() {
    return this.service.findAllSubmissions();
  }

  @Delete('submissions/:id')
  deleteSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSubmission(id);
  }
}
