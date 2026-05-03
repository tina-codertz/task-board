import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async getAllLogs() {
    const prisma = this.prisma as any;
    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500, // Get last 500 logs
    });
    return logs;
  }

  async getUserLogs(userId: number) {
    const prisma = this.prisma as any;
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return logs;
  }

  async getTaskLogs(taskId: number) {
    const prisma = this.prisma as any;
    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return logs;
  }

  async getLogsByAction(action: string) {
    const prisma = this.prisma as any;
    const logs = await prisma.activityLog.findMany({
      where: { action },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return logs;
  }

  async getLogsDateRange(startDate: Date, endDate: Date) {
    const prisma = this.prisma as any;
    const logs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return logs;
  }
}
