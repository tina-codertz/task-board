import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports:[
    PrismaModule,
    JwtModule.register({
      secret:'SUPER_SECRET_KEY',
      signOptions:{expiresIn:"1d"}
    })

  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
