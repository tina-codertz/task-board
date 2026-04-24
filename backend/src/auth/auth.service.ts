import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
    constructor(
        private prisma:PrismaService,
        private jwt:JwtService,
    ){}
    async register(dto:any){
        const hashed = await bcrypt.hash(dto.password,10);
        const prisma = this.prisma as any;

        const user = await prisma.user.create({
            data:{
                name:dto.name,
                email:dto.email,
                password:hashed,
                role:'USER' //this will be the default role
            },
        });

        return this.signToken(user);
    }

    async login(dto:any){
        const prisma = this.prisma as any;

        const user = await prisma.user.findUnique({
            where:{email:dto.email},
        

        });

        if (!user) throw new UnauthorizedException("invalid credentials");
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException("invalid credentials");

        return this.signToken(user)

    }
    signToken(user:any){
        const token = this.jwt.sign({
            sub:user.id,
            role:user.role,
        });

        return{
            access_token:token,
            user:{
             id:user.id,
             name:user.name,
             email:user.email,
             role:user.role,
            },
        };
    };

    async getProfile(userId: number) {
        const prisma = this.prisma as any;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
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
            const isValid = await bcrypt.compare(updateData.currentPassword, user.password);
            if (!isValid) throw new UnauthorizedException("Current password is incorrect");
            
            data.password = await bcrypt.hash(updateData.newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, role: true }
        });
        return { user: updatedUser };
    }

    async getUserById(userId: number) {
        const prisma = this.prisma as any;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });
        return user;
    }

    async getAllUsers() {
        const prisma = this.prisma as any;
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        return users;
    }

    async updateUserRole(userId: number, newRole: string) {
        const prisma = this.prisma as any;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: { id: true, name: true, email: true, role: true }
        });
        return updatedUser;
    }

    async deleteUser(userId: number) {
        const prisma = this.prisma as any;
        await prisma.user.delete({
            where: { id: userId },
        });
        return { message: "User deleted successfully" };
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
            select: { id: true, name: true, email: true, role: true }
        });
        return newUser;
    }
}
