import {
  IsString, IsInt, IsBoolean, IsOptional,
  IsArray, IsEnum, IsDateString, Min,
} from 'class-validator';

export enum BulletType {
  BULLET   = 'BULLET',
  NUMBERED = 'NUMBERED',
  DASH     = 'DASH',
}

export class CreateVacancyDto {
  @IsString()
  title: string;

  @IsInt()
  categoryId: number;

@IsString()
slug: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsString()
  newLabel?: string;

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
  @IsString()
  aboutRole?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsible?: string[];

  @IsOptional()
  @IsEnum(BulletType)
  responsibleType?: BulletType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsEnum(BulletType)
  requirementsType?: BulletType;
}