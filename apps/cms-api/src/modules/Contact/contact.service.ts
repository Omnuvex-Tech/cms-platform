import { Injectable } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { MailService } from '../mail/mail.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly repo: ContactRepository,
    private readonly mailService: MailService,
  ) {}

  async createSubmission(dto: CreateContactSubmissionDto) {
    const submission = await this.repo.createSubmission(dto);

    try {
      await this.mailService.sendContactSubmission({
        ...dto,
        submittedAt: submission.createdAt,
      });
    } catch (err) {
      console.error('MAIL ERROR:', err);
      return { ...submission, mailError: (err as any).message };
    }

    return submission;
  }

  async findAllSubmissions() {
    return this.repo.findAllSubmissions();
  }
}
