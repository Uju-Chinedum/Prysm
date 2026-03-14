import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { Role } from 'src/types/service';

export class InviteUserDto {
  @ApiProperty({
    description: 'The email of the user to invite',
    example: 'test@example.com',
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email address.' })
  email!: string;

  @ApiProperty({
    description: 'The role of the user to invite',
    example: 'MEMBER',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of the following: ${Object.values(Role).join(', ')}.`,
  })
  role?: Role;
}
