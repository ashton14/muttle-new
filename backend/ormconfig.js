module.exports = {
  type: 'postgres',
  host: process.env.MUTTLE_DB_HOST,
  port: 5432,
  username: process.env.MUTTLE_DB_USER,
  password: process.env.MUTTLE_DB_PW,
  database: 'muttle',
  entities: ['src/entity/*.ts'],
  logging: false,
  synchronize: true,
  migrationsTableName: 'migration_table',
  migrations: ['migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations',
    entitiesDir: 'src/entity',
  },
  seeds: ['src/seeds/**/*{.ts,.js}'],
  factories: ['src/factories/**/*{.ts,.js'],
};
