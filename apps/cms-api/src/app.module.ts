import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/Auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ProjectsModule } from './modules/projects/projects.module';
import { TrevaInfoModule } from './modules/treva-info/treva-info.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { HandoffsModule } from './modules/handoffs/handoffs.module';
import { ContactRequestsModule } from './modules/contact-requests/contact-requests.module';
import { LeadsModule } from './modules/leads/leads.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { IngestModule } from './modules/ingest/ingest.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TrevaInfoModule,
    ConversationsModule,
    HandoffsModule,
    ContactRequestsModule,
    LeadsModule,
    UsersModule,
    StatsModule,
    IngestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
