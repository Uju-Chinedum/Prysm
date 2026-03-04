import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required roles for an endpoint.
 * Usage: @Roles('OWNER'), @Roles('OWNER', 'ADMIN')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
