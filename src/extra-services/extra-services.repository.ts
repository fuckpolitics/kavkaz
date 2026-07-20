import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExtraService } from '../database/entities/extra-service.entity';

@Injectable()
export class ExtraServicesRepository {
  constructor(
    @InjectRepository(ExtraService)
    private readonly repo: Repository<ExtraService>,
  ) {}

  create(data: Partial<ExtraService>): ExtraService {
    return this.repo.create(data);
  }

  save(extraService: ExtraService): Promise<ExtraService> {
    return this.repo.save(extraService);
  }

  findById(id: string): Promise<ExtraService | null> {
    return this.repo.findOne({
      where: { id },
      relations: { location: true },
    });
  }

  findAll(pagination: PaginationDto): Promise<ExtraService[]> {
    const { page = 1, limit = 20, order = 'DESC' } = pagination;
    return this.repo.find({
      relations: { location: true },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
