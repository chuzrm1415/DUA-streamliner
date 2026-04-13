import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Get()
  @Roles('MANAGER')
  @ApiOperation({ summary: 'List all users (Manager only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Update user role (Manager only)' })
  updateRole(@Param('id') id: string, @Body() body: { role: 'MANAGER' | 'CUSTOMS_AGENT' }) {
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(':id/deactivate')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Deactivate a user (Manager only)' })
  deactivate(@Param('id') id: string) {
    return this.usersService.setActive(id, false);
  }
}
