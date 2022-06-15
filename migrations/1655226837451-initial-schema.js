const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class initialSchema1655226837451 {
  name = 'initialSchema1655226837451';

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL PRIMARY KEY, "email" varchar NOT NULL, "password" varchar NOT NULL, "admin" boolean NOT NULL DEFAULT FALSE)`,
    );
    await queryRunner.query(
      `CREATE TABLE "report" ("id" SERIAL PRIMARY KEY, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT FALSE, "userId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_report" ("id" SERIAL PRIMARY KEY, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT FALSE, "userId" integer, CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_report"("id", "price", "make", "model", "year", "lng", "lat", "mileage", "approved", "userId") SELECT "id", "price", "make", "model", "year", "lng", "lat", "mileage", "approved", "userId" FROM "report"`,
    );
    await queryRunner.query(`DROP TABLE "report"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_report" RENAME TO "report"`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "report" RENAME TO "temporary_report"`,
    );
    await queryRunner.query(
      `CREATE TABLE "report" ("id" SERIAL PRIMARY KEY, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT FALSE, "userId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "report"("id", "price", "make", "model", "year", "lng", "lat", "mileage", "approved", "userId") SELECT "id", "price", "make", "model", "year", "lng", "lat", "mileage", "approved", "userId" FROM "temporary_report"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_report"`);
    await queryRunner.query(`DROP TABLE "report"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
};
