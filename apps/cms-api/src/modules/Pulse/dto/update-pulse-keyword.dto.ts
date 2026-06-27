import { IsString, IsOptional } from 'class-validator';

export class UpdatePulseKeywordDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
