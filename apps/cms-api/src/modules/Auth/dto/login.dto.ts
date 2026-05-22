import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid data' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Invalid data' })
  @Matches(/(?=.*[A-Z])/, { message: 'Invalid data' })
  @Matches(/(?=.*[0-9])/, { message: 'Invalid data' })
  password: string;
}