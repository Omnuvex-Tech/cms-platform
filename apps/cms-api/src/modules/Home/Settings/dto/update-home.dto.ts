export class UpdateHomeDto {
  projectsTitle?: Record<string, string>;
  projectsBtnText?: Record<string, string>;
  projectsBtnLink?: string;
  projectsBtnNewTab?: boolean;
  teamTitle?: Record<string, string>;
  teamBtnText?: Record<string, string>;
  teamBtnLink?: string;
  teamBtnNewTab?: boolean;
  teamImage?: string;
  blogsTitle?: Record<string, string>;
  blogsBtnText?: Record<string, string>;
  blogsBtnLink?: string;
  blogsBtnNewTab?: boolean;
}