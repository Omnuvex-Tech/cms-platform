import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ContactRequestStatus } from '@prisma/client';

export class SetContactStatusDto {
  @IsEnum(ContactRequestStatus)
  status: ContactRequestStatus;
}

export class AssignContactDto {
  @IsOptional()
  @IsInt()
  ownerId?: number | null;
}

export class OutcomeDto {
  @IsString()
  followUpOutcome: string;
}
