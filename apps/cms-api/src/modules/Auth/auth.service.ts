import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const owner = await this.authRepository.findByEmail(dto.email);

    if (!owner) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!owner.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, owner.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: owner.id, email: owner.email, role: owner.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
      },
    };
  }

  async me(userId: number) {
    const owner = await this.authRepository.findById(userId);
    if (!owner) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: owner.id,
      email: owner.email,
      name: owner.name,
      role: owner.role,
      isActive: owner.isActive,
    };
  }
}