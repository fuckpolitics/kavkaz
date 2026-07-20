import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RequestOtpDto {
  @ApiPropertyOptional()
  @ValidateIf((o: RequestOtpDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+79001112233' })
  @ValidateIf((o: RequestOtpDto) => !o.email)
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone?: string;
}

export class VerifyOtpDto {
  @ApiPropertyOptional()
  @ValidateIf((o: VerifyOtpDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: VerifyOtpDto) => !o.email)
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone?: string;

  @ApiProperty({ example: '0000' })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;
}

export class RequestOtpResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ enum: ['email', 'phone'] })
  channel: 'email' | 'phone';

  @ApiProperty({ description: 'Always 0000 in test mode' })
  debugCode: string;

  @ApiProperty()
  message: string;
}
