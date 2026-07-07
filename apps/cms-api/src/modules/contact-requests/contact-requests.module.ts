import { Module } from '@nestjs/common';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestsRepository } from './contact-requests.repository';

@Module({
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService, ContactRequestsRepository],
})
export class ContactRequestsModule {}
