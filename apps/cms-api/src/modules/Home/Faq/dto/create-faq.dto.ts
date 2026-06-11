import { IsObject } from 'class-validator';

export class CreateFaqDto {
  @IsObject()
  question: Record<string, string>;

  @IsObject()
  answer: Record<string, string>;
}