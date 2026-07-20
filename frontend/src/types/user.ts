import type { UserRole } from './common';
import type { ImageDto } from './image';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  avatar: ImageDto | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarId?: string;
}

export interface UpdateAdminUserDto {
  role?: UserRole;
  isActive?: boolean;
}
