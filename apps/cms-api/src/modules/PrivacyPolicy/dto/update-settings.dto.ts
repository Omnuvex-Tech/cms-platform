import { PartialType } from '@nestjs/mapped-types';
import { CreatePrivacyPolicySettingsDto } from './create-settings.dto';

export class UpdatePrivacyPolicySettingsDto extends PartialType(
  CreatePrivacyPolicySettingsDto,
) {}