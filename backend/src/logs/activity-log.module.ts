import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service.js';
import { ActivityLogController } from './activity-log.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [ActivityLogService],
  controllers: [ActivityLogController],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
