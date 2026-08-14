import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class UpdateProjectDetailDto {
  @IsString() @IsOptional() categorySlug?: string;

  // ─── v2: blok əsaslı kontent ───
  // sections = [{ type, isVisible, ...data }]
  @IsArray() @IsOptional() sections?: any[];
  @IsOptional() schema?: any;

  // ─── legacy v1 sahələri ───
  // sections-a tam keçiddən sonra silinəcək. Yeni yazılarda istifadə etmə.

  @IsObject() @IsOptional() heroTitle?: any;
  @IsObject() @IsOptional() heroDesktopDesc?: any;
  @IsObject() @IsOptional() heroMobileDesc?: any;
  @IsOptional() heroImages?: any;
  @IsObject() @IsOptional() heroCtaText?: any;
  @IsString() @IsOptional() heroCtaLink?: string;

  @IsObject() @IsOptional() overviewTitleLight?: any;
  @IsObject() @IsOptional() overviewTitleBold?: any;
  @IsObject() @IsOptional() overviewBrandName?: any;
  @IsObject() @IsOptional() overviewDebutText?: any;
  @IsObject() @IsOptional() overviewLocationText?: any;
  @IsObject() @IsOptional() overviewDebutTextEnd?: any;
  @IsObject() @IsOptional() overviewDescription?: any;
  @IsString() @IsOptional() overviewImageLarge?: string;
  @IsObject() @IsOptional() overviewImageLargeLabel?: any;
  @IsString() @IsOptional() overviewImageMedium?: string;
  @IsObject() @IsOptional() overviewImageMediumLabel?: any;
  @IsString() @IsOptional() overviewImageSmall?: string;
  @IsObject() @IsOptional() overviewImageSmallLabel?: any;
  @IsOptional() overviewDataRows?: any;

  @IsObject() @IsOptional() featuresHeaderMain?: any;
  @IsObject() @IsOptional() featuresHeaderSub?: any;
  @IsObject() @IsOptional() featuresTitleLight?: any;
  @IsObject() @IsOptional() featuresTitleBold?: any;
  @IsOptional() featuresSections?: any;
  @IsString() @IsOptional() brochureFile?: string;

  @IsObject() @IsOptional() locationTitleLight?: any;
  @IsObject() @IsOptional() locationTitleBold?: any;
  @IsObject() @IsOptional() locationBrandName?: any;
  @IsObject() @IsOptional() locationMainLead?: any;
  @IsObject() @IsOptional() locationSubText?: any;
  @IsString() @IsOptional() locationMapImage?: string;
  @IsObject() @IsOptional() locationFooterAddress?: any;
  @IsString() @IsOptional() locationGoogleMapsUrl?: string;

  @IsObject() @IsOptional() seoTitle?: any;
  @IsObject() @IsOptional() seoDescription?: any;
  @IsString() @IsOptional() ogImage?: string;
}
