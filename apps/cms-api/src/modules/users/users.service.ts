import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/user.dto';

const SALT_ROUNDS = 10;

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

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.usersRepository.create({
      email,
      password,
      name: dto.name?.trim() || null,
      phone: dto.phone?.trim() || null,
      role: dto.role ?? 'sales_rep',
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.get(id);

    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const email = dto.email.trim().toLowerCase();
      const clash = await this.usersRepository.findByEmail(email);
      if (clash && clash.id !== id) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    // Never let the last active admin lose admin access, by demotion or by
    // deactivation — that would lock everyone out of the admin surface.
    const losingAdmin =
      user.role === 'admin' &&
      ((dto.role !== undefined && dto.role !== 'admin') ||
        dto.isActive === false);
    if (losingAdmin && user.isActive) {
      await this.assertNotLastAdmin();
    }

    return this.usersRepository.update(id, {
      email: dto.email ? dto.email.trim().toLowerCase() : undefined,
      name: dto.name !== undefined ? dto.name.trim() || null : undefined,
      phone: dto.phone !== undefined ? dto.phone.trim() || null : undefined,
      role: dto.role,
      isActive: dto.isActive,
    });
  }

  async resetPassword(id: number, dto: ResetPasswordDto) {
    await this.get(id);
    const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    await this.usersRepository.update(id, { password });
    return { success: true };
  }

  async remove(id: number) {
    const user = await this.get(id);

    if (user.role === 'admin' && user.isActive) {
      await this.assertNotLastAdmin();
    }

    const assigned = await this.usersRepository.countAssignedRecords(id);
    if (assigned.total > 0) {
      throw new BadRequestException(
        'This user still owns records (leads, handoffs, conversations or notes). ' +
          'Reassign them or deactivate the user instead of deleting.',
      );
    }

    await this.usersRepository.delete(id);
    return { success: true };
  }

  private async assertNotLastAdmin() {
    const admins = await this.usersRepository.countAdmins();
    if (admins <= 1) {
      throw new BadRequestException(
        'Cannot remove the last active admin. Promote another user to admin first.',
      );
    }
  }
}
