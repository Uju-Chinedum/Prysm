import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppResponse, PaginatedResponse } from 'src/types/app';
import { SafeOrganization } from 'src/types/service';
import { AppUtils, DBUtils } from 'src/common/utils';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

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

  findOne(id: number) {
    return `This action returns a #${id} organization`;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
