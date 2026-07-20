import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Destination } from '../database/entities/destination.entity';
import { FilesService } from '../files/files.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import {
  DestinationShortDto,
  toDestinationShortDto,
} from './dto/destination-short.dto';
import { DestinationDto, toDestinationDto } from './dto/destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationsRepository } from './destinations.repository';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly destinationsRepository: DestinationsRepository,
    private readonly filesService: FilesService,
  ) {}

  async findAll(pagination: PaginationDto): Promise<DestinationShortDto[]> {
    const destinations = await this.destinationsRepository.findAll(pagination);
    const stats = await this.destinationsRepository.getTourStats(
      destinations.map((d) => d.id),
    );
    return destinations.map((destination) => {
      const s = stats.get(destination.id);
      return toDestinationShortDto(destination, {
        minTourPrice: s?.minTourPrice ?? null,
        tourCount: s?.tourCount ?? 0,
      });
    });
  }

  async findOne(id: string): Promise<DestinationDto> {
    const destination = await this.requireById(id);
    return toDestinationDto(destination);
  }

  async create(dto: CreateDestinationDto): Promise<DestinationDto> {
    await this.ensureSlugAvailable(dto.slug);
    if (dto.coverImageId) {
      await this.filesService.requireById(dto.coverImageId);
    }

    const destination = this.destinationsRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      coverImageId: dto.coverImageId ?? null,
    });
    const saved = await this.destinationsRepository.save(destination);
    return toDestinationDto(await this.requireById(saved.id));
  }

  async update(id: string, dto: UpdateDestinationDto): Promise<DestinationDto> {
    const destination = await this.requireById(id);

    if (dto.slug !== undefined && dto.slug !== destination.slug) {
      await this.ensureSlugAvailable(dto.slug);
      destination.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      destination.name = dto.name;
    }
    if (dto.description !== undefined) {
      destination.description = dto.description;
    }
    if (dto.coverImageId !== undefined) {
      await this.filesService.requireById(dto.coverImageId);
      destination.coverImageId = dto.coverImageId;
    }

    await this.destinationsRepository.save(destination);
    return toDestinationDto(await this.requireById(id));
  }

  async remove(id: string): Promise<void> {
    await this.requireById(id);
    await this.destinationsRepository.softDelete(id);
  }

  async requireById(id: string): Promise<Destination> {
    const destination = await this.destinationsRepository.findById(id);
    if (!destination) {
      throw new NotFoundException('Destination not found');
    }
    return destination;
  }

  private async ensureSlugAvailable(slug: string): Promise<void> {
    const existing = await this.destinationsRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Slug already in use');
    }
  }
}
