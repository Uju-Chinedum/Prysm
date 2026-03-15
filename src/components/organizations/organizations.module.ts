import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/components/email/email.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, PrismaService, EmailService],
})
export class OrganizationsModule {}
