import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service.js';
import { CommentService } from '../comments/comment.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly commentService: CommentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTask(@Request() req: any, @Body() createTaskDto: any) {
    return await this.taskService.createTask(req.user.userId, createTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTasks(@Request() req: any) {
    return { tasks: await this.taskService.getAllTasks(req.user.userId) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('assigned')
  async getAssignedTasks(@Request() req: any) {
    return { tasks: await this.taskService.getTasksAssignedToMe(req.user.userId) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('team/:teamId')
  async getTasksByTeam(@Param('teamId') teamId: string) {
    return await this.taskService.getTasksByTeam(parseInt(teamId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return await this.taskService.getTaskById(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateTask(@Param('id') id: string, @Request() req: any, @Body() updateTaskDto: any) {
    return await this.taskService.updateTask(parseInt(id), req.user.userId, updateTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() statusDto: any,
  ) {
    return await this.taskService.updateTaskStatus(parseInt(id), req.user.userId, statusDto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Request() req: any) {
    return await this.taskService.deleteTask(parseInt(id), req.user.userId);
  }

  // Comment endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':taskId/comments')
  async addComment(
    @Param('taskId') taskId: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return await this.commentService.createComment(parseInt(taskId), req.user.userId, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':taskId/comments')
  async getComments(@Param('taskId') taskId: string) {
    return { comments: await this.commentService.getTaskComments(parseInt(taskId)) };
  }
}
