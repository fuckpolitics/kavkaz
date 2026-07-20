import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { toMoneyString } from '../common/utils/money.util';
import { ExtraService } from '../database/entities/extra-service.entity';
import { Location } from '../database/entities/location.entity';
import { CreateExtraServiceDto } from './dto/create-extra-service.dto';
import { ExtraServiceDto, toExtraServiceDto } from './dto/extra-service.dto';
import { UpdateExtraServiceDto } from './dto/update-extra-service.dto';
import { ExtraServicesRepository } from './extra-services.repository';

@Injectable()
export class ExtraServicesService {
  constructor(
    private readonly extraServicesRepository: ExtraServicesRepository,
    @InjectRepository(Location)
    private readonly locationsRepo: Repository<Location>,
  ) {}

  async findAll(pagination: PaginationDto): Promise<ExtraServiceDto[]> {
    const extraServices =
      await this.extraServicesRepository.findAll(pagination);
    return extraServices.map(toExtraServiceDto);
  }

  async findOne(id: string): Promise<ExtraServiceDto> {
    const extraService = await this.requireById(id);
    return toExtraServiceDto(extraService);
  }

  async create(dto: CreateExtraServiceDto): Promise<ExtraServiceDto> {
    const locationId = await this.resolveLocationId(dto.locationId ?? null);
    const extraService = this.extraServicesRepository.create({
      name: dto.name,
      description: dto.description,
      price: toMoneyString(dto.price),
      locationId,
    });
    const saved = await this.extraServicesRepository.save(extraService);
    return toExtraServiceDto(await this.requireById(saved.id));
  }

  async update(
    id: string,
    dto: UpdateExtraServiceDto,
  ): Promise<ExtraServiceDto> {
    const extraService = await this.requireById(id);

    if (dto.name !== undefined) {
      extraService.name = dto.name;
    }
    if (dto.description !== undefined) {
      extraService.description = dto.description;
    }
    if (dto.price !== undefined) {
      extraService.price = toMoneyString(dto.price);
    }
    if (dto.locationId !== undefined) {
      extraService.locationId = await this.resolveLocationId(dto.locationId);
    }

    await this.extraServicesRepository.save(extraService);
    return toExtraServiceDto(await this.requireById(id));
  }

  async remove(id: string): Promise<void> {
    await this.requireById(id);
    await this.extraServicesRepository.softDelete(id);
  }

  async requireById(id: string): Promise<ExtraService> {
    const extraService = await this.extraServicesRepository.findById(id);
    if (!extraService) {
      throw new NotFoundException('Extra service not found');
    }
    return extraService;
  }

  private async resolveLocationId(
    locationId: string | null,
  ): Promise<string | null> {
    if (!locationId) {
      return null;
    }
    const location = await this.locationsRepo.findOne({
      where: { id: locationId },
    });
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return locationId;
  }
}
