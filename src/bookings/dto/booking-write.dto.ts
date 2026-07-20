import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../../database/enums/booking-status.enum';
import { CustomTripDayInputDto } from '../../trips/dto/trip-write.dto';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  tripId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class BookFromTourDto {
  @ApiProperty()
  @IsUUID()
  tourId: string;

  @ApiPropertyOptional()
  @ValidateIf((o: BookFromTourDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+79001112233' })
  @ValidateIf((o: BookFromTourDto) => !o.email)
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  locationIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  extraServiceIds?: string[];
}

export class BookCustomTripDto {
  @ApiPropertyOptional()
  @ValidateIf((o: BookCustomTripDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+79001112233' })
  @ValidateIf((o: BookCustomTripDto) => !o.email)
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  locationIds?: string[];

  @ApiPropertyOptional({ type: [CustomTripDayInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomTripDayInputDto)
  days?: CustomTripDayInputDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  extraServiceIds?: string[];
}
