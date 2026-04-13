import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { memoryStorage } from 'multer';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_REGEX =
  /^(application\/pdf|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet)|image\/(png|jpeg|tiff))$/;

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles('CUSTOMS_AGENT')
  @ApiOperation({ summary: 'Upload documents and start a new processing session' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 50, { storage: memoryStorage() }))
  async createSession(
    @CurrentUser() user: User,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_REGEX }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.sessionsService.createSession(user.id, files);
  }

  @Get()
  @ApiOperation({ summary: 'List sessions for the current user' })
  listSessions(@CurrentUser() user: User) {
    return this.sessionsService.listSessions(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session status and details' })
  getSession(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sessionsService.getSession(id, user.id);
  }
}
