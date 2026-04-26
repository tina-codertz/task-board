import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CommentService {//this class can be injected across the nest app
  constructor(private prisma: PrismaService) {}

  async createComment(taskId: number, userId: number, content: string) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Log comment creation
    await prisma.activityLog.create({
      data: {
        action: 'COMMENT_ADDED',
        description: `Comment added to task "${task.title}"`,
        userId,
        taskId,
        commentId: comment.id,
        metadata: { comment: content.substring(0, 100) },
      },
    });

    return comment;
  }

  async getTaskComments(taskId: number) {
    const prisma = this.prisma as any;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  async deleteComment(commentId: number, userId: number) {
    const prisma = this.prisma as any;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new BadRequestException('Comment not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (comment.userId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const task = await prisma.task.findUnique({ where: { id: comment.taskId } });
    await prisma.comment.delete({ where: { id: commentId } });

    // Log comment deletion
    await prisma.activityLog.create({
      data: {
        action: 'COMMENT_DELETED',
        description: `Comment deleted from task "${task.title}"`,
        userId,
        taskId: comment.taskId,
        metadata: { commentContent: comment.content.substring(0, 100) },
      },
    });

    return { message: 'Comment deleted successfully' };
  }

  async updateComment(commentId: number, userId: number, content: string) {
    const prisma = this.prisma as any;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new BadRequestException('Comment not found');

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return updatedComment;
  }
}
