// export class ReorderContactLinkItemDto {
//   id: number;
//   order: number;
// }

// export class ReorderContactLinksDto {
//   links: ReorderContactLinkItemDto[];
// }



import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderContactLinkItemDto {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderContactLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderContactLinkItemDto)
  links: ReorderContactLinkItemDto[];
}