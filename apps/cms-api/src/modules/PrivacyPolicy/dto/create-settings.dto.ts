import { IsObject } from 'class-validator';

export class CreatePrivacyPolicySettingsDto {
  @IsObject()
  title: Record<string, string>;

  @IsObject()
  description: Record<string, string>;
}