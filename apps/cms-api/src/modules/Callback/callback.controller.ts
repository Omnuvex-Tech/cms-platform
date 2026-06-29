import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CallbackService } from './callback.service';
import { CreateCallbackDto } from './dto/create-callback.dto';

@Controller('callback')
export class CallbackController {
  constructor(private readonly service: CallbackService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateCallbackDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
