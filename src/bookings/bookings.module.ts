import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BookingDayLocation } from '../database/entities/booking-day-location.entity';
import { BookingDay } from '../database/entities/booking-day.entity';
import { BookingExtraService } from '../database/entities/booking-extra-service.entity';
import { Booking } from '../database/entities/booking.entity';
import { TripsModule } from '../trips/trips.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingDay,
      BookingDayLocation,
      BookingExtraService,
    ]),
    TripsModule,
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService, BookingsRepository],
})
export class BookingsModule {}
