import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateAboutSettingsDto {
  @IsOptional() @IsString() heroImage?: string;
  @IsOptional() @IsString() heroImageAlt?: string;
  @IsOptional() @IsString() heroBadge?: string;
  @IsOptional() @IsString() heroTitle?: string;
  @IsOptional() @IsArray() heroParagraphs?: string[];
  @IsOptional() @IsArray() storyBlocks?: any[];
  @IsOptional() @IsString() teamTitle?: string;
  @IsOptional() @IsString() teamDescription?: string;
  @IsOptional() @IsString() teamCtaLabel?: string;
  @IsOptional() @IsString() teamCtaHref?: string;
}