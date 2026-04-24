import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";



@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean  {
            const requiredRoles=this.reflector.get<String[]>(
                "roles",
                context.getHandler(),

            );

            //if no roles defined allow access
            if(!requiredRoles) return true;
            const request = context .switchToHttp().getRequest();
            const user = request.user;

            if(!user || !requiredRoles.includes(user.role)){
                throw new ForbiddenException("Access denied")
            }

            return true
        }
    }
