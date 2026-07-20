import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTourDto {
  @ApiProperty()
  @IsUUID()
  destinationId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  coverImageId?: string;
}
