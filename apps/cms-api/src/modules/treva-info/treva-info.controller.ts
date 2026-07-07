import { Body, Controller, Get, Put } from '@nestjs/common';
import { TrevaInfoService } from './treva-info.service';
import { UpdateTrevaInfoDto } from './dto/treva-info.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Roles('admin')
@Controller('treva-info')
export class TrevaInfoController {
  constructor(private readonly trevaInfoService: TrevaInfoService) {}

  @Get()
  get() {
    return this.trevaInfoService.get();
  }

  @Put()
  update(@Body() dto: UpdateTrevaInfoDto) {
    return this.trevaInfoService.update(dto);
  }
}
