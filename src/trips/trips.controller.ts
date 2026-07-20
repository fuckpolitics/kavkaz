import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
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
} from './dto/trip.dto';
import { TripsService } from './trips.service';

@ApiTags('trips')
@Controller()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('trips')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripShortDto, isArray: true })
  findAll(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<TripShortDto[]> {
    return this.tripsService.findAllForUser(user.id, pagination);
  }

  @Post('trips')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTripDto,
  ): Promise<TripDto> {
    return this.tripsService.createEmpty(user.id, dto);
  }

  @Post('trips/from-tour/:tourId')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDto })
  createFromTour(
    @CurrentUser() user: User,
    @Param('tourId', ParseUUIDPipe) tourId: string,
    @Body() dto: CreateTripFromTourDto,
  ): Promise<TripDto> {
    return this.tripsService.createFromTour(user.id, tourId, dto);
  }

  @Post('trips/custom')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDto })
  createCustom(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomTripDto,
  ): Promise<TripDto> {
    return this.tripsService.createCustom(user.id, dto);
  }

  @Get('trips/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDto })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TripDto> {
    return this.tripsService.findOneForUser(user.id, id);
  }

  @Patch('trips/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
  ): Promise<TripDto> {
    return this.tripsService.update(user.id, id, dto);
  }

  @Delete('trips/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tripsService.remove(user.id, id);
  }

  @Post('trips/:tripId/days')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDayDto })
  addDay(
    @CurrentUser() user: User,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() dto: CreateTripDayDto,
  ): Promise<TripDayDto> {
    return this.tripsService.addDay(user.id, tripId, dto);
  }

  @Patch('trip-days/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDayDto })
  updateDay(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDayDto,
  ): Promise<TripDayDto> {
    return this.tripsService.updateDay(user.id, id, dto);
  }

  @Delete('trip-days/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  removeDay(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tripsService.removeDay(user.id, id);
  }

  @Post('trip-days/:dayId/locations')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDayLocationDto })
  addLocation(
    @CurrentUser() user: User,
    @Param('dayId', ParseUUIDPipe) dayId: string,
    @Body() dto: CreateTripDayLocationDto,
  ): Promise<TripDayLocationDto> {
    return this.tripsService.addLocation(user.id, dayId, dto);
  }

  @Patch('trip-day-locations/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripDayLocationDto })
  updateLocation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDayLocationDto,
  ): Promise<TripDayLocationDto> {
    return this.tripsService.updateLocation(user.id, id, dto);
  }

  @Delete('trip-day-locations/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  removeLocation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tripsService.removeLocation(user.id, id);
  }

  @Post('trips/:tripId/extra-services')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: TripExtraServiceDto })
  addExtraService(
    @CurrentUser() user: User,
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() dto: CreateTripExtraServiceDto,
  ): Promise<TripExtraServiceDto> {
    return this.tripsService.addExtraService(user.id, tripId, dto);
  }

  @Delete('trip-extra-services/:id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(204)
  removeExtraService(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tripsService.removeExtraService(user.id, id);
  }
}
