import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BitrixModule } from '../Bitrix/bitrix.module';

@Module({
  imports: [PrismaModule, MailModule, BitrixModule],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService],
})
export class ContactModule {}
