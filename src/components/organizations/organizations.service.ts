import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppResponse } from 'src/types/app';
import { SafeOrganization } from 'src/types/service';
import { AppUtils } from 'src/common/utils';

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

    return AppUtils.successResponse('Organization Created Successfully', organization, HttpStatus.CREATED);
  }

  findAll() {
    return `This action returns all organizations`;
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
