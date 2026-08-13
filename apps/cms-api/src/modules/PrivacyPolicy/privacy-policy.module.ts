import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyRepository } from './privacy-policy.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService, PrivacyPolicyRepository],
  exports: [PrivacyPolicyService],
})
export class PrivacyPolicyModule {}