import { SetMetadata } from '@nestjs/common';

//this attaches meta data to route so that nest can read it later
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
