import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Destination } from '../database/entities/destination.entity';
import { Tour } from '../database/entities/tour.entity';

export type DestinationTourStats = {
  destinationId: string;
  tourCount: number;
  minTourPrice: number | null;
};

@Injectable()
export class DestinationsRepository {
  constructor(
    @InjectRepository(Destination)
    private readonly repo: Repository<Destination>,
  ) {}

  create(data: Partial<Destination>): Destination {
    return this.repo.create(data);
  }

  save(destination: Destination): Promise<Destination> {
    return this.repo.save(destination);
  }

  findById(id: string): Promise<Destination | null> {
    return this.repo.findOne({
      where: { id },
      relations: { coverImage: true },
    });
  }

  findBySlug(slug: string): Promise<Destination | null> {
    return this.repo.findOne({ where: { slug } });
  }

  findAll(pagination: PaginationDto): Promise<Destination[]> {
    const { page = 1, limit = 20, order = 'DESC' } = pagination;
    return this.repo.find({
      relations: { coverImage: true },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getTourStats(
    destinationIds: string[],
  ): Promise<Map<string, DestinationTourStats>> {
    const map = new Map<string, DestinationTourStats>();
    if (destinationIds.length === 0) {
      return map;
    }

    const rows = await this.repo.manager
      .getRepository(Tour)
      .createQueryBuilder('tour')
      .select('tour.destination_id', 'destinationId')
      .addSelect('COUNT(*)', 'tourCount')
      .addSelect('MIN(tour.price)', 'minTourPrice')
      .where('tour.destination_id IN (:...ids)', { ids: destinationIds })
      .andWhere('tour.deleted_at IS NULL')
      .andWhere('tour.is_active = true')
      .groupBy('tour.destination_id')
      .getRawMany<{
        destinationId: string;
        tourCount: string;
        minTourPrice: string | null;
      }>();

    for (const row of rows) {
      map.set(row.destinationId, {
        destinationId: row.destinationId,
        tourCount: Number(row.tourCount),
        minTourPrice:
          row.minTourPrice === null || row.minTourPrice === undefined
            ? null
            : Number(row.minTourPrice),
      });
    }

    return map;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
