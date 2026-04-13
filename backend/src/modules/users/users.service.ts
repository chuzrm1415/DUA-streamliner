import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User, UserRole } from '@prisma/client';

interface UpsertFromAzureDto {
  azureId: string;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find an existing user by Azure ID or create one on first login.
   */
  async findOrCreateFromAzure(dto: UpsertFromAzureDto): Promise<User> {
    return this.prisma.user.upsert({
      where: { azureId: dto.azureId },
      update: { email: dto.email, name: dto.name },
      create: {
        azureId: dto.azureId,
        email: dto.email,
        name: dto.name,
        role: dto.role,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }
}
