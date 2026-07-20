import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { BookWithAuthResponseDto } from './dto/book-with-auth.dto';
import {
  BookCustomTripDto,
  BookFromTourDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
} from './dto/booking-write.dto';
import { BookingDto, BookingShortDto } from './dto/booking.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: BookingShortDto, isArray: true })
  findAll(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<BookingShortDto[]> {
    return this.bookingsService.findAllForUser(user.id, pagination);
  }

  @Post('from-tour')
  @Public()
  @ApiOkResponse({ type: BookWithAuthResponseDto })
  bookFromTour(@Body() dto: BookFromTourDto): Promise<BookWithAuthResponseDto> {
    return this.bookingsService.bookFromTour(dto);
  }

  @Post('custom')
  @Public()
  @ApiOkResponse({ type: BookWithAuthResponseDto })
  bookCustom(
    @Body() dto: BookCustomTripDto,
  ): Promise<BookWithAuthResponseDto> {
    return this.bookingsService.bookCustomTrip(dto);
  }

  @Get(':id')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: BookingDto })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingDto> {
    return this.bookingsService.findOne(user.id, user.role, id);
  }

  @Post()
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: BookingDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingDto> {
    return this.bookingsService.create(user.id, dto);
  }

  @Patch(':id/status')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: BookingDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    return this.bookingsService.updateStatus(id, dto);
  }
}
