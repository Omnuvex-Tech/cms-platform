import { IsObject, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePrivacyPolicySectionDto {
  @IsObject()
  title: Record<string, string>;

  @IsObject()
  description: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}