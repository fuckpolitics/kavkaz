import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { toMoneyString, toNumber } from '../common/utils/money.util';
import { estimateTripTotal } from '../common/utils/pricing.util';
import { ExtraService } from '../database/entities/extra-service.entity';
import { Location } from '../database/entities/location.entity';
import { TripStatus } from '../database/enums/trip-status.enum';
import { ToursService } from '../tours/tours.service';
import {
  CreateCustomTripDto,
  CreateTripDayDto,
  CreateTripDayLocationDto,
  CreateTripDto,
  CreateTripExtraServiceDto,
  CreateTripFromTourDto,
  UpdateTripDayDto,
  UpdateTripDayLocationDto,
  UpdateTripDto,
} from './dto/trip-write.dto';
import {
  TripDayDto,
  TripDayLocationDto,
  TripDto,
  TripExtraServiceDto,
  TripShortDto,
  toTripDayDto,
  toTripDayLocationDto,
  toTripDto,
  toTripExtraServiceDto,
  toTripShortDto,
} from './dto/trip.dto';
import { TripsRepository } from './trips.repository';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly toursService: ToursService,
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    @InjectRepository(ExtraService)
    private readonly extraServicesRepository: Repository<ExtraService>,
  ) {}

  async findAllForUser(
    userId: string,
    pagination: PaginationDto,
  ): Promise<TripShortDto[]> {
    const trips = await this.tripsRepository.findByUser(userId, pagination);
    return trips.map(toTripShortDto);
  }

  async findOneForUser(userId: string, id: string): Promise<TripDto> {
    const trip = await this.requireOwnedTrip(userId, id);
    return toTripDto(trip);
  }

  async createEmpty(userId: string, dto: CreateTripDto = {}): Promise<TripDto> {
    const trip = this.tripsRepository.createTrip({
      userId,
      sourceTourId: null,
      title: dto.title?.trim() || 'Мой маршрут',
      status: TripStatus.DRAFT,
      adults: dto.adults ?? 1,
      children: dto.children ?? 0,
      estimatedPrice: '0.00',
      notes: dto.notes ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    const savedTrip = await this.tripsRepository.saveTrip(trip);
    await this.tripsRepository.saveDay(
      this.tripsRepository.createDay({
        tripId: savedTrip.id,
        dayNumber: 1,
        title: 'День 1',
        description: 'Добавьте локации и описание дня',
      }),
    );
    return toTripDto(await this.requireOwnedTrip(userId, savedTrip.id));
  }

  async createFromTour(
    userId: string,
    tourId: string,
    options: CreateTripFromTourDto = {},
  ): Promise<TripDto> {
    const tour = await this.toursService.requireById(tourId);
    const selectedLocations = options.locationIds
      ? new Set(options.locationIds)
      : null;
    const selectedExtras =
      options.extraServiceIds !== undefined
        ? new Set(options.extraServiceIds)
        : null;

    const trip = this.tripsRepository.createTrip({
      userId,
      sourceTourId: tour.id,
      title: tour.title,
      status: TripStatus.DRAFT,
      adults: options.adults ?? 1,
      children: options.children ?? 0,
      estimatedPrice: tour.price,
      notes: null,
      startDate: options.startDate ? new Date(options.startDate) : null,
      endDate: options.endDate ? new Date(options.endDate) : null,
    });
    const savedTrip = await this.tripsRepository.saveTrip(trip);

    const days = (tour.days ?? [])
      .slice()
      .sort((a, b) => a.dayNumber - b.dayNumber);
    const addedLocationIds = new Set<string>();

    for (const tourDay of days) {
      const day = this.tripsRepository.createDay({
        tripId: savedTrip.id,
        dayNumber: tourDay.dayNumber,
        title: tourDay.title,
        description: tourDay.description,
      });
      const savedDay = await this.tripsRepository.saveDay(day);
      const locations = (tourDay.locations ?? [])
        .slice()
        .sort((a, b) => a.order - b.order);
      const parents: string[] = [];
      let order = 0;
      for (const tourLoc of locations) {
        parents.push(tourLoc.locationId);
        if (selectedLocations && !selectedLocations.has(tourLoc.locationId)) {
          continue;
        }
        await this.tripsRepository.saveDayLocation(
          this.tripsRepository.createDayLocation({
            tripDayId: savedDay.id,
            locationId: tourLoc.locationId,
            order: order++,
            visitTime: null,
          }),
        );
        addedLocationIds.add(tourLoc.locationId);
      }

      if (selectedLocations && parents.length > 0) {
        const children = await this.locationsRepository.find({
          where: { parentId: In(parents) },
        });
        for (const child of children) {
          if (!selectedLocations.has(child.id) || addedLocationIds.has(child.id)) {
            continue;
          }
          await this.tripsRepository.saveDayLocation(
            this.tripsRepository.createDayLocation({
              tripDayId: savedDay.id,
              locationId: child.id,
              order: order++,
              visitTime: null,
            }),
          );
          addedLocationIds.add(child.id);
        }
      }
    }

    for (const tourExtra of tour.extraServices ?? []) {
      if (
        selectedExtras &&
        !selectedExtras.has(tourExtra.extraServiceId)
      ) {
        continue;
      }
      await this.tripsRepository.saveExtra(
        this.tripsRepository.createExtra({
          tripId: savedTrip.id,
          tripDayId: null,
          extraServiceId: tourExtra.extraServiceId,
          quantity: 1,
          price: tourExtra.price,
        }),
      );
    }

    await this.recomputeEstimatedPrice(savedTrip.id);
    return toTripDto(await this.requireOwnedTrip(userId, savedTrip.id));
  }

  async createCustom(
    userId: string,
    dto: CreateCustomTripDto,
  ): Promise<TripDto> {
    const dayPlan =
      dto.days?.length
        ? dto.days
        : [
            {
              isRest: false,
              title: 'День 1',
              locationIds: dto.locationIds ?? [],
            },
          ];

    const flatLocationIds = dayPlan.flatMap((day) => day.locationIds ?? []);
    const uniqueLocationIds = [...new Set(flatLocationIds)];

    if (uniqueLocationIds.length === 0 && !dayPlan.some((d) => d.isRest)) {
      throw new BadRequestException('Select at least one location or rest day');
    }

    if (uniqueLocationIds.length > 0) {
      const locations = await this.locationsRepository.find({
        where: { id: In(uniqueLocationIds) },
      });
      if (locations.length !== uniqueLocationIds.length) {
        throw new NotFoundException('One or more locations not found');
      }
    }

    // Legacy flat payload: one location per day. Structured `days` can list
    // several points inside a single day.
    if (!dto.days?.length && dayPlan.length < uniqueLocationIds.length) {
      throw new BadRequestException(
        'Number of days cannot be less than number of locations',
      );
    }

    const trip = this.tripsRepository.createTrip({
      userId,
      sourceTourId: null,
      title: dto.title?.trim() || 'Мой маршрут',
      status: TripStatus.DRAFT,
      adults: dto.adults ?? 1,
      children: dto.children ?? 0,
      estimatedPrice: '0.00',
      notes: dto.notes ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    const savedTrip = await this.tripsRepository.saveTrip(trip);

    for (const [index, planDay] of dayPlan.entries()) {
      const isRest =
        Boolean(planDay.isRest) || !(planDay.locationIds?.length ?? 0);
      const day = await this.tripsRepository.saveDay(
        this.tripsRepository.createDay({
          tripId: savedTrip.id,
          dayNumber: index + 1,
          title:
            planDay.title?.trim() ||
            (isRest ? `День ${index + 1} · отдых` : `День ${index + 1}`),
          description: isRest ? 'День без экскурсий' : null,
          isRest,
        }),
      );

      if (!isRest) {
        for (const [locIndex, locationId] of (
          planDay.locationIds ?? []
        ).entries()) {
          await this.tripsRepository.saveDayLocation(
            this.tripsRepository.createDayLocation({
              tripDayId: day.id,
              locationId,
              order: locIndex,
              visitTime: null,
            }),
          );
        }
      }
    }

    if (dto.extraServiceIds?.length) {
      for (const extraServiceId of dto.extraServiceIds) {
        const extra = await this.extraServicesRepository.findOne({
          where: { id: extraServiceId },
        });
        if (!extra) {
          throw new NotFoundException('Extra service not found');
        }
        await this.tripsRepository.saveExtra(
          this.tripsRepository.createExtra({
            tripId: savedTrip.id,
            tripDayId: null,
            extraServiceId: extra.id,
            quantity: 1,
            price: extra.price,
          }),
        );
      }
    }

    await this.recomputeEstimatedPrice(savedTrip.id);
    return toTripDto(await this.requireOwnedTrip(userId, savedTrip.id));
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTripDto,
  ): Promise<TripDto> {
    const trip = await this.requireOwnedEditableTrip(userId, id);
    if (dto.title !== undefined) {
      trip.title = dto.title;
    }
    if (dto.adults !== undefined) {
      trip.adults = dto.adults;
    }
    if (dto.children !== undefined) {
      trip.children = dto.children;
    }
    if (dto.startDate !== undefined) {
      trip.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      trip.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.notes !== undefined) {
      trip.notes = dto.notes;
    }
    await this.tripsRepository.saveTrip(trip);
    await this.recomputeEstimatedPrice(id);
    return toTripDto(await this.requireOwnedTrip(userId, id));
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.requireOwnedEditableTrip(userId, id);
    await this.tripsRepository.softDeleteTrip(id);
  }

  async addDay(
    userId: string,
    tripId: string,
    dto: CreateTripDayDto,
  ): Promise<TripDayDto> {
    await this.requireOwnedEditableTrip(userId, tripId);
    const count = await this.tripsRepository.countDays(tripId);
    const day = this.tripsRepository.createDay({
      tripId,
      title: dto.title,
      description: dto.description ?? null,
      isRest: Boolean(dto.isRest),
      dayNumber: dto.dayNumber ?? count + 1,
    });
    const saved = await this.tripsRepository.saveDay(day);
    const full = await this.tripsRepository.findDayById(saved.id);
    return toTripDayDto(full!);
  }

  async updateDay(
    userId: string,
    dayId: string,
    dto: UpdateTripDayDto,
  ): Promise<TripDayDto> {
    const day = await this.requireOwnedDay(userId, dayId, true);
    if (dto.title !== undefined) {
      day.title = dto.title;
    }
    if (dto.description !== undefined) {
      day.description = dto.description;
    }
    if (dto.isRest !== undefined) {
      day.isRest = dto.isRest;
    }
    if (dto.dayNumber !== undefined) {
      day.dayNumber = dto.dayNumber;
    }
    await this.tripsRepository.saveDay(day);
    const full = await this.tripsRepository.findDayById(dayId);
    return toTripDayDto(full!);
  }

  async removeDay(userId: string, dayId: string): Promise<void> {
    const day = await this.requireOwnedDay(userId, dayId, true);
    await this.tripsRepository.deleteDay(day.id);
    await this.recomputeEstimatedPrice(day.tripId);
  }

  async addLocation(
    userId: string,
    dayId: string,
    dto: CreateTripDayLocationDto,
  ): Promise<TripDayLocationDto> {
    const day = await this.requireOwnedDay(userId, dayId, true);
    const location = await this.locationsRepository.findOne({
      where: { id: dto.locationId },
    });
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    const count = await this.tripsRepository.countDayLocations(dayId);
    const item = this.tripsRepository.createDayLocation({
      tripDayId: dayId,
      locationId: dto.locationId,
      order: dto.order ?? count,
      visitTime: dto.visitTime ?? null,
    });
    const saved = await this.tripsRepository.saveDayLocation(item);
    const full = await this.tripsRepository.findDayLocationById(saved.id);
    return toTripDayLocationDto(full!);
  }

  async updateLocation(
    userId: string,
    locationId: string,
    dto: UpdateTripDayLocationDto,
  ): Promise<TripDayLocationDto> {
    const item = await this.requireOwnedDayLocation(userId, locationId, true);
    if (dto.order !== undefined) {
      item.order = dto.order;
    }
    if (dto.visitTime !== undefined) {
      item.visitTime = dto.visitTime;
    }
    await this.tripsRepository.saveDayLocation(item);
    const full = await this.tripsRepository.findDayLocationById(locationId);
    return toTripDayLocationDto(full!);
  }

  async removeLocation(userId: string, locationId: string): Promise<void> {
    const item = await this.requireOwnedDayLocation(userId, locationId, true);
    await this.tripsRepository.deleteDayLocation(item.id);
  }

  async addExtraService(
    userId: string,
    tripId: string,
    dto: CreateTripExtraServiceDto,
  ): Promise<TripExtraServiceDto> {
    await this.requireOwnedEditableTrip(userId, tripId);
    const extra = await this.extraServicesRepository.findOne({
      where: { id: dto.extraServiceId },
    });
    if (!extra) {
      throw new NotFoundException('Extra service not found');
    }
    if (dto.tripDayId) {
      await this.requireOwnedDay(userId, dto.tripDayId, true);
    }
    const item = this.tripsRepository.createExtra({
      tripId,
      tripDayId: dto.tripDayId ?? null,
      extraServiceId: dto.extraServiceId,
      quantity: dto.quantity ?? 1,
      price: extra.price,
    });
    const saved = await this.tripsRepository.saveExtra(item);
    await this.recomputeEstimatedPrice(tripId);
    const full = await this.tripsRepository.findExtraById(saved.id);
    return toTripExtraServiceDto(full!);
  }

  async removeExtraService(userId: string, id: string): Promise<void> {
    const item = await this.tripsRepository.findExtraById(id);
    if (!item) {
      throw new NotFoundException('Trip extra service not found');
    }
    if (item.trip.userId !== userId) {
      throw new ForbiddenException('Trip does not belong to user');
    }
    if (
      item.trip.status === TripStatus.BOOKED ||
      item.trip.status === TripStatus.ARCHIVED
    ) {
      throw new ForbiddenException('Trip cannot be edited');
    }
    await this.tripsRepository.deleteExtra(id);
    await this.recomputeEstimatedPrice(item.tripId);
  }

  async requireOwnedTrip(userId: string, id: string) {
    const trip = await this.tripsRepository.findById(id);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.userId !== userId) {
      throw new ForbiddenException('Trip does not belong to user');
    }
    return trip;
  }

  async requireOwnedEditableTrip(userId: string, id: string) {
    const trip = await this.requireOwnedTrip(userId, id);
    if (
      trip.status === TripStatus.BOOKED ||
      trip.status === TripStatus.ARCHIVED
    ) {
      throw new ForbiddenException('Trip cannot be edited');
    }
    return trip;
  }

  private async requireOwnedDay(
    userId: string,
    dayId: string,
    editable: boolean,
  ) {
    const day = await this.tripsRepository.findDayById(dayId);
    if (!day) {
      throw new NotFoundException('Trip day not found');
    }
    if (day.trip.userId !== userId) {
      throw new ForbiddenException('Trip does not belong to user');
    }
    if (
      editable &&
      (day.trip.status === TripStatus.BOOKED ||
        day.trip.status === TripStatus.ARCHIVED)
    ) {
      throw new ForbiddenException('Trip cannot be edited');
    }
    return day;
  }

  private async requireOwnedDayLocation(
    userId: string,
    id: string,
    editable: boolean,
  ) {
    const item = await this.tripsRepository.findDayLocationById(id);
    if (!item) {
      throw new NotFoundException('Trip day location not found');
    }
    if (item.tripDay.trip.userId !== userId) {
      throw new ForbiddenException('Trip does not belong to user');
    }
    if (
      editable &&
      (item.tripDay.trip.status === TripStatus.BOOKED ||
        item.tripDay.trip.status === TripStatus.ARCHIVED)
    ) {
      throw new ForbiddenException('Trip cannot be edited');
    }
    return item;
  }

  private async recomputeEstimatedPrice(tripId: string): Promise<void> {
    const trip = await this.tripsRepository.findById(tripId);
    if (!trip) {
      return;
    }

    const locationIds = new Set<string>();
    for (const day of trip.days ?? []) {
      for (const item of day.locations ?? []) {
        const loc = item.location;
        if (!loc) continue;
        locationIds.add(loc.id);
        if (loc.parentId) locationIds.add(loc.parentId);
      }
    }

    const locationById = new Map<string, Location>();
    if (locationIds.size > 0) {
      const locs = await this.locationsRepository.find({
        where: { id: In([...locationIds]) },
      });
      for (const loc of locs) {
        locationById.set(loc.id, loc);
      }
    }

    let tourSeatPrice = trip.sourceTour?.price ?? null;
    if (trip.sourceTourId && tourSeatPrice == null) {
      const tour = await this.toursService.requireById(trip.sourceTourId);
      tourSeatPrice = tour.price;
    }

    const estimate = estimateTripTotal({
      adults: trip.adults,
      children: trip.children,
      useTourBase: Boolean(trip.sourceTourId),
      tourSeatPrice,
      days: trip.days ?? [],
      locationById,
      extras: (trip.extraServices ?? []).map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),
    });

    trip.estimatedPrice = toMoneyString(estimate.total);
    await this.tripsRepository.saveTrip(trip);
  }

  /** Used by bookings module */
  async markBooked(tripId: string): Promise<void> {
    const trip = await this.tripsRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    trip.status = TripStatus.BOOKED;
    await this.tripsRepository.saveTrip(trip);
  }

  async getEntityForBooking(userId: string, tripId: string) {
    return this.requireOwnedEditableTrip(userId, tripId);
  }
}
