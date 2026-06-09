export class CreateVacancySubmissionDto {
  name: string;
  email: string;
  phone: string;
  message?: string;
  cvUrl: string;
  vacancyId?: number;
  vacancyTitle?: string;
}