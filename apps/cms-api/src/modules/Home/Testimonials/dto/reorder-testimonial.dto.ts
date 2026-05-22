import { IsArray, IsInt } from 'class-validator';

export class ReorderTestimonialDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}