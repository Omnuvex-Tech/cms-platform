import { Module } from '@nestjs/common';
import { BrokerRegistrationController } from './broker-registration.controller';
import { BrokerRegistrationService } from './broker-registration.service';
import { BrokerRegistrationRepository } from './broker-registration.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [BrokerRegistrationController],
  providers: [BrokerRegistrationService, BrokerRegistrationRepository, PrismaService],
})
export class BrokerRegistrationModule {}
