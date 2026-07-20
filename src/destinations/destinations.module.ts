import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from '../database/entities/destination.entity';
import { FilesModule } from '../files/files.module';
import { DestinationsController } from './destinations.controller';
import { DestinationsRepository } from './destinations.repository';
import { DestinationsService } from './destinations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Destination]), FilesModule],
  controllers: [DestinationsController],
  providers: [DestinationsService, DestinationsRepository],
  exports: [DestinationsService, DestinationsRepository],
})
export class DestinationsModule {}
