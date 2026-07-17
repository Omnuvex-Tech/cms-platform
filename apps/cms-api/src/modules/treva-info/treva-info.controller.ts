import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TrevaInfoService } from './treva-info.service';
import {
  CreateTrevaInfoSectionDto,
  UpdateTrevaInfoSectionDto,
} from './dto/treva-info-section.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Roles('admin')
@Controller('treva-info')
export class TrevaInfoController {
  constructor(private readonly trevaInfoService: TrevaInfoService) {}

  @Get()
  get() {
    return this.trevaInfoService.get();
  }

  @Post('sections')
  addSection(@Body() dto: CreateTrevaInfoSectionDto) {
    return this.trevaInfoService.addSection(dto);
  }

  @Patch('sections/:id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrevaInfoSectionDto,
  ) {
    return this.trevaInfoService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  removeSection(@Param('id', ParseIntPipe) id: number) {
    return this.trevaInfoService.removeSection(id);
  }
}
