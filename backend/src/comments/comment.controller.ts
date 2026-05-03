import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':taskId')
  async createComment(
    @Param('taskId') taskId: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return await this.commentService.createComment(
      parseInt(taskId),
      req.user.userId,
      body.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    return await this.commentService.deleteComment(
      parseInt(id),
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return await this.commentService.updateComment(
      parseInt(id),
      req.user.userId,
      body.content,
    );
  }
}

// Handle task/:taskId/comments routes in TaskController
