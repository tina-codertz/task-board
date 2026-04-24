import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto:any){
    return this.authService.register(dto);

  }
  @Post("login")
  login(@Body() dto:any){
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}
