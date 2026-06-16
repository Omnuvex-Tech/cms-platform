import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional() @IsString()
  image?: string;

  @IsOptional() @IsObject()
  altText?: Record<string, string>;

  @IsOptional() @IsObject()
  name?: Record<string, string>;

  @IsOptional() @IsBoolean()
  isVisible?: boolean;
}