import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const prismaClient = this.prisma as any;
    const users = await prismaClient.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return users;
  }

  async updateUserRole(userId: number, newRole: string) {
    const prismaClient = this.prisma as any;
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });
    return updatedUser;
  }

  async deleteUser(userId: number) {
    const prismaClient = this.prisma as any;
    await prismaClient.user.delete({
      where: { id: userId },
    });
    return { message: 'User deleted successfully' };
  }

  async createUser(name: string, email: string, password: string, role: string) {
    const prismaClient = this.prisma as any;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return newUser;
  }

  async getUserById(userId: number) {
    const prismaClient = this.prisma as any;
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return user;
  }
}
