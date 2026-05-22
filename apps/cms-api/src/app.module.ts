import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/Auth/auth.module';
import { FaqModule } from './modules/Home/Faq/faq.module';
import { TestimonialsModule } from './modules/Home/Testimonials/testimonials.module';
import { VacancyModule } from './modules/Vacancy/vacancy.module';
import { PortfolioModule } from './modules/Portfolio/portfolio.module';
import { PartnersModule } from './modules/Partners/partners.module';

@Module({
  imports: [PrismaModule, AuthModule, FaqModule, TestimonialsModule,VacancyModule, PortfolioModule,PartnersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}