import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class PortfolioServiceInputDto {
  @IsInt()
  serviceId: number;

  @IsString()
  coverImage: string;

  @IsOptional()
  @IsObject()
  coverImageAlt?: Record<string, string>;
}