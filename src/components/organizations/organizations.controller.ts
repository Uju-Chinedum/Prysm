import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard_ } from '../auth/guard';
import { CurrentUser } from '../auth/decorator';
import { PaginationDto } from 'src/common/dto';
import { Roles, RolesGuard } from 'src/common/guards';

@UseGuards(AuthGuard_)
@Controller('api/v1/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({
    status: 200,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  create(
    @CurrentUser('id') id: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.createOrganization(
      id,
      createOrganizationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all organizations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of organizations retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  findAll(
    @CurrentUser('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.organizationsService.findAllForUser(id, paginationDto);
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Retrieve a specific organization' })
  @ApiParam({
    name: 'orgId',
    description: 'ID of the organization to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  findOne(@CurrentUser('id') userId: string, @Param('orgId') orgId: string) {
    return this.organizationsService.findOne(userId, orgId);
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update an existing organization' })
  @ApiParam({
    name: 'orgId',
    description: 'ID of the organization to retrieve',
  })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  update(
    @CurrentUser('id') userId: string,
    @Param('orgId') orgId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(
      userId,
      orgId,
      updateOrganizationDto,
    );
  }

  @Delete(':orgId')
  @Roles('OWNER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete an existing organization' })
  @ApiParam({
    name: 'orgId',
    description: 'ID of the organization to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not authorized to delete this organization.',
  })
  @ApiResponse({ status: 401, description: 'User not authenticated.' })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  remove(@CurrentUser('id') userId: string, @Param('orgId') orgId: string) {
    return this.organizationsService.remove(userId, orgId);
  }
}
