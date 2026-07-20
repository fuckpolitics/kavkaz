import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { OtpCode } from '../database/entities/otp-code.entity';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { toUserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';
import {
  RequestOtpDto,
  RequestOtpResponseDto,
  VerifyOtpDto,
} from './dto/otp.dto';
import { JwtPayload } from './jwt.strategy';
import { RefreshTokensRepository } from './refresh-tokens.repository';

const TEST_OTP = '0000';
const OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    const { contact, channel } = this.resolveContact(dto);

    await this.otpRepository.delete({ contact });
    await this.otpRepository.save(
      this.otpRepository.create({
        contact,
        channel,
        code: TEST_OTP,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        consumedAt: null,
      }),
    );

    // In production: send SMS/email here. Test mode always uses 0000.
    return {
      ok: true,
      channel,
      debugCode: TEST_OTP,
      message:
        channel === 'email'
          ? `Код отправлен на ${contact} (тест: ${TEST_OTP})`
          : `Код отправлен в SMS на ${contact} (тест: ${TEST_OTP})`,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { contact, channel } = this.resolveContact(dto);
    if (dto.code !== TEST_OTP) {
      const stored = await this.otpRepository.findOne({
        where: { contact },
        order: { createdAt: 'DESC' },
      });
      if (
        !stored ||
        stored.consumedAt ||
        stored.expiresAt.getTime() < Date.now() ||
        stored.code !== dto.code
      ) {
        throw new UnauthorizedException('Неверный или просроченный код');
      }
      stored.consumedAt = new Date();
      await this.otpRepository.save(stored);
    } else {
      const stored = await this.otpRepository.findOne({
        where: { contact },
        order: { createdAt: 'DESC' },
      });
      if (stored && !stored.consumedAt) {
        stored.consumedAt = new Date();
        await this.otpRepository.save(stored);
      }
    }

    let user =
      channel === 'email'
        ? await this.usersService.findByEmail(contact)
        : await this.usersService.findByPhone(contact);

    if (!user) {
      const created = this.usersService.create({
        email: channel === 'email' ? contact : null,
        phone: channel === 'phone' ? contact : null,
        passwordHash: null,
        firstName: dto.firstName?.trim() || 'Гость',
        lastName: null,
        role: UserRole.USER,
        isActive: true,
      });
      const saved = await this.usersService.save(created);
      user = await this.usersService.requireById(saved.id);
    } else if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: toUserDto(user) };
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokensRepository.findByHash(tokenHash);
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      if (stored) {
        await this.refreshTokensRepository.deleteByHash(tokenHash);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.refreshTokensRepository.deleteByHash(tokenHash);
    if (!stored.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    return this.issueTokens(stored.user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokensRepository.deleteByUserAndHash(userId, tokenHash);
  }

  async me(userId: string) {
    const user = await this.usersService.requireById(userId);
    return toUserDto(user);
  }

  /** Used by booking flows that already verified OTP in the same request */
  async ensureUserFromContact(dto: {
    email?: string;
    phone?: string;
    firstName?: string;
  }): Promise<User> {
    const { contact, channel } = this.resolveContact(dto);
    let user =
      channel === 'email'
        ? await this.usersService.findByEmail(contact)
        : await this.usersService.findByPhone(contact);
    if (!user) {
      const created = this.usersService.create({
        email: channel === 'email' ? contact : null,
        phone: channel === 'phone' ? contact : null,
        passwordHash: null,
        firstName: dto.firstName?.trim() || 'Гость',
        lastName: null,
        role: UserRole.USER,
        isActive: true,
      });
      const saved = await this.usersService.save(created);
      user = await this.usersService.requireById(saved.id);
    }
    return user;
  }

  async issueTokensForUser(user: User): Promise<AuthTokensDto> {
    return this.issueTokens(user);
  }

  private resolveContact(dto: { email?: string; phone?: string }): {
    contact: string;
    channel: 'email' | 'phone';
  } {
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim().replace(/\s+/g, '');
    if (email) {
      return { contact: email, channel: 'email' };
    }
    if (phone) {
      const normalized = phone.startsWith('+') ? phone : `+${phone}`;
      return { contact: normalized, channel: 'phone' };
    }
    throw new BadRequestException('Укажите email или телефон');
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email ?? user.phone ?? '',
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TTL',
        '15m',
      ) as `${number}m`,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
    const expiresAt = this.parseTtlDate(refreshTtl);

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      }),
    );

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtlDate(ttl: string): Date {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + amount * multipliers[unit]);
  }
}
