import { IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}