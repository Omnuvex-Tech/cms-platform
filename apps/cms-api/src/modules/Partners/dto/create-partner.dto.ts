// create-partner.dto.ts
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  sectionId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}