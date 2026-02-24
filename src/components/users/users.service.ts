import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppResponse } from 'src/types/app';
import { AppUtils } from 'src/common/utils';
import { SafeUser } from 'src/types/service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string): Promise<AppResponse<SafeUser>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const { password, ...safeUser } = user;

    return AppUtils.successResponse(
      'User Profile Retrieved Successfully',
      safeUser,
    );
  }

  async updateMe(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<AppResponse<SafeUser>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });

    const { password, ...safeUser } = updatedUser;

    return AppUtils.successResponse(
      'User Profile Updated Successfully',
      safeUser,
    );
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
