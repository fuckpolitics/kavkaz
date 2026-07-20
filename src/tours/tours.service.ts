import { Injectable, NotFoundException } from '@nestjs/common';
import { toMoneyString } from '../common/utils/money.util';
import { Tour } from '../database/entities/tour.entity';
import { DestinationsService } from '../destinations/destinations.service';
import { FilesService } from '../files/files.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourFilterDto } from './dto/tour-filter.dto';
import { TourShortDto, toTourShortDto } from './dto/tour-short.dto';
import { TourDto, toTourDto } from './dto/tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ToursRepository } from './tours.repository';

@Injectable()
export class ToursService {
  constructor(
    private readonly toursRepository: ToursRepository,
    private readonly destinationsService: DestinationsService,
    private readonly filesService: FilesService,
  ) {}

  async findAll(filter: TourFilterDto): Promise<TourShortDto[]> {
    const tours = await this.toursRepository.findWithFilters(filter);
    return tours.map(toTourShortDto);
  }

  async findOne(id: string): Promise<TourDto> {
    const tour = await this.requireById(id);
    return toTourDto(tour);
  }

  async create(dto: CreateTourDto): Promise<TourDto> {
    await this.destinationsService.requireById(dto.destinationId);
    if (dto.coverImageId) {
      await this.filesService.requireById(dto.coverImageId);
    }

    const tour = this.toursRepository.create({
      destinationId: dto.destinationId,
      title: dto.title,
      description: dto.description,
      price: toMoneyString(dto.price),
      durationDays: dto.durationDays,
      coverImageId: dto.coverImageId ?? null,
    });
    const saved = await this.toursRepository.save(tour);
    return toTourDto(await this.requireById(saved.id));
  }

  async update(id: string, dto: UpdateTourDto): Promise<TourDto> {
    const tour = await this.requireById(id);

    if (dto.destinationId !== undefined) {
      await this.destinationsService.requireById(dto.destinationId);
      tour.destinationId = dto.destinationId;
    }
    if (dto.title !== undefined) {
      tour.title = dto.title;
    }
    if (dto.description !== undefined) {
      tour.description = dto.description;
    }
    if (dto.price !== undefined) {
      tour.price = toMoneyString(dto.price);
    }
    if (dto.durationDays !== undefined) {
      tour.durationDays = dto.durationDays;
    }
    if (dto.coverImageId !== undefined) {
      await this.filesService.requireById(dto.coverImageId);
      tour.coverImageId = dto.coverImageId;
    }

    await this.toursRepository.save(tour);
    return toTourDto(await this.requireById(id));
  }

  async remove(id: string): Promise<void> {
    await this.requireById(id);
    await this.toursRepository.softDelete(id);
  }

  async requireById(id: string): Promise<Tour> {
    const tour = await this.toursRepository.findById(id);
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
    return tour;
  }
}
