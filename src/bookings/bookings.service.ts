import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { toMoneyString, toNumber } from '../common/utils/money.util';
import { BookingDayLocation } from '../database/entities/booking-day-location.entity';
import { BookingDay } from '../database/entities/booking-day.entity';
import { BookingExtraService } from '../database/entities/booking-extra-service.entity';
import { Booking } from '../database/entities/booking.entity';
import { BookingStatus } from '../database/enums/booking-status.enum';
import { UserRole } from '../database/enums/user-role.enum';
import { TripsService } from '../trips/trips.service';
import { BookWithAuthResponseDto } from './dto/book-with-auth.dto';
import {
  BookCustomTripDto,
  BookFromTourDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
} from './dto/booking-write.dto';
import {
  AdminBookingDto,
  BookingDto,
  BookingShortDto,
  toAdminBookingDto,
  toBookingDto,
  toBookingShortDto,
} from './dto/booking.dto';
import { BookingsRepository } from './bookings.repository';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly tripsService: TripsService,
    private readonly authService: AuthService,
  ) {}

  async findAllForUser(
    userId: string,
    pagination: PaginationDto,
  ): Promise<BookingShortDto[]> {
    const bookings = await this.bookingsRepository.findByUser(
      userId,
      pagination,
    );
    return bookings.map(toBookingShortDto);
  }

  async findAllAdmin(pagination: PaginationDto): Promise<AdminBookingDto[]> {
    const bookings = await this.bookingsRepository.findAll(pagination);
    return bookings.map(toAdminBookingDto);
  }

  async findOne(
    userId: string,
    role: UserRole,
    id: string,
  ): Promise<BookingDto> {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.userId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Booking does not belong to user');
    }
    return toBookingDto(booking);
  }

  async bookFromTour(dto: BookFromTourDto): Promise<BookWithAuthResponseDto> {
    const auth = await this.authService.verifyOtp({
      email: dto.email,
      phone: dto.phone,
      code: dto.code,
      firstName: dto.firstName,
    });
    const trip = await this.tripsService.createFromTour(auth.user.id, dto.tourId, {
      adults: dto.adults,
      children: dto.children,
      startDate: dto.startDate,
      endDate: dto.endDate,
      locationIds: dto.locationIds,
      extraServiceIds: dto.extraServiceIds,
    });
    const booking = await this.create(auth.user.id, {
      tripId: trip.id,
      comment: dto.comment,
    });
    return {
      booking,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
    };
  }

  async bookCustomTrip(
    dto: BookCustomTripDto,
  ): Promise<BookWithAuthResponseDto> {
    const auth = await this.authService.verifyOtp({
      email: dto.email,
      phone: dto.phone,
      code: dto.code,
      firstName: dto.firstName,
    });
    const trip = await this.tripsService.createCustom(auth.user.id, {
      title: dto.title,
      adults: dto.adults,
      children: dto.children,
      startDate: dto.startDate,
      endDate: dto.endDate,
      notes: dto.notes,
      locationIds: dto.locationIds,
      days: dto.days,
      extraServiceIds: dto.extraServiceIds,
    });
    const booking = await this.create(auth.user.id, {
      tripId: trip.id,
      comment: dto.comment,
    });
    return {
      booking,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
    };
  }

  async create(userId: string, dto: CreateBookingDto): Promise<BookingDto> {
    const trip = await this.tripsService.getEntityForBooking(
      userId,
      dto.tripId,
    );

    const saved = await this.bookingsRepository.manager.transaction(
      async (manager) => {
        const booking = manager.create(Booking, {
          userId,
          tripId: trip.id,
          tourId: trip.sourceTourId,
          adults: trip.adults,
          children: trip.children,
          totalPrice: toMoneyString(toNumber(trip.estimatedPrice)),
          status: BookingStatus.PENDING,
          comment: dto.comment ?? null,
          tripTitle: trip.title,
        });
        const savedBooking = await manager.save(booking);

        for (const day of (trip.days ?? [])
          .slice()
          .sort((a, b) => a.dayNumber - b.dayNumber)) {
          const bookingDay = manager.create(BookingDay, {
            bookingId: savedBooking.id,
            dayNumber: day.dayNumber,
            title: day.title,
            isRest: Boolean(day.isRest),
          });
          const savedDay = await manager.save(bookingDay);

          for (const loc of (day.locations ?? [])
            .slice()
            .sort((a, b) => a.order - b.order)) {
            await manager.save(
              manager.create(BookingDayLocation, {
                bookingDayId: savedDay.id,
                locationName: loc.location?.name ?? 'Unknown',
                order: loc.order,
              }),
            );
          }
        }

        for (const extra of trip.extraServices ?? []) {
          await manager.save(
            manager.create(BookingExtraService, {
              bookingId: savedBooking.id,
              bookingDayId: null,
              serviceName: extra.extraService?.name ?? 'Extra service',
              quantity: extra.quantity,
              price: extra.price,
            }),
          );
        }

        return savedBooking;
      },
    );

    await this.tripsService.markBooked(trip.id);
    const full = await this.bookingsRepository.findById(saved.id);
    return toBookingDto(full!);
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (!Object.values(BookingStatus).includes(dto.status)) {
      throw new BadRequestException('Invalid booking status');
    }
    await this.bookingsRepository.updateStatus(id, dto.status);
    const full = await this.bookingsRepository.findById(id);
    return toBookingDto(full!);
  }
}
