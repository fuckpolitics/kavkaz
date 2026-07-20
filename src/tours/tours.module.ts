import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from '../database/entities/tour.entity';
import { DestinationsModule } from '../destinations/destinations.module';
import { FilesModule } from '../files/files.module';
import { ToursController } from './tours.controller';
import { ToursRepository } from './tours.repository';
import { ToursService } from './tours.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tour]), DestinationsModule, FilesModule],
  controllers: [ToursController],
  providers: [ToursService, ToursRepository],
  exports: [ToursService, ToursRepository],
})
export class ToursModule {}
