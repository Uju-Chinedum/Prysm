import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../components/prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';
import { Role } from 'src/types/service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Read required roles from @Roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no role restriction
    }

    const request = context.switchToHttp().getRequest();

    // Check authentication
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check orgId param
    const orgId = request.params?.orgId;
    if (!orgId) {
      throw new ForbiddenException('Organization ID not provided');
    }

    // Map strings to Prisma Role enum
    const enumRoles: Role[] = requiredRoles.map(
      (r) => Role[r as keyof typeof Role],
    );

    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        userId,
        role: { in: enumRoles },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        `You must have one of the following roles to perform this action: ${requiredRoles.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}
