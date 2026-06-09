import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBlogAuthorDto {
  @IsString()
  name: string;
  
    @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsString()
  role?: string;

  @IsOptional() @IsString()
  avatar?: string;

  @IsOptional() @IsString()
  linkedinHref?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  skillsTitle?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];

  @IsOptional() @IsString() avatarAlt?: string;
@IsOptional() @IsString() linkedinIcon?: string;
}