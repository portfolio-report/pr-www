ALTER TABLE "markets" RENAME TO "securities_markets";

ALTER TABLE "prices" RENAME COLUMN "market_id" TO "security_market_id";

CREATE TABLE "markets" (
  "code" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL
);
