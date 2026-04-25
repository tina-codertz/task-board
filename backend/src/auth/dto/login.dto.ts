import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email!: string;

  @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    password!: string;
}
