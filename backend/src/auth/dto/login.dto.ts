import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

// this login dto defines the expected structure of the login request body, and includes validation rules to ensure the data is correct before it reaches the service layer
export class LoginDto {
  // rejectes empty inputs, ensures it's a string, and normalizes the email by trimming whitespace and converting to lowercase
  @IsNotEmpty({ message: 'Email is required' })

  //   The IsEmail decorator checks that the input is a valid email format
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password!: string;
}
