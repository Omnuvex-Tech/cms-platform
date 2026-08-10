import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Channel, ConversationStatus } from '@prisma/client';
import { ConversationsService } from './conversations.service';
import {
  AddNoteDto,
  AssignDto,
  ExportThreadDto,
  ExportThreadsDto,
  ReplyDto,
  SetBotDto,
  SetStatusDto,
} from './dto/conversation.dto';
import { ExportFile } from './conversation-export';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('status') status?: ConversationStatus,
    @Query('channel') channel?: Channel,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.conversationsService.list({
      search,
      status,
      channel,
      assignedToId: assignedToId ? Number(assignedToId) : undefined,
    });
  }

  /**
   * Declared before ':id' so the static path matches first — otherwise
   * ParseIntPipe rejects "export" as a conversation id.
   */
  @Get('export')
  async exportAll(
    @Query() dto: ExportThreadsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(res, await this.conversationsService.exportMany(dto));
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.get(id);
  }

  @Get(':id/export')
  async exportOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() dto: ExportThreadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(
      res,
      // html by default — see the comment on exportMany's same default.
      await this.conversationsService.exportOne(id, dto.format ?? 'html'),
    );
  }

  /**
   * Content-Type and filename vary per format, so they are set here rather than
   * with the static @Header decorator used by the leads CSV export.
   */
  private send(res: Response, file: ExportFile): string {
    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    return file.body;
  }

  @Post(':id/reply')
  reply(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplyDto) {
    return this.conversationsService.reply(id, dto);
  }

  @Patch(':id/status')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetStatusDto) {
    return this.conversationsService.setStatus(id, dto);
  }

  @Patch(':id/assign')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignDto) {
    return this.conversationsService.assign(id, dto);
  }

  @Patch(':id/bot')
  setBot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetBotDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.conversationsService.setBot(id, dto, user.sub);
  }

  @Post(':id/notes')
  addNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.conversationsService.addNote(id, dto, user?.sub);
  }

  @Delete(':id/notes/:noteId')
  deleteNote(
    @Param('id', ParseIntPipe) id: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ) {
    return this.conversationsService.deleteNote(id, noteId);
  }
}
