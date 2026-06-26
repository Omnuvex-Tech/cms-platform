export class UpdateHeroDto {
  title?: Record<string, string>;
  description?: Record<string, string>;
  primaryBtnText?: Record<string, string>;
  primaryBtnLink?: string;
  primaryBtnNewTab?: boolean;
  secondaryBtnText?: Record<string, string>;
  secondaryBtnLink?: string;
  secondaryBtnNewTab?: boolean;
}