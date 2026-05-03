import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//creating the guard that uses jwt strategy to protect routes
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
