import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  //services class so it can be injected in the controller
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Helper method to log authentication activity
  private async logAuthActivity(
    userId: number,
    action: string,
    success: boolean,
    metadata: any = {},
  ) {
    try {
      const prisma = this.prisma as any;
      await prisma.activityLog.create({
        data: {
          action: `AUTH_${action}`,
          description: `${action} attempt ${success ? 'succeeded' : 'failed'}`,
          userId,
          metadata: {
            success,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      });
    } catch (error) {
      // Silently fail logging - don't interrupt auth flow
    }
  }
  async register(dto: any) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const prisma = this.prisma as any;
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: 'USER', //this will be the default role
      },
    });

    // Log successful registration
    try {
      await prisma.activityLog.create({
        data: {
          action: 'AUTH_REGISTER',
          description: `New user registered: ${user.name}`,
          userId: user.id,
          metadata: {
            email: user.email,
            role: user.role,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {}

    return this.signToken(user);
  }

  async login(dto: any) {
    const prisma = this.prisma as any;
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        console.log('[LOGIN FAILED] User not found');
        // Log failed login attempt (user not found)
        try {
          await prisma.activityLog.create({
            data: {
              action: 'AUTH_LOGIN_FAILED',
              description: `Failed login attempt for email: ${dto.email}`,
              userId: 0, // Special ID for failed auth attempts
              metadata: {
                reason: 'user_not_found',
                email: dto.email,
                timestamp: new Date().toISOString(),
              },
            },
          });
        } catch (logError) {
          console.error('Failed to log failed login:', logError);
        }
        throw new UnauthorizedException('invalid credentials');
      }

      const valid = await bcrypt.compare(dto.password, user.password);
      console.log('[LOGIN] Password comparison result', valid);

      if (!valid) {
        console.log('[LOGIN FAILED] Invalid password for user failed');
        // Log failed password attempt
        await this.logAuthActivity(user.id, 'LOGIN_FAILED', false, {
          reason: 'invalid_password',
          email: dto.email,
        });
        throw new UnauthorizedException('invalid credentials');
      }

      // Login successful - log it
      console.log('[LOGIN SUCCESS] User logged in');
      await this.logAuthActivity(user.id, 'LOGIN_SUCCESS', true, {
        email: user.email,
        role: user.role,
      });

      return this.signToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw error;
    }
  }
  signToken(user: any) {
    const token = this.jwt.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const prisma = this.prisma as any;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return { user };
  }

  async updateProfile(userId: number, updateData: any) {
    const prisma = this.prisma as any;

    const data: any = {};
    if (updateData.name) data.name = updateData.name;
    if (updateData.email) data.email = updateData.email;

    if (updateData.newPassword) {
      // Verify current password
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const isValid = await bcrypt.compare(
        updateData.currentPassword,
        user.password,
      );
      if (!isValid)
        throw new UnauthorizedException('Current password is incorrect');

      data.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    return { user: updatedUser };
  }

  async getUserById(userId: number) {
    const prisma = this.prisma as any;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return user;
  }

  async getAllUsers() {
    const prisma = this.prisma as any;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return users;
  }

  async updateUserRole(userId: number, newRole: string) {
    const prisma = this.prisma as any;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });
    return updatedUser;
  }

  async deleteUser(userId: number) {
    const prisma = this.prisma as any;
    await prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'User deleted successfully' };
  }

  async addUser(name: string, email: string, password: string, role: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const prisma = this.prisma as any;
    const newUser = await prisma.user.create({
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
}
