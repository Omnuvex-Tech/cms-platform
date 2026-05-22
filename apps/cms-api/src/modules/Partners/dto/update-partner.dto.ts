import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  name?: string;
  
    @IsOptional()  
  @IsBoolean()
  isVisible?: boolean;
}