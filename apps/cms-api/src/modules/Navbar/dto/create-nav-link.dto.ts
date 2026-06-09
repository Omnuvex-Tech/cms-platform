export class CreateNavLinkDto {
  label: string;
  href: string;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
}