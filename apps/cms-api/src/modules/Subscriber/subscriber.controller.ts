import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SubscriberService } from './subscriber.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Controller('newsletter')
export class SubscriberController {
  constructor(private readonly service: SubscriberService) {}

  @Public()
  @Post('subscribe')
  async subscribe(@Body() dto: CreateSubscriberDto) {
    return this.service.subscribe(dto.email);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
