export class LocalizedStringDto {
  az?: string;
  en?: string;
  ru?: string;
}

export class UpdatePageMetaDto {
  seoTitle?: LocalizedStringDto;
  seoDescription?: LocalizedStringDto;
  seoKeywords?: LocalizedStringDto;
}