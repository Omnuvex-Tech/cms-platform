import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTrevaInfoSectionDto {
  @IsString() @MinLength(1) heading: string;
  @IsOptional() @IsString() content?: string;
}

export class UpdateTrevaInfoSectionDto {
  @IsOptional() @IsString() @MinLength(1) heading?: string;
  @IsOptional() @IsString() content?: string;
}

export class ReorderTrevaInfoSectionsDto {
  @IsInt({ each: true }) ids: number[];
}
