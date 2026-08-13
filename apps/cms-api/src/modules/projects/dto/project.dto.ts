import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProjectAudience, ProjectStatus } from '@prisma/client';
import { PROJECT_TAGS } from '../project-tags';

export class BedroomPricingDto {
  @IsString()
  label: string;

  @IsOptional() @IsNumber() areaMin?: number;
  @IsOptional() @IsNumber() areaMax?: number;
  @IsOptional() @IsNumber() priceMin?: number;
  @IsOptional() @IsNumber() priceMax?: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class StandardPaymentPlanDto {
  @IsOptional() @IsNumber() downPaymentPct?: number;
  @IsOptional() @IsNumber() discountPct?: number;
  @IsOptional() @IsInt() installmentMonths?: number;
  @IsOptional() @IsNumber() optionDiscountPct?: number;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class InternationalPlanTierDto {
  @IsOptional() @IsNumber() downPaymentPct?: number;
  @IsOptional() @IsNumber() discountPct?: number;
  @IsOptional() @IsInt() interestFreeMonths?: number;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;

  // Rejected rather than silently stored when unknown: a tag the bot doesn't
  // know matches no teaser category, so it would look set but do nothing.
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PROJECT_TAGS as readonly string[], { each: true })
  tags?: string[];

  @IsOptional() @IsEnum(ProjectAudience) audience?: ProjectAudience;

  @IsOptional() @IsString() aboutProject?: string;
  @IsOptional() @IsString() advantages?: string;
  @IsOptional() @IsString() targetAudience?: string;
  @IsOptional() @IsString() investmentAdvantages?: string;
  @IsOptional() @IsString() services?: string;

  @IsOptional() @IsNumber() pricePerM2Min?: number;
  @IsOptional() @IsNumber() pricePerM2Max?: number;
  @IsOptional() @IsNumber() areaMin?: number;
  @IsOptional() @IsNumber() areaMax?: number;
  @IsOptional() @IsNumber() totalPriceMin?: number;
  @IsOptional() @IsNumber() totalPriceMax?: number;
  @IsOptional() @IsBoolean() readyToMoveIn?: boolean;
  @IsOptional() @IsInt() completionYear?: number;
  @IsOptional() @IsString() handoverCondition?: string;
  @IsOptional() @IsBoolean() paymentPlanAvailable?: boolean;
  @IsOptional() @IsBoolean() bulkDiscountAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedroomPricingDto)
  bedroomPricing?: BedroomPricingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandardPaymentPlanDto)
  standardPlans?: StandardPaymentPlanDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternationalPlanTierDto)
  internationalTiers?: InternationalPlanTierDto[];
}

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional()
  @IsString()
  declare name: string;
}
