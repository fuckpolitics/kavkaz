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
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../database/enums/user-role.enum';
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationShortDto } from './dto/destination-short.dto';
import { DestinationDto } from './dto/destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: DestinationShortDto, isArray: true })
  findAll(@Query() pagination: PaginationDto): Promise<DestinationShortDto[]> {
    return this.destinationsService.findAll(pagination);
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ type: DestinationDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DestinationDto> {
    return this.destinationsService.findOne(id);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: DestinationDto })
  create(@Body() dto: CreateDestinationDto): Promise<DestinationDto> {
    return this.destinationsService.create(dto);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: DestinationDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDestinationDto,
  ): Promise<DestinationDto> {
    return this.destinationsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.destinationsService.remove(id);
  }
}
