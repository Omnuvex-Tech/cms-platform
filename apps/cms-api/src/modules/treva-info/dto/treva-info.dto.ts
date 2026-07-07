import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InfoStatus } from '@prisma/client';

export class UpdateTrevaInfoDto {
  @IsOptional() @IsString() mission?: string;
  @IsOptional() @IsString() vision?: string;
  @IsOptional() @IsString() whoWeAre?: string;
  @IsOptional() @IsString() whyChoose?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() hotline?: string;
  @IsOptional() @IsEnum(InfoStatus) status?: InfoStatus;
}
