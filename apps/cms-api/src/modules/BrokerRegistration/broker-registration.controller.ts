import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { BrokerRegistrationService } from './broker-registration.service';
import { CreateBrokerRegistrationDto } from './dto/create-broker-registration.dto';

@Controller('broker-registration')
export class BrokerRegistrationController {
  constructor(private readonly service: BrokerRegistrationService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateBrokerRegistrationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
