import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class UpdateAboutSettingsDto {
  @IsOptional() @IsString() heroImage?: string;
  @IsOptional() @IsObject() heroImageAlt?: Record<string, string>;
  @IsOptional() @IsObject() heroBadge?: Record<string, string>;
  @IsOptional() @IsObject() heroTitle?: Record<string, string>;
  @IsOptional() @IsArray() heroParagraphs?: Record<string, string>[];
  @IsOptional() @IsArray() storyBlocks?: {
    title: Record<string, string>;
    paragraphs: Record<string, string>[];
    image?: string;
    imageAlt?: Record<string, string>;
  }[];
  @IsOptional() @IsObject() teamTitle?: Record<string, string>;
  @IsOptional() @IsObject() teamDescription?: Record<string, string>;
  @IsOptional() @IsObject() teamCtaLabel?: Record<string, string>;
  @IsOptional() @IsString() teamCtaHref?: string;
@IsOptional() @IsArray() heroStats?: {
    icon?: string;
    label: Record<string, string>;
    value: string;
}[];}