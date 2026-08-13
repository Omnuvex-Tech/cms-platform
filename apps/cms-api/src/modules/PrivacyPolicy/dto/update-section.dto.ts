import { PartialType } from '@nestjs/mapped-types';
import { CreatePrivacyPolicySectionDto } from './create-section.dto';

export class UpdatePrivacyPolicySectionDto extends PartialType(
  CreatePrivacyPolicySectionDto,
) {}