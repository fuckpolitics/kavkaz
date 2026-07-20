import { BookingDayLocation } from './entities/booking-day-location.entity';
import { BookingDay } from './entities/booking-day.entity';
import { BookingExtraService } from './entities/booking-extra-service.entity';
import { Booking } from './entities/booking.entity';
import { Destination } from './entities/destination.entity';
import { ExtraService } from './entities/extra-service.entity';
import { Image } from './entities/image.entity';
import { Location } from './entities/location.entity';
import { OtpCode } from './entities/otp-code.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TourDayLocation } from './entities/tour-day-location.entity';
import { TourDay } from './entities/tour-day.entity';
import { TourExtraService } from './entities/tour-extra-service.entity';
import { Tour } from './entities/tour.entity';
import { TripDayLocation } from './entities/trip-day-location.entity';
import { TripDay } from './entities/trip-day.entity';
import { TripExtraService } from './entities/trip-extra-service.entity';
import { Trip } from './entities/trip.entity';
import { User } from './entities/user.entity';

export const entities = [
  Image,
  User,
  RefreshToken,
  OtpCode,
  Destination,
  Location,
  ExtraService,
  Tour,
  TourDay,
  TourDayLocation,
  TourExtraService,
  Trip,
  TripDay,
  TripDayLocation,
  TripExtraService,
  Booking,
  BookingDay,
  BookingDayLocation,
  BookingExtraService,
];
