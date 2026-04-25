import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TaskModule } from './task/task.module.js';
import { TeamModule } from './team/team.module.js';
import { CommentModule } from './comments/comment.module.js';
import { ActivityLogModule } from './logs/activity-log.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule,
    PrismaModule,
    TaskModule,
    TeamModule,
    CommentModule,
    ActivityLogModule,
    AdminModule,
  ],
})
export class AppModule {}