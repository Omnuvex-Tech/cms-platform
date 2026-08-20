import { Injectable, Logger } from '@nestjs/common';
import { SubscriberRepository } from './subscriber.repository';
import { MailService } from '../mail/mail.service';
import { BitrixService, BITRIX_SOURCE } from '../Bitrix/bitrix.service';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);

  constructor(
    private readonly repo: SubscriberRepository,
    private readonly mailService: MailService,
    private readonly bitrixService: BitrixService,
  ) {}

  async subscribe(email: string) {
    const result = await this.repo.create({ email });

    // Fire-and-forget: never blocks or fails the CTA's own response.
    this.bitrixService.createLead({
      name: email,
      email,
      comments: 'Newsletter subscription',
      sourceDescription: 'Newsletter',
      sourceId: BITRIX_SOURCE.CUSTOMER,
    });

    try {
      await this.mailService.sendNewsletterWelcome(email);
    } catch (err) {
      this.logger.warn('Newsletter xoş gəlmisiniz maili göndərilmədi', err);
    }
    return result;
  }

  async findAll() {
    return this.repo.findAll();
  }

  async unsubscribe(email: string) {
    return this.repo.unsubscribe(email);
  }
}
