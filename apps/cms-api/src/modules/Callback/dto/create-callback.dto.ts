import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCallbackDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  /**
   * Müştəri/Developer/Broker — set by the widget's role selector.
   * Optional because the homepage callback CTA ("Ready to take the first
   * step?") has no role selector and always means a customer lead; defaults
   * to Müştəri in the service when omitted.
   */
  @IsString()
  @IsOptional()
  role?: string;
}
