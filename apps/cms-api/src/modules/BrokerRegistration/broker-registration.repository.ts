import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrokerRegistrationDto } from './dto/create-broker-registration.dto';

@Injectable()
export class BrokerRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBrokerRegistrationDto) {
    return this.prisma.brokerRegistration.create({ data });
  }

  findAll() {
    return this.prisma.brokerRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  delete(id: number) {
    return this.prisma.brokerRegistration.delete({ where: { id } });
  }
}
