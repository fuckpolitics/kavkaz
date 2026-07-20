import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Image } from '../../database/entities/image.entity';

export class ImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiPropertyOptional({ nullable: true })
  width: number | null;

  @ApiPropertyOptional({ nullable: true })
  height: number | null;

  @ApiProperty()
  url: string;

  @ApiProperty()
  createdAt: Date;
}

export function toImageDto(image: Image | null | undefined): ImageDto | null {
  if (!image) {
    return null;
  }
  return {
    id: image.id,
    filename: image.filename,
    originalName: image.originalName,
    mimeType: image.mimeType,
    size: image.size,
    width: image.width,
    height: image.height,
    url: image.url,
    createdAt: image.createdAt,
  };
}
