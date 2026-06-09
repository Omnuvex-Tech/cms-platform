export class ReorderContactLinkItemDto {
  id: number;
  order: number;
}

export class ReorderContactLinksDto {
  links: ReorderContactLinkItemDto[];
}