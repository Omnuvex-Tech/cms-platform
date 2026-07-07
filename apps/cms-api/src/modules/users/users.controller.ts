import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query('role') role?: Role) {
    return this.usersService.list(role);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.get(id);
  }
}
