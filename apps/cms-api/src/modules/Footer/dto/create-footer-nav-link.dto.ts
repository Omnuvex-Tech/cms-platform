import { IsObject, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateFooterNavLinkDto {
  @IsObject()
  label: Record<string, string>;

  @IsString()
  href: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;
}