import { IsObject, IsOptional } from 'class-validator';

export class UpdateOurTeamSettingsDto {
  @IsOptional() @IsObject()
  title?: Record<string, string>;

  @IsOptional() @IsObject()
  description?: Record<string, string>;
}