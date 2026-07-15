import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { IngestService } from './ingest.service';
import { IngestLeadDto } from './dto/ingest-lead.dto';
import { IngestContactRequestDto } from './dto/ingest-contact-request.dto';

/**
 * Machine-to-machine ingestion surface for the treva_sales_bot.
 *
 * @Public() takes these routes out of the user-JWT gate; ApiKeyGuard then
 * enforces the shared `x-api-key` secret instead. This is intentionally a
 * separate auth path from the human admin panel.
 */
@Public()
@UseGuards(ApiKeyGuard)
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post('leads')
  ingestLead(@Body() dto: IngestLeadDto) {
    return this.ingestService.upsertLead(dto);
  }

  @Post('contact-requests')
  ingestContactRequest(@Body() dto: IngestContactRequestDto) {
    return this.ingestService.upsertContactRequest(dto);
  }
}
