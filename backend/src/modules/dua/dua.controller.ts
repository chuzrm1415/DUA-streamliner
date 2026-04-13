import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DuaService } from './dua.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('dua')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions/:sessionId/dua')
export class DuaController {
  constructor(private readonly duaService: DuaService) {}

  @Get('preliminary')
  @Roles('CUSTOMS_AGENT')
  @ApiOperation({ summary: 'Get preliminary DUA data for review' })
  getPreliminary(@Param('sessionId') sessionId: string, @CurrentUser() user: User) {
    return this.duaService.getPreliminaryDua(sessionId, user.id);
  }

  @Patch('fields')
  @Roles('CUSTOMS_AGENT')
  @ApiOperation({ summary: 'Update DUA fields after review' })
  updateFields(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: User,
    @Body() body: { fields: Record<string, string> },
  ) {
    return this.duaService.updateFields(sessionId, user.id, body.fields);
  }

  @Post('final')
  @Roles('CUSTOMS_AGENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate final DUA document' })
  generateFinal(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: User,
    @Body() body: { fields: Record<string, string> },
  ) {
    return this.duaService.generateFinal(sessionId, user.id, body.fields ?? {});
  }

  @Get('download')
  @Roles('CUSTOMS_AGENT')
  @ApiOperation({ summary: 'Download the final DUA .docx file' })
  async download(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.duaService.downloadDua(sessionId, user.id);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
