import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppResponse, PaginatedResponse } from 'src/types/app';
import { SafeOrganization } from 'src/types/service';
import { AppUtils, DBUtils } from 'src/common/utils';
import { PaginationDto } from 'src/common/dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { EmailService } from 'src/components/email/email.service';

@Injectable()
export class OrganizationsService {
  private logger = new Logger(OrganizationsService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private config: ConfigService,
  ) {}

  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<AppResponse<SafeOrganization>> {
    const { name } = dto;

    // prevent duplicate organization names for same user
    const existing = await this.prisma.organization.findFirst({
      where: {
        name,
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have an organization with this name',
      );
    }

    // create organization and membership in a transaction
    const organization = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId: org.id,
          role: 'OWNER',
        },
      });

      return org;
    });

    return AppUtils.successResponse(
      'Organization Created Successfully',
      organization,
      HttpStatus.CREATED,
    );
  }

  async findAllForUser(
    userId: string,
    dto: PaginationDto,
  ): Promise<AppResponse<PaginatedResponse<Partial<SafeOrganization>>>> {
    const { page = 1, limit = 10 } = dto;

    const data = await DBUtils.paginateData<SafeOrganization>(
      this.prisma.organization,
      {
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
      },
      page,
      limit,
    );

    return AppUtils.successResponse(
      'Organizations Retrieved Successfully',
      data,
    );
  }

  async findOne(
    userId: string,
    orgId: string,
  ): Promise<AppResponse<SafeOrganization>> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: orgId,
        memberships: {
          some: { userId },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return AppUtils.successResponse(
      'Organization Retrieved Successfully',
      organization,
    );
  }

  async update(
    userId: string,
    orgId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<AppResponse<SafeOrganization | null>> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.organization.updateMany({
        where: {
          id: orgId,
          memberships: {
            some: { userId },
          },
        },
        data: updateOrganizationDto,
      });

      if (!updated.count) {
        throw new NotFoundException('Organization not found');
      }

      const organization = await tx.organization.findUnique({
        where: { id: orgId },
      });

      return AppUtils.successResponse(
        'Organization Updated Successfully',
        organization,
      );
    });
  }

  async remove(orgId: string): Promise<AppResponse<null>> {
    const deleted = await this.prisma.organization.deleteMany({
      where: { id: orgId },
    });

    if (!deleted.count) {
      throw new NotFoundException('Organization not found');
    }

    return AppUtils.successResponse('Organization Deleted Successfully', null);
  }

  async inviteUser(userId: string, orgId: string, dto: InviteUserDto) {
    const { email, role } = dto;

    const member = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: orgId,
      },
    });
    if (!member) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    const token = randomUUID();

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        email,
        role,
        organizationId: orgId,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    const inviteUrl = `${this.config.get<string>('BACKEND_BASE_URL')}/organizations/invites/${token}/accept`;

    // Send mail
    try {
      await this.email.sendEmail(
        email,
        `Organization Invite`,
        `<p>You have been invited to join an organization.</p>
        <p>Click here to accept: <a href="${inviteUrl}">${inviteUrl}</a></p>`,
      );
    } catch (error) {
      this.logger.error('Failed to send invite email', error);
    }

    return AppUtils.successResponse('Member Invitation Sent', { inviteUrl });
  }
}
