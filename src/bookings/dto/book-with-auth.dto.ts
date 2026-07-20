import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';
import { BookingDto } from './booking.dto';

export class BookWithAuthResponseDto {
  @ApiProperty({ type: BookingDto })
  booking: BookingDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
