import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getStats() {
        const [blog, vacancy, portfolio, team, service, contactSubmission, vacancySubmission, callbackRequest] = await Promise.all([
            this.prisma.blog.count(),
            this.prisma.vacancy.count(),
            this.prisma.portfolio.count(),
            this.prisma.blogAuthor.count({ where: { isOurTeam: true } }),
            this.prisma.service.count(),
            this.prisma.contactSubmission.count(),
            this.prisma.vacancySubmission.count(),
            this.prisma.callbackRequest.count(),
        ]);

        return { blog, vacancy, portfolio, team, service, contactSubmission, vacancySubmission, callbackRequest };
    }
}