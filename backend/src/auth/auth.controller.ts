import { Body, Controller, Post, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';


// all routes  within this controller will start with /auth
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  receives the registration data, validates and then calll the register method in the auth service to create a new user
  @Post("register")
  async register(@Body() dto: RegisterDto){
    return await this.authService.register(dto);
  }


  // receives the login credentials, validates them, and then calls the login method in the auth service to authenticate the user and return a JWT token if successful
  @Post("login")
  async login(@Body() dto: LoginDto){
    return await this.authService.login(dto);
  }

// get the current user profile, update the user profile, and get a list of all users in the system. These routes are protected by the JwtAuthGuard, which ensures that only authenticated users can access them
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    return await this.authService.getProfile(req.user.userId);
  }
 
  // allows authenticated users to update their profile information, such as name or email, by sending a PATCH request with the updated data. The auth service will handle the logic to update the user's profile in the database
  @UseGuards(JwtAuthGuard)
  @Patch("update-profile")
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return await this.authService.updateProfile(req.user.userId, dto);
  }

  // provides a way for authenticated users to retrieve a list of all users in the system. This can be useful for(manager and admin to view users ) or for(members to view other members in team). The auth service will handle the logic to fetch and return the list of users from the database
  @UseGuards(JwtAuthGuard)
  @Get("users")
  async getAllUsers() {
    return { users: await this.authService.getAllUsers() };
  }
}
