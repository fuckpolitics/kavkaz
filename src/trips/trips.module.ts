import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtraService } from '../database/entities/extra-service.entity';
import { Location } from '../database/entities/location.entity';
import { TripDayLocation } from '../database/entities/trip-day-location.entity';
import { TripDay } from '../database/entities/trip-day.entity';
import { TripExtraService } from '../database/entities/trip-extra-service.entity';
import { Trip } from '../database/entities/trip.entity';
import { ToursModule } from '../tours/tours.module';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      TripDay,
      TripDayLocation,
      TripExtraService,
      Location,
      ExtraService,
    ]),
    ToursModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository],
  exports: [TripsService, TripsRepository],
})
export class TripsModule {}
