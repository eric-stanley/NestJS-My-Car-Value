var dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db/db.dev.sqlite',
      entities: ['**/entities/*.entity.js'],
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db/db.test.sqlite',
      entities: ['**/entities/*.entity.ts'],
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      migrations: true,
      entities: ['**/entities/*.entity.js'],
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    });
    break;
  default:
    throw new Error('Unknown environment: ' + process.env.NODE_ENV);
}

module.exports = dbConfig;
