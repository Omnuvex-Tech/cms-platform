import { IsString, IsObject, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  image: string;

  @IsOptional() @IsObject()
  altText?: Record<string, string>;

  @IsObject()
  name: Record<string, string>;

  @IsInt() @Min(1)
  sectionId: number;

  @IsOptional() @IsInt() @Min(0)
  order?: number;
}