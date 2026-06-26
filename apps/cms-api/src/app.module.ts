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
import { ServiceModule } from './modules/Service/service.module';
import { BlogModule } from './modules/Blog/blog.module';
import { AboutModule } from './modules/About/about.module';
import { NavbarSettingsModule } from './modules/Navbar/navbar.module';
import { FooterModule } from './modules/Footer/footer.module';
import { ContactModule } from './modules/Contact/contact.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PageMetaModule } from './modules/page-meta/page-meta.module';
import { HeroModule } from './modules/Home/Hero/hero.module';
import { HomeModule } from './modules/Home/Settings/home.module';

@Module({
  imports: [PrismaModule, AuthModule, FaqModule, TestimonialsModule, VacancyModule, PortfolioModule, PartnersModule,
            ServiceModule, BlogModule, AboutModule, NavbarSettingsModule, FooterModule, ContactModule,SearchModule,
            DashboardModule,PageMetaModule, HeroModule, HomeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}