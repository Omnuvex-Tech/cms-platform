import { IsString, IsOptional } from 'class-validator';

export class CreatePulseKeywordDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
