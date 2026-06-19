import { IsObject } from 'class-validator';

export class CreatePortfolioSettingsDto {
  @IsObject()
  sectionTitle: Record<string, string>;

  @IsObject()
  dropdownLabel: Record<string, string>;

  @IsObject()
  moreButtonLabel: Record<string, string>;
}