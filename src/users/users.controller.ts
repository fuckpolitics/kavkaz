import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto })
  getMe(@CurrentUser() user: User): Promise<UserDto> {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @Auth(UserRole.USER, UserRole.ADMIN)
  @ApiOkResponse({ type: UserDto })
  updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.updateMe(user.id, dto);
  }
}
