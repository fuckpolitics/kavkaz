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
import { CreateExtraServiceDto } from './dto/create-extra-service.dto';
import { ExtraServiceDto } from './dto/extra-service.dto';
import { UpdateExtraServiceDto } from './dto/update-extra-service.dto';
import { ExtraServicesService } from './extra-services.service';

@ApiTags('extra-services')
@Controller('extra-services')
export class ExtraServicesController {
  constructor(private readonly extraServicesService: ExtraServicesService) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: ExtraServiceDto, isArray: true })
  findAll(@Query() pagination: PaginationDto): Promise<ExtraServiceDto[]> {
    return this.extraServicesService.findAll(pagination);
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ type: ExtraServiceDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExtraServiceDto> {
    return this.extraServicesService.findOne(id);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: ExtraServiceDto })
  create(@Body() dto: CreateExtraServiceDto): Promise<ExtraServiceDto> {
    return this.extraServicesService.create(dto);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOkResponse({ type: ExtraServiceDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExtraServiceDto,
  ): Promise<ExtraServiceDto> {
    return this.extraServicesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.extraServicesService.remove(id);
  }
}
