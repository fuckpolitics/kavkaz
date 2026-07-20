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
import { Auth, Public } from '../common/decorators/auth.decorators';
import { UserRole } from '../database/enums/user-role.enum';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationFilterDto } from './dto/location-filter.dto';
import { LocationShortDto } from './dto/location-short.dto';
import { LocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: LocationShortDto, isArray: true })
  findAll(@Query() filter: LocationFilterDto): Promise<LocationShortDto[]> {
    return this.locationsService.findAll(filter);
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ type: LocationDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<LocationDto> {
    return this.locationsService.findOne(id);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: LocationDto })
  create(@Body() dto: CreateLocationDto): Promise<LocationDto> {
    return this.locationsService.create(dto);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: LocationDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationDto> {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.locationsService.remove(id);
  }
}
