import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/enums/user-role.enum';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional({ nullable: true })
  lastName: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  avatar: ImageDto | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: toImageDto(user.avatar),
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
