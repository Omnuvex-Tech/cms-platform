export class ReorderNavLinkItemDto {
  id: number;
  order: number;
}

export class ReorderNavLinksDto {
  links: ReorderNavLinkItemDto[];
}