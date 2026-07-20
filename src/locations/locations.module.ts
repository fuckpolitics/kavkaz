import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../database/entities/location.entity';
import { DestinationsModule } from '../destinations/destinations.module';
import { FilesModule } from '../files/files.module';
import { LocationsController } from './locations.controller';
import { LocationsRepository } from './locations.repository';
import { LocationsService } from './locations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    DestinationsModule,
    FilesModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository],
  exports: [LocationsService, LocationsRepository],
})
export class LocationsModule {}
