import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule, //gives  for DB access
    PassportModule.register({ defaultStrategy: 'jwt' }), //enables authentication system
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ,
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController], // use this controller to handle incoming requests related to authentication and user management
  providers: [
    AuthService,
    JwtStrategy,
  ],// use this service to handle the business logic related to authentication, such as registering new users, validating credentials, and generating JWT tokens. The JwtStrategy is used to define how JWT tokens should be validated and how user information should be extracted from the token.
  exports: [JwtModule, PassportModule],// export the JwtModule and PassportModule so that they can be used in other modules that import the AuthModule, allowing other parts of the application to use JWT authentication and Passport's authentication features.
})
export class AuthModule {}