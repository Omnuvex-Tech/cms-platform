import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HandoffStatus } from '@prisma/client';
import { HandoffsService } from './handoffs.service';
import { BotControlDto, HandoffNotesDto } from './dto/handoff.dto';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('handoffs')
export class HandoffsController {
  constructor(private readonly handoffsService: HandoffsService) {}

  @Get()
  list(@Query('status') status?: HandoffStatus | 'open') {
    return this.handoffsService.list(status);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.handoffsService.get(id);
  }

  @Post(':id/accept')
  accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.handoffsService.accept(id, user.sub);
  }

  @Patch(':id/bot')
  botControl(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BotControlDto,
  ) {
    return this.handoffsService.botControl(id, dto);
  }

  @Post(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.handoffsService.resolve(id);
  }

  @Patch(':id/notes')
  setNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandoffNotesDto,
  ) {
    return this.handoffsService.setNotes(id, dto);
  }
}
