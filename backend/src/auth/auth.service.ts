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
            select: { id: true, name: true, email: true, role: true }
        });
        return { user };
    }
}
