import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBrokerRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  brokerType?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
