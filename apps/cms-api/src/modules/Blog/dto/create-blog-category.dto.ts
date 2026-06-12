import { IsObject, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
  @IsObject()
  label: Record<string, string>;

  @IsString()
  slug: string;
}