import { IsObject, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateBlogAuthorDto {
  @IsObject()
  name: Record<string, string>;

  @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsObject()
  role?: Record<string, string>;

  @IsOptional() @IsString()
  avatar?: string;

  @IsOptional() @IsObject()
  avatarAlt?: Record<string, string>;

  @IsOptional() @IsString()
  linkedinHref?: string;

  @IsOptional() @IsObject()
  bio?: Record<string, string>;

  @IsOptional() @IsObject()
  skillsTitle?: Record<string, string>;

  @IsOptional() @IsArray()
  skills?: Record<string, string>[];

  @IsOptional() @IsString()
  linkedinIcon?: string;

  @IsOptional() @IsBoolean()
  isVisible?: boolean;

  @IsOptional() @IsBoolean()
  isOurTeam?: boolean;
}