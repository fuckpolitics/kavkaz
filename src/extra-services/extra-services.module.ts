import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtraService } from '../database/entities/extra-service.entity';
import { Location } from '../database/entities/location.entity';
import { ExtraServicesController } from './extra-services.controller';
import { ExtraServicesRepository } from './extra-services.repository';
import { ExtraServicesService } from './extra-services.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExtraService, Location])],
  controllers: [ExtraServicesController],
  providers: [ExtraServicesService, ExtraServicesRepository],
  exports: [ExtraServicesService, ExtraServicesRepository],
})
export class ExtraServicesModule {}
