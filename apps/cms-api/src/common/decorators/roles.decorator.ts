import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restricts a route/controller to the given roles (e.g. 'admin'). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
