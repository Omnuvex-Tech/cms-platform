import { Injectable } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { MailService } from '../mail/mail.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly repo: ContactRepository,
    private readonly mailService: MailService,
    private readonly bitrixService: BitrixService,
  ) {}

  async createSubmission(dto: CreateContactSubmissionDto) {
    const submission = await this.repo.createSubmission(dto);

    const comments = [
      dto.service && `Service: ${dto.service}`,
      dto.budget && `Budget: ${dto.budget}`,
      dto.timeline && `Timeline: ${dto.timeline}`,
      dto.message,
    ]
      .filter(Boolean)
      .join('\n');

    // Fire-and-forget: never blocks or fails the CTA's own response.
    this.bitrixService.createLead({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      comments,
      sourceDescription: 'Contact form',
      sourceId: BITRIX_SOURCE.CUSTOMER,
    });

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
