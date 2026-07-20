import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TripDayLocation } from '../database/entities/trip-day-location.entity';
import { TripDay } from '../database/entities/trip-day.entity';
import { TripExtraService } from '../database/entities/trip-extra-service.entity';
import { Trip } from '../database/entities/trip.entity';

@Injectable()
export class TripsRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(TripDay)
    private readonly dayRepo: Repository<TripDay>,
    @InjectRepository(TripDayLocation)
    private readonly dayLocationRepo: Repository<TripDayLocation>,
    @InjectRepository(TripExtraService)
    private readonly extraRepo: Repository<TripExtraService>,
  ) {}

  createTrip(data: Partial<Trip>): Trip {
    return this.tripRepo.create(data);
  }

  saveTrip(trip: Trip): Promise<Trip> {
    return this.tripRepo.save(trip);
  }

  findById(id: string): Promise<Trip | null> {
    return this.tripRepo.findOne({
      where: { id },
      relations: {
        days: { locations: { location: { images: true } } },
        extraServices: { extraService: { location: true } },
        sourceTour: true,
      },
    });
  }

  findByUser(userId: string, pagination: PaginationDto): Promise<Trip[]> {
    const { page = 1, limit = 20, order = 'DESC' } = pagination;
    return this.tripRepo.find({
      where: { userId },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  softDeleteTrip(id: string): Promise<void> {
    return this.tripRepo.softDelete(id).then(() => undefined);
  }

  createDay(data: Partial<TripDay>): TripDay {
    return this.dayRepo.create(data);
  }

  saveDay(day: TripDay): Promise<TripDay> {
    return this.dayRepo.save(day);
  }

  findDayById(id: string): Promise<TripDay | null> {
    return this.dayRepo.findOne({
      where: { id },
      relations: {
        trip: true,
        locations: { location: { images: true } },
      },
    });
  }

  async deleteDay(id: string): Promise<void> {
    await this.dayRepo.delete(id);
  }

  countDays(tripId: string): Promise<number> {
    return this.dayRepo.count({ where: { tripId } });
  }

  createDayLocation(data: Partial<TripDayLocation>): TripDayLocation {
    return this.dayLocationRepo.create(data);
  }

  saveDayLocation(item: TripDayLocation): Promise<TripDayLocation> {
    return this.dayLocationRepo.save(item);
  }

  findDayLocationById(id: string): Promise<TripDayLocation | null> {
    return this.dayLocationRepo.findOne({
      where: { id },
      relations: {
        tripDay: { trip: true },
        location: { images: true },
      },
    });
  }

  async deleteDayLocation(id: string): Promise<void> {
    await this.dayLocationRepo.delete(id);
  }

  countDayLocations(tripDayId: string): Promise<number> {
    return this.dayLocationRepo.count({ where: { tripDayId } });
  }

  createExtra(data: Partial<TripExtraService>): TripExtraService {
    return this.extraRepo.create(data);
  }

  saveExtra(item: TripExtraService): Promise<TripExtraService> {
    return this.extraRepo.save(item);
  }

  findExtraById(id: string): Promise<TripExtraService | null> {
    return this.extraRepo.findOne({
      where: { id },
      relations: { trip: true, extraService: true },
    });
  }

  async deleteExtra(id: string): Promise<void> {
    await this.extraRepo.delete(id);
  }
}
