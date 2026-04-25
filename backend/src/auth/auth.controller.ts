import { Body, Controller, Post, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto:any){
    return await this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto:any){
    return await this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    return await this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("update-profile")
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return await this.authService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("users")
  async getAllUsers() {
    return { users: await this.authService.getAllUsers() };
  }
}
