import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from '../database/entities/otp-code.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_TTL', '15m') as `${number}m`,
        },
      }),
    }),
    TypeOrmModule.forFeature([RefreshToken, OtpCode]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokensRepository],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
