import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DestinationsService } from '../destinations/destinations.service';
import { Image } from '../database/entities/image.entity';
import { Location } from '../database/entities/location.entity';
import { FilesService } from '../files/files.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationFilterDto } from './dto/location-filter.dto';
import { LocationShortDto, toLocationShortDto } from './dto/location-short.dto';
import { LocationDto, toLocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsRepository } from './locations.repository';

@Injectable()
export class LocationsService {
  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly destinationsService: DestinationsService,
    private readonly filesService: FilesService,
  ) {}

  async findAll(filter: LocationFilterDto): Promise<LocationShortDto[]> {
    const locations = await this.locationsRepository.findWithFilters(filter);
    return locations.map(toLocationShortDto);
  }

  async findOne(id: string): Promise<LocationDto> {
    const location = await this.requireById(id);
    return toLocationDto(location);
  }

  async create(dto: CreateLocationDto): Promise<LocationDto> {
    await this.destinationsService.requireById(dto.destinationId);
    const parentId = await this.resolveParentId(
      dto.parentId ?? null,
      dto.destinationId,
    );
    const images = await this.resolveImages(dto.imageIds);

    const location = this.locationsRepository.create({
      destinationId: dto.destinationId,
      parentId,
      name: dto.name,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address ?? null,
      visitDurationMinutes: dto.visitDurationMinutes ?? null,
      travelFromBaseMinutes: dto.travelFromBaseMinutes ?? null,
      images,
    });
    const saved = await this.locationsRepository.save(location);
    return toLocationDto(await this.requireById(saved.id));
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationDto> {
    const location = await this.requireById(id);

    if (dto.destinationId !== undefined) {
      await this.destinationsService.requireById(dto.destinationId);
      location.destinationId = dto.destinationId;
    }
    if (dto.parentId !== undefined) {
      location.parentId = await this.resolveParentId(
        dto.parentId,
        dto.destinationId ?? location.destinationId,
        id,
      );
    }
    if (dto.name !== undefined) {
      location.name = dto.name;
    }
    if (dto.description !== undefined) {
      location.description = dto.description;
    }
    if (dto.latitude !== undefined) {
      location.latitude = dto.latitude;
    }
    if (dto.longitude !== undefined) {
      location.longitude = dto.longitude;
    }
    if (dto.address !== undefined) {
      location.address = dto.address;
    }
    if (dto.visitDurationMinutes !== undefined) {
      location.visitDurationMinutes = dto.visitDurationMinutes;
    }
    if (dto.travelFromBaseMinutes !== undefined) {
      location.travelFromBaseMinutes = dto.travelFromBaseMinutes;
    }
    if (dto.imageIds !== undefined) {
      location.images = await this.resolveImages(dto.imageIds);
    }

    await this.locationsRepository.save(location);
    return toLocationDto(await this.requireById(id));
  }

  async remove(id: string): Promise<void> {
    await this.requireById(id);
    await this.locationsRepository.softDelete(id);
  }

  async requireById(id: string): Promise<Location> {
    const location = await this.locationsRepository.findById(id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  private async resolveParentId(
    parentId: string | null,
    destinationId: string,
    selfId?: string,
  ): Promise<string | null> {
    if (!parentId) {
      return null;
    }
    if (selfId && parentId === selfId) {
      throw new BadRequestException('Location cannot be its own parent');
    }
    const parent = await this.requireById(parentId);
    if (parent.parentId) {
      throw new BadRequestException(
        'Only top-level locations can have sublocations',
      );
    }
    if (parent.destinationId !== destinationId) {
      throw new BadRequestException(
        'Parent location must belong to the same destination',
      );
    }
    if (selfId) {
      const childCount =
        await this.locationsRepository.countByParentId(selfId);
      if (childCount > 0) {
        throw new BadRequestException(
          'Cannot nest a location that already has sublocations',
        );
      }
    }
    return parentId;
  }

  private async resolveImages(
    imageIds: string[] | undefined,
  ): Promise<Image[]> {
    if (!imageIds || imageIds.length === 0) {
      return [];
    }
    const images = await this.filesService.findByIds(imageIds);
    if (images.length !== new Set(imageIds).size) {
      throw new NotFoundException('One or more images not found');
    }
    return images;
  }
}
