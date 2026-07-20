import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Location } from '../database/entities/location.entity';
import { LocationFilterDto } from './dto/location-filter.dto';

@Injectable()
export class LocationsRepository {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  create(data: Partial<Location>): Location {
    return this.repo.create(data);
  }

  save(location: Location): Promise<Location> {
    return this.repo.save(location);
  }

  findById(id: string): Promise<Location | null> {
    return this.repo.findOne({
      where: { id },
      relations: { images: true, destination: true },
    });
  }

  findWithFilters(filter: LocationFilterDto): Promise<Location[]> {
    const {
      page = 1,
      limit = 20,
      order = 'DESC',
      destinationId,
      search,
    } = filter;

    return this.repo.find({
      where: {
        ...(destinationId ? { destinationId } : {}),
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      relations: { images: true },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByParentId(parentId: string): Promise<number> {
    return this.repo.count({ where: { parentId } });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
