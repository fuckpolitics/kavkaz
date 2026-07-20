import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BookingDayLocation } from '../database/entities/booking-day-location.entity';
import { BookingDay } from '../database/entities/booking-day.entity';
import { BookingExtraService } from '../database/entities/booking-extra-service.entity';
import { Booking } from '../database/entities/booking.entity';
import { BookingStatus } from '../database/enums/booking-status.enum';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingDay)
    private readonly dayRepo: Repository<BookingDay>,
    @InjectRepository(BookingDayLocation)
    private readonly dayLocationRepo: Repository<BookingDayLocation>,
    @InjectRepository(BookingExtraService)
    private readonly extraRepo: Repository<BookingExtraService>,
  ) {}

  get manager() {
    return this.bookingRepo.manager;
  }

  create(data: Partial<Booking>): Booking {
    return this.bookingRepo.create(data);
  }

  save(booking: Booking): Promise<Booking> {
    return this.bookingRepo.save(booking);
  }

  findById(id: string): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: {
        days: { locations: true },
        extraServices: true,
      },
    });
  }

  findByUser(userId: string, pagination: PaginationDto): Promise<Booking[]> {
    const { page = 1, limit = 20, order = 'DESC' } = pagination;
    return this.bookingRepo.find({
      where: { userId },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findAll(pagination: PaginationDto): Promise<Booking[]> {
    const { page = 1, limit = 20, order = 'DESC' } = pagination;
    return this.bookingRepo.find({
      relations: {
        user: true,
        trip: true,
        days: { locations: true },
        extraServices: true,
      },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  createDay(data: Partial<BookingDay>): BookingDay {
    return this.dayRepo.create(data);
  }

  saveDay(day: BookingDay): Promise<BookingDay> {
    return this.dayRepo.save(day);
  }

  createDayLocation(data: Partial<BookingDayLocation>): BookingDayLocation {
    return this.dayLocationRepo.create(data);
  }

  saveDayLocation(item: BookingDayLocation): Promise<BookingDayLocation> {
    return this.dayLocationRepo.save(item);
  }

  createExtra(data: Partial<BookingExtraService>): BookingExtraService {
    return this.extraRepo.create(data);
  }

  saveExtra(item: BookingExtraService): Promise<BookingExtraService> {
    return this.extraRepo.save(item);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await this.bookingRepo.update(id, { status });
  }
}
