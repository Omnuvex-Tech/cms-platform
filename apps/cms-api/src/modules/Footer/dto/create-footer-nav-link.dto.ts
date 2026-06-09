export class CreateFooterNavLinkDto {
  label: string;
  href: string;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
}