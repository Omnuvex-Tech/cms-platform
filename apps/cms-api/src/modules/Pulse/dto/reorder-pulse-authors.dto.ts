import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/**
 * Komanda bölməsinin ardıcıllığı. Massivdəki yer birbaşa `order` dəyərinə
 * çevrilir, ona görə admin panel siyahını tam şəkildə göndərməlidir.
 */
export class ReorderPulseAuthorsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
