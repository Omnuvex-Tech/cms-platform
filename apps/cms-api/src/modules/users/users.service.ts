import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  list(role?: Role) {
    return this.usersRepository.findMany(role);
  }

  async get(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
