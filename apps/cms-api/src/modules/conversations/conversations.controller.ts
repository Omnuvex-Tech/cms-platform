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
} from '@nestjs/common';
import { Channel, ConversationStatus } from '@prisma/client';
import { ConversationsService } from './conversations.service';
import {
  AddNoteDto,
  AssignDto,
  ReplyDto,
  SetBotDto,
  SetStatusDto,
} from './dto/conversation.dto';
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

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.get(id);
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
  setBot(@Param('id', ParseIntPipe) id: number, @Body() dto: SetBotDto) {
    return this.conversationsService.setBot(id, dto);
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
