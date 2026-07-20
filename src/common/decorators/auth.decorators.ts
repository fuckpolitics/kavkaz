import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../../database/enums/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Auth = (...roles: UserRole[]) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
  );
