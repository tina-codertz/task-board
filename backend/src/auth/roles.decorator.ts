import { SetMetadata } from "@nestjs/common";

//this attaches meta data so that nest can ead it later
export const Roles = (...roles:String[])=>
    SetMetadata("roles", roles);