import { IsString, IsOptional } from 'class-validator';

export class UpdateProjectDetailDto {
  @IsString() @IsOptional() categorySlug?: string;

  @IsString() @IsOptional() heroTitle?: string;
  @IsString() @IsOptional() heroDesktopDesc?: string;
  @IsString() @IsOptional() heroMobileDesc?: string;
  @IsOptional() heroImages?: any;
  @IsString() @IsOptional() heroCtaText?: string;
  @IsString() @IsOptional() heroCtaLink?: string;

  @IsString() @IsOptional() overviewTitleLight?: string;
  @IsString() @IsOptional() overviewTitleBold?: string;
  @IsString() @IsOptional() overviewBrandName?: string;
  @IsString() @IsOptional() overviewDebutText?: string;
  @IsString() @IsOptional() overviewLocationText?: string;
  @IsString() @IsOptional() overviewDebutTextEnd?: string;
  @IsString() @IsOptional() overviewDescription?: string;
  @IsString() @IsOptional() overviewImageLarge?: string;
  @IsString() @IsOptional() overviewImageLargeLabel?: string;
  @IsString() @IsOptional() overviewImageMedium?: string;
  @IsString() @IsOptional() overviewImageMediumLabel?: string;
  @IsString() @IsOptional() overviewImageSmall?: string;
  @IsString() @IsOptional() overviewImageSmallLabel?: string;
  @IsOptional() overviewDataRows?: any;

  @IsString() @IsOptional() featuresHeaderMain?: string;
  @IsString() @IsOptional() featuresHeaderSub?: string;
  @IsString() @IsOptional() featuresTitleLight?: string;
  @IsString() @IsOptional() featuresTitleBold?: string;
  @IsOptional() featuresSections?: any;
  @IsString() @IsOptional() brochureFile?: string;

  @IsString() @IsOptional() locationTitleLight?: string;
  @IsString() @IsOptional() locationTitleBold?: string;
  @IsString() @IsOptional() locationMainLead?: string;
  @IsString() @IsOptional() locationSubText?: string;
  @IsString() @IsOptional() locationMapImage?: string;
  @IsString() @IsOptional() locationFooterAddress?: string;
  @IsString() @IsOptional() locationGoogleMapsUrl?: string;

  @IsString() @IsOptional() seoTitle?: string;
  @IsString() @IsOptional() seoDescription?: string;
  @IsString() @IsOptional() ogImage?: string;
}
