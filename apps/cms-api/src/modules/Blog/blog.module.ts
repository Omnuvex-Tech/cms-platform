import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogRepository } from './blog.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, BlogRepository, PrismaService],
})
export class BlogModule {}