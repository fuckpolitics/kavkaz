import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  slug: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  coverImageId?: string;
}
