import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guards.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllLogs() {
    const logs = await this.activityLogService.getAllLogs();
    return Array.isArray(logs) ? logs : [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserLogs(@Param('userId') userId: string) {
    return this.activityLogService.getUserLogs(parseInt(userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('task/:taskId')
  getTaskLogs(@Param('taskId') taskId: string) {
    return this.activityLogService.getTaskLogs(parseInt(taskId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('action/:action')
  getLogsByAction(@Param('action') action: string) {
    return this.activityLogService.getLogsByAction(action);
  }

  @UseGuards(JwtAuthGuard)
  @Get('date-range')
  getLogsDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.activityLogService.getLogsDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
