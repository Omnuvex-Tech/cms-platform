import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ContactRequestStatus } from '@prisma/client';
import { ContactRequestsService } from './contact-requests.service';
import {
  AssignContactDto,
  OutcomeDto,
  SetContactStatusDto,
} from './dto/contact-request.dto';

@Controller('contact-requests')
export class ContactRequestsController {
  constructor(
    private readonly contactRequestsService: ContactRequestsService,
  ) {}

  @Get()
  list(@Query('status') status?: ContactRequestStatus) {
    return this.contactRequestsService.list(status);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.contactRequestsService.get(id);
  }

  @Patch(':id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetContactStatusDto,
  ) {
    return this.contactRequestsService.setStatus(id, dto);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignContactDto,
  ) {
    return this.contactRequestsService.assign(id, dto);
  }

  @Patch(':id/outcome')
  recordOutcome(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OutcomeDto,
  ) {
    return this.contactRequestsService.recordOutcome(id, dto);
  }
}
