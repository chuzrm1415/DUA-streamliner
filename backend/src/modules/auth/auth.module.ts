import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AzureAdStrategy } from './azure-ad.strategy';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'azure-ad' }),
    UsersModule,
  ],
  providers: [AzureAdStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
