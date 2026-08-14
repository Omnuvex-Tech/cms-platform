import { IsArray, IsString } from 'class-validator';

export class ReorderLayihelerimizDto {
  // Kateqoriya id-ləri istənilən sırada; indeks order sütununa yazılır.
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
