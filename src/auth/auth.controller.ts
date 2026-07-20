import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  RequestOtpDto,
  RequestOtpResponseDto,
  VerifyOtpDto,
} from './dto/otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: RequestOtpResponseDto })
  requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: AuthResponseDto })
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: AuthTokensDto })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  async logout(
    @CurrentUser() user: User,
    @Body() dto: LogoutDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }

  @Get('me')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto })
  me(@CurrentUser() user: User): Promise<UserDto> {
    return this.authService.me(user.id);
  }
}
