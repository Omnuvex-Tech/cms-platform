import { IsString } from 'class-validator';

export class CreateBlogCategoryDto {
  @IsString()
  label: string;

  @IsString()
  slug: string;
}