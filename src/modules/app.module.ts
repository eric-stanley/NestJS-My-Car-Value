import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigModule from './config.module';
import { UsersModule } from '../users/modules/users.module';
import { ReportsModule } from '../reports/modules/reports.module';
import ConfigService from '../services/config.service';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return config.getTypeORMConfig();
      },
    }),
    UsersModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [
            this.configService.envConfig.COOKIE_KEY,
          ] as unknown as ArrayBuffer,
        }),
      )
      .forRoutes('*');
  }
}
