import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Channel, LeadStatus, Temperature } from '@prisma/client';
import { LeadsService } from './leads.service';
import { UpdateLeadDto } from './dto/lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('status') status?: LeadStatus,
    @Query('temperature') temperature?: Temperature,
    @Query('channel') channel?: Channel,
  ) {
    return this.leadsService.list({ search, status, temperature, channel });
  }

  // Declared before ':id' so the static path matches first.
  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="leads.csv"')
  export(
    @Query('search') search?: string,
    @Query('status') status?: LeadStatus,
    @Query('temperature') temperature?: Temperature,
    @Query('channel') channel?: Channel,
  ) {
    return this.leadsService.exportCsv({ search, status, temperature, channel });
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.get(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }
}
