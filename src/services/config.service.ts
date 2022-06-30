import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import IEnvConfigInterface from '../interfaces/env-config.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
class ConfigService {
  public readonly envConfig: IEnvConfigInterface;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  public getCookieKey(): string {
    return this.envConfig.COOKIE_KEY;
  }

  public getTypeORMConfig(): TypeOrmModuleOptions {
    const baseDir = path.join(__dirname, '../');
    const entitiesPath = `${baseDir}${
      this.envConfig.TYPEORM_ENTITIES || process.env.TYPEORM_ENTITIES
    }`;
    const migrationPath = `${baseDir}${
      this.envConfig.TYPEORM_MIGRATIONS || process.env.TYPEORM_MIGRATIONS
    }`;

    let options = {
      type: this.envConfig.TYPEORM_CONNECTION || process.env.TYPEORM_CONNECTION,
      host: this.envConfig.TYPEORM_HOST || process.env.TYPEORM_HOST,
      username: this.envConfig.TYPEORM_USERNAME || process.env.TYPEORM_USERNAME,
      password: this.envConfig.TYPEORM_PASSWORD || process.env.TYPEORM_PASSWORD,
      database: this.envConfig.TYPEORM_DATABASE || process.env.TYPEORM_DATABASE,
      port: Number.parseInt(
        this.envConfig.TYPEORM_PORT || process.env.TYPEORM_PORT,
        10,
      ),
      logger: this.envConfig.TYPEORM_LOGGER || process.env.TYPEORM_LOGGER,
      logging:
        (this.envConfig.TYPEORM_LOGGING || process.env.TYPEORM_LOGGING) ===
        'true',
      entities: [entitiesPath],
      migrations: [migrationPath],
      migrationsRun:
        (this.envConfig.TYPEORM_MIGRATIONS_RUN ||
          process.env.TYPEORM_MIGRATIONS_RUN) === 'true',
      cli: {
        migrationsDir: `src/db/migrations/${process.env.TYPEORM_CONNECTION}`,
        entitiesDir: `src/**/entities`,
      },
    } as any;

    if (
      process.env.NODE_ENV === 'production' &&
      this.envConfig.TYPEORM_HOST !== 'localhost'
    ) {
      options.ssl = {
        rejectUnauthorized: false,
      };
    }

    return options;
  }

  /*
	  Ensures all needed variables are set, and returns the validated JavaScript object
	  including the applied default values.
  */
  private validateInput(envConfig: IEnvConfigInterface): IEnvConfigInterface {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'test', 'stage', 'production')
        .default('development'),
    }).unknown(true);

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}

export default ConfigService;
