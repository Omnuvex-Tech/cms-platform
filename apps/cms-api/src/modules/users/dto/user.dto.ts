import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Password rules are deliberately identical to LoginDto's: the login route
 * validates the submitted password's shape before checking it, so a password
 * that fails these rules would produce an account that can never sign in.
 */
export class PasswordDto {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain an uppercase letter',
  })
  @Matches(/(?=.*[0-9])/, { message: 'Password must contain a number' })
  password: string;
}

export class CreateUserDto extends PasswordDto {
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be admin or sales_rep' })
  role?: Role;

  @IsOptional() @IsBoolean() isActive?: boolean;
}

/** Profile/role edits. Password changes go through ResetPasswordDto instead. */
export class UpdateUserDto {
  @IsOptional() @IsEmail({}, { message: 'A valid email is required' })
  email?: string;

  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be admin or sales_rep' })
  role?: Role;

  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ResetPasswordDto extends PasswordDto {}
