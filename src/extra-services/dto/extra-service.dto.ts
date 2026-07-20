import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toNumber } from '../../common/utils/money.util';
import { ExtraService } from '../../database/entities/extra-service.entity';

export class ExtraServiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional({ nullable: true })
  locationId: string | null;

  @ApiPropertyOptional({ nullable: true })
  locationName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toExtraServiceDto(extraService: ExtraService): ExtraServiceDto {
  return {
    id: extraService.id,
    name: extraService.name,
    description: extraService.description,
    price: toNumber(extraService.price),
    locationId: extraService.locationId ?? null,
    locationName: extraService.location?.name ?? null,
    createdAt: extraService.createdAt,
    updatedAt: extraService.updatedAt,
  };
}
