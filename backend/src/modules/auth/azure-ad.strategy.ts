import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { BearerStrategy } from 'passport-azure-ad';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AzureAdStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${config.get('azureAd.tenantId')}/v2.0/.well-known/openid-configuration`,
      clientID: config.get<string>('azureAd.clientId'),
      audience: config.get<string>('azureAd.audience'),
      validateIssuer: true,
      passReqToCallback: false,
      loggingLevel: config.get('app.nodeEnv') === 'development' ? 'info' : 'error',
    });
  }

  async validate(payload: any) {
    const azureId = payload.oid ?? payload.sub;
    if (!azureId) throw new UnauthorizedException();

    // Upsert user on first login
    const user = await this.usersService.findOrCreateFromAzure({
      azureId,
      email: payload.preferred_username ?? payload.email,
      name: payload.name,
      role: this.mapRole(payload.roles ?? []),
    });

    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    return user;
  }

  private mapRole(roles: string[]): 'MANAGER' | 'CUSTOMS_AGENT' {
    if (roles.includes('Manager')) return 'MANAGER';
    return 'CUSTOMS_AGENT';
  }
}
