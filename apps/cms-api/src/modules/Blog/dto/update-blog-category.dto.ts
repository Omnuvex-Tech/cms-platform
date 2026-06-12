import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateBlogCategoryDto {
  @IsOptional() @IsObject() label?: Record<string, string>;
  @IsOptional() @IsString() slug?: string;
}