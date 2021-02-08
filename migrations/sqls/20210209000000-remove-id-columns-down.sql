ALTER TABLE "securities" ADD COLUMN "id" SERIAL;
ALTER TABLE "securities" DROP CONSTRAINT "securities_pkey";
ALTER TABLE "securities" ADD PRIMARY KEY ("id");

ALTER TABLE "events" ADD COLUMN "security_id" INT;
UPDATE "events" SET "security_id" = "securities"."id" FROM "securities" WHERE "events"."security_uuid" = "securities"."uuid";
ALTER TABLE "events" ALTER COLUMN "security_id" SET NOT NULL;
ALTER TABLE "events" ADD CONSTRAINT "events_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "securities"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "events" DROP COLUMN "security_uuid";
CREATE INDEX "events_security_id" ON "events" ("security_id");

ALTER TABLE "markets" ADD COLUMN "security_id" INT;
UPDATE "markets" SET "security_id" = "securities"."id" FROM "securities" WHERE "markets"."security_uuid" = "securities"."uuid";
ALTER TABLE "markets" ALTER COLUMN "security_id" SET NOT NULL;
ALTER TABLE "markets" ADD CONSTRAINT "markets_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "securities"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "markets" DROP COLUMN "security_uuid";
CREATE INDEX "markets_security_id" ON "markets" ("security_id");
CREATE UNIQUE INDEX "markets_security_id_market_code" ON "markets" ("security_id", "market_code");

ALTER TABLE "securities" ALTER COLUMN "uuid" DROP NOT NULL;

ALTER TABLE "prices" ADD COLUMN "id" SERIAL;
ALTER TABLE "prices" DROP CONSTRAINT "prices_pkey";
ALTER TABLE "prices" ADD PRIMARY KEY ("id");
CREATE UNIQUE INDEX "prices_market_id_date" ON "prices" ("market_id", "date");

DROP INDEX "users_username";
DROP INDEX "users_username_lower";
CREATE UNIQUE INDEX "users_username" ON "users" (LOWER("username"));
