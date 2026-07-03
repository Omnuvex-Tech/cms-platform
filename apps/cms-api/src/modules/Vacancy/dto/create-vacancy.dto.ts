// create-vacancy.dto.ts
import {
  IsObject, IsInt, IsBoolean, IsOptional,
  IsArray, IsEnum, IsDateString, IsString, Min,
} from 'class-validator';

export enum BulletType {
  BULLET = 'BULLET',
  NUMBERED = 'NUMBERED',
  DASH = 'DASH',
}

export class CreateVacancyDto {
  @IsObject()
  title: Record<string, string>;

  @IsInt()
  categoryId: number;

  @IsString()
  slug: string;

  @IsOptional()
  @IsArray()
  tags?: Record<string, string>[];

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsObject()
  newLabel?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @IsOptional()
  @IsBoolean()
  isDateVisible?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  isStartDateVisible?: boolean;

  @IsOptional()
  @IsObject()
  aboutRole?: Record<string, string>;

  @IsOptional()
  @IsArray()
  skills?: Record<string, string>[];

  @IsOptional()
  @IsArray()
  responsible?: Record<string, string>[];

  @IsOptional()
  @IsEnum(BulletType)
  responsibleType?: BulletType;

  @IsOptional()
  @IsArray()
  requirements?: Record<string, string>[];

  @IsOptional()
  @IsEnum(BulletType)
  requirementsType?: BulletType;

  @IsOptional()
  @IsObject()
  seoTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  seoDescription?: Record<string, string>;

@IsOptional()
  @IsObject()
  seoKeywords?: Record<string, string>;

  @IsOptional()
  schema?: Record<string, any> | null;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  filterTagIds?: number[];
}