import { PartialType } from '@nestjs/mapped-types';
import { CreateVacancyCategoryDto } from './create-vacancy-category.dto';

export class UpdateVacancyCategoryDto extends PartialType(CreateVacancyCategoryDto) {}