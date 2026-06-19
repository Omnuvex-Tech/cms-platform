import { IsObject, IsOptional } from 'class-validator';

export class UpdatePortfolioSettingsDto {
  @IsOptional()
  @IsObject()
  sectionTitle?: Record<string, string>;

  @IsOptional()
  @IsObject()
  dropdownLabel?: Record<string, string>;

  @IsOptional()
  @IsObject()
  moreButtonLabel?: Record<string, string>;
}