import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Tour } from '../database/entities/tour.entity';
import { TourFilterDto } from './dto/tour-filter.dto';

@Injectable()
export class ToursRepository {
  constructor(
    @InjectRepository(Tour)
    private readonly repo: Repository<Tour>,
  ) {}

  create(data: Partial<Tour>): Tour {
    return this.repo.create(data);
  }

  save(tour: Tour): Promise<Tour> {
    return this.repo.save(tour);
  }

  findById(id: string): Promise<Tour | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        destination: { coverImage: true },
        coverImage: true,
        days: { locations: { location: { images: true } } },
        extraServices: { extraService: { location: true } },
      },
    });
  }

  findWithFilters(filter: TourFilterDto): Promise<Tour[]> {
    const {
      page = 1,
      limit = 20,
      order = 'DESC',
      destinationId,
      search,
      minPrice,
      maxPrice,
      durationDays,
    } = filter;

    const where: FindOptionsWhere<Tour> = {};
    if (destinationId) {
      where.destinationId = destinationId;
    }
    if (search) {
      where.title = ILike(`%${search}%`);
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice.toFixed(2), maxPrice.toFixed(2));
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice.toFixed(2));
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice.toFixed(2));
    }
    if (durationDays !== undefined) {
      where.durationDays = durationDays;
    }

    return this.repo.find({
      where,
      relations: {
        coverImage: true,
        destination: { coverImage: true },
      },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
