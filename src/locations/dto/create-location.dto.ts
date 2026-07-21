import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty()
  @IsUUID()
  destinationId: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Parent location id for a sublocation; null for top-level',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  parentId?: string | null;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @ApiProperty()
  @Type(() => Number)
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Time spent at this location/sublocation, minutes',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  visitDurationMinutes?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'One-way travel time from base to location, minutes',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  travelFromBaseMinutes?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Day-trip seat price ₽ / место',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  imageIds?: string[];
}
