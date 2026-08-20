import { Module } from '@nestjs/common';
import { SubscriberController } from './subscriber.controller';
import { SubscriberService } from './subscriber.service';
import { SubscriberRepository } from './subscriber.repository';
import { MailModule } from '../mail/mail.module';
import { BitrixModule } from '../Bitrix/bitrix.module';

@Module({
  imports: [MailModule, BitrixModule],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
})
export class SubscriberModule {}
