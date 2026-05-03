import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private prisma: PrismaService,
  ) {}

  private async checkAdmin(userId: number) {
    const prisma = this.prisma as any;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('users')
  async getAllUsers(@Request() req: any) {
    await this.checkAdmin(req.user.userId);
    const users = await this.adminService.getAllUsers();
    return { users };
  }

  @Get('users/:id')
  async getUserById(@Request() req: any, @Param('id') id: string) {
    await this.checkAdmin(req.user.userId);
    const user = await this.adminService.getUserById(parseInt(id));
    return { user };
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    await this.checkAdmin(req.user.userId);
    const user = await this.adminService.updateUserRole(
      parseInt(id),
      body.role,
    );
    return { user };
  }

  @Delete('users/:id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    await this.checkAdmin(req.user.userId);
    return this.adminService.deleteUser(parseInt(id));
  }

  @Post('users')
  async createUser(@Request() req: any, @Body() body: any) {
    await this.checkAdmin(req.user.userId);
    const user = await this.adminService.createUser(
      body.name,
      body.email,
      body.password,
      body.role,
    );
    return { user };
  }
}
