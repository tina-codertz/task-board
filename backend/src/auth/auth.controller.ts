import { Body, Controller, Post, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto){
    console.log('[CONTROLLER] Register called with:', { name: dto.name, email: dto.email });
    return await this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto){
    console.log('[CONTROLLER] Login called with email:', dto.email);
    return await this.authService.login(dto);
  }

  // Debug endpoint - check all users in database
  @Get("debug/users")
  async debugUsers(@Request() req: any) {
    try {
      const users = await this.authService.getAllUsers();
      return { 
        message: 'All users in database',
        count: users?.length || 0,
        users: users?.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })) || []
      };
    } catch (error) {
      return { error: error.message };
    }
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
