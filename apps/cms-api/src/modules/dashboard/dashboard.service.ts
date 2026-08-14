import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getStats() {
        const [
            project,
            pulseArticle,
            pulseAuthor,
            vacancy,
            contactSubmission,
            vacancySubmission,
            callbackRequest,
            brokerRegistration,
            subscriber,
        ] = await Promise.all([
            this.prisma.layihelerimizCategory.count(),
            this.prisma.pulseArticle.count(),
            this.prisma.pulseAuthor.count(),
            this.prisma.vacancy.count(),
            this.prisma.contactSubmission.count(),
            this.prisma.vacancySubmission.count(),
            this.prisma.callbackRequest.count(),
            this.prisma.brokerRegistration.count(),
            this.prisma.subscriber.count(),
        ]);

        return {
            project,
            pulseArticle,
            pulseAuthor,
            vacancy,
            contactSubmission,
            vacancySubmission,
            callbackRequest,
            brokerRegistration,
            subscriber,
        };
    }
}
