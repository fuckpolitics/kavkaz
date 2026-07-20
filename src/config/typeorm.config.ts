import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from '../database/entities';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

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
    ssl: isProduction
      ? { rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false' }
      : false,
  };
};
