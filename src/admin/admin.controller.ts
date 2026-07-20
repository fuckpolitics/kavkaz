import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorators';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../database/enums/user-role.enum';
import { BookingsService } from '../bookings/bookings.service';
import { AdminBookingDto } from '../bookings/dto/booking.dto';
import { toUserDto, UserDto } from '../users/dto/user.dto';
import { UsersRepository } from '../users/users.repository';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get('users')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto, isArray: true })
  async listUsers(): Promise<UserDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map(toUserDto);
  }

  @Patch('users/:id')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
  ): Promise<UserDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }
    const saved = await this.usersRepository.save(user);
    const full = await this.usersRepository.findById(saved.id);
    return toUserDto(full!);
  }

  @Get('bookings')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: AdminBookingDto, isArray: true })
  listBookings(@Query() pagination: PaginationDto): Promise<AdminBookingDto[]> {
    return this.bookingsService.findAllAdmin(pagination);
  }
}
