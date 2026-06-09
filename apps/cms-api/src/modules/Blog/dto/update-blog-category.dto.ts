import { IsString, IsOptional } from 'class-validator';

export class UpdateBlogCategoryDto {
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() slug?: string;
}