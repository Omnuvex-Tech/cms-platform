import { IsObject } from 'class-validator';

export class CreateSectionDto {
  @IsObject()
  title: Record<string, string>;

  @IsObject()
  description: Record<string, string>;
}
