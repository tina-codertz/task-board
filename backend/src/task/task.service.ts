import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: number, createTaskDto: any) {
    const prisma = this.prisma as any;

    // Get user to check role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only managers and admins can create tasks');
    }

    const task = await prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || 'TODO',
        teamId: createTaskDto.teamId,
        createdById: userId,
        assignedToId: createTaskDto.assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        description: `Task "${task.title}" created`,
        userId,
        taskId: task.id,
        metadata: { title: task.title },
      },
    });

    return task;
  }

  async getAllTasks(userId: number) {
    const prisma = this.prisma as any;

    const tasks = await prisma.task.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  async getTasksAssignedToMe(userId: number) {
    const prisma = this.prisma as any;

    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  async getTasksCreatedByMe(userId: number) {
    const prisma = this.prisma as any;

    const tasks = await prisma.task.findMany({
      where: { createdById: userId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  async getTaskById(taskId: number) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return task;
  }

  async updateTask(taskId: number, userId: number, updateTaskDto: any) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Only task creator or admin can update
    if (task.createdById !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own tasks');
    }

    const oldStatus = task.status;
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: updateTaskDto.title || task.title,
        description: updateTaskDto.description || task.description,
        status: updateTaskDto.status || task.status,
        assignedToId: updateTaskDto.assignedToId || task.assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        team: true,
      },
    });

    // Log status change
    if (updateTaskDto.status && updateTaskDto.status !== oldStatus) {
      await prisma.activityLog.create({
        data: {
          action: 'TASK_STATUS_CHANGED',
          description: `Task status changed from ${oldStatus} to ${updateTaskDto.status}`,
          userId,
          taskId,
          metadata: { oldStatus, newStatus: updateTaskDto.status },
        },
      });
    }

    return updatedTask;
  }

  async updateTaskStatus(taskId: number, userId: number, newStatus: string) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    // Only assignee, creator, or admin can update status
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (
      task.assignedToId !== userId &&
      task.createdById !== userId &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException('You cannot update this task status');
    }

    const oldStatus = task.status;
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    // Log status change
    const action =
      newStatus === 'DONE' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED';
    await prisma.activityLog.create({
      data: {
        action,
        description: `Task status changed from ${oldStatus} to ${newStatus}`,
        userId,
        taskId,
        metadata: { oldStatus, newStatus },
      },
    });

    return updatedTask;
  }

  async deleteTask(taskId: number, userId: number) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (task.createdById !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    await prisma.task.delete({ where: { id: taskId } });

    // Log deletion
    await prisma.activityLog.create({
      data: {
        action: 'TASK_DELETED',
        description: `Task "${task.title}" deleted`,
        userId,
        metadata: { title: task.title },
      },
    });

    return { message: 'Task deleted successfully' };
  }

  async getTasksByTeam(teamId: number) {
    const prisma = this.prisma as any;

    const tasks = await prisma.task.findMany({
      where: { teamId },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }
}
