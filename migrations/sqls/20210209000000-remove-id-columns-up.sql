ALTER TABLE "securities" ALTER COLUMN "uuid" SET NOT NULL;

ALTER TABLE "events" ADD COLUMN "security_uuid" UUID;
UPDATE "events" SET "security_uuid" = "securities"."uuid" FROM "securities" WHERE "events"."security_id" = "securities"."id";
ALTER TABLE "events" ALTER COLUMN "security_uuid" SET NOT NULL;
ALTER TABLE "events" ADD CONSTRAINT "events_security_uuid_fkey" FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "events" DROP COLUMN "security_id";
CREATE INDEX "events_security_uuid" ON "events" ("security_uuid");

ALTER TABLE "markets" ADD COLUMN "security_uuid" UUID;
UPDATE "markets" SET "security_uuid" = "securities"."uuid" FROM "securities" WHERE "markets"."security_id" = "securities"."id";
ALTER TABLE "markets" ALTER COLUMN "security_uuid" SET NOT NULL;
ALTER TABLE "markets" ADD CONSTRAINT "markets_security_uuid_fkey" FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "markets" DROP COLUMN "security_id";
CREATE INDEX "markets_security_uuid" ON "markets" ("security_uuid");
CREATE UNIQUE INDEX "markets_security_uuid_market_code" ON "markets" ("security_uuid", "market_code");

ALTER TABLE "securities" DROP COLUMN "id";
ALTER TABLE "securities" ADD PRIMARY KEY ("uuid");

ALTER TABLE "prices" DROP COLUMN "id";
ALTER TABLE "prices" ADD PRIMARY KEY ("market_id", "date");
DROP INDEX "prices_market_id_date";

DROP INDEX "users_username";
CREATE UNIQUE INDEX "users_username_lower" ON "users" (LOWER("username"));
CREATE UNIQUE INDEX "users_username" ON "users" ("username");
