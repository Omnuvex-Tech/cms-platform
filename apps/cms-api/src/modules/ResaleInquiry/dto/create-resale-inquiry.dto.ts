import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateResaleInquiryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  /** Internal listing identifier, if the frontend resolves one. */
  @IsString()
  @IsOptional()
  listingId?: string;

  /** e.g. "1-ROOM" / "2-ROOM FLAT". */
  @IsString()
  @IsOptional()
  rooms?: string;

  /** e.g. "108 m²". */
  @IsString()
  @IsOptional()
  area?: string;

  /** e.g. "1/6" from "1/6 FLOOR". */
  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  price?: string;

  /** Name of the sales agent the resale listing is assigned to, if shown on the page. */
  @IsString()
  @IsOptional()
  agentName?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
