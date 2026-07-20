import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from '../database/entities';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_DATABASE'),
    entities,
    synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: configService.get<string>('DB_LOGGING') === 'true',
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: configService.get<string>('DB_MIGRATIONS_RUN') === 'true',
    // Docker Postgres has no TLS. Opt-in with DB_SSL=true for managed DBs.
    ssl:
      configService.get<string>('DB_SSL') === 'true'
        ? {
            rejectUnauthorized:
              configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
          }
        : false,
  };
};
