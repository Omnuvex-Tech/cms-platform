import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LeadStatus, Temperature } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional() @IsEnum(LeadStatus) salesStatus?: LeadStatus;
  @IsOptional() @IsEnum(Temperature) temperature?: Temperature;
  @IsOptional() @IsInt() ownerId?: number | null;
  @IsOptional() @IsString() nextAction?: string;
}
