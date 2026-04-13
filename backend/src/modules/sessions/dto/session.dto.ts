import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '@prisma/client';

export class CreateSessionResponseDto {
  @ApiProperty() sessionId: string;
  @ApiProperty() status: SessionStatus;
  @ApiProperty() progress: number;
  @ApiProperty({ type: [Object] }) documents: object[];
}

export class SessionStatusDto {
  @ApiProperty() sessionId: string;
  @ApiProperty({ enum: SessionStatus }) status: SessionStatus;
  @ApiProperty() progress: number;
  @ApiPropertyOptional() error?: string;
  @ApiProperty({ type: [Object] }) documents: object[];
  @ApiPropertyOptional({ type: Object }) dua?: object;
}
