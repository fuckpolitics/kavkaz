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
import { CreateTourDto } from './dto/create-tour.dto';
import { TourFilterDto } from './dto/tour-filter.dto';
import { TourShortDto } from './dto/tour-short.dto';
import { TourDto } from './dto/tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ToursService } from './tours.service';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: TourShortDto, isArray: true })
  findAll(@Query() filter: TourFilterDto): Promise<TourShortDto[]> {
    return this.toursService.findAll(filter);
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ type: TourDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TourDto> {
    return this.toursService.findOne(id);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: TourDto })
  create(@Body() dto: CreateTourDto): Promise<TourDto> {
    return this.toursService.create(dto);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: TourDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTourDto,
  ): Promise<TourDto> {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.toursService.remove(id);
  }
}
