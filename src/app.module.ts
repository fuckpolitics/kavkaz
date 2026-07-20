import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DatabaseModule } from './database/database.module';
import { DestinationsModule } from './destinations/destinations.module';
import { ExtraServicesModule } from './extra-services/extra-services.module';
import { FilesModule } from './files/files.module';
import { LocationsModule } from './locations/locations.module';
import { ToursModule } from './tours/tours.module';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { BookingsModule } from './bookings/bookings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    FilesModule,
    DestinationsModule,
    LocationsModule,
    ExtraServicesModule,
    ToursModule,
    TripsModule,
    BookingsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
