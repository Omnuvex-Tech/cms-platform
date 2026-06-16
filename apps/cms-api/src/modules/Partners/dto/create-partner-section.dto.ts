import { IsObject, IsOptional } from 'class-validator';

export class CreatePartnerSectionDto {
  @IsObject()
  title: Record<string, string>;

  @IsObject()
  description: Record<string, string>;
}