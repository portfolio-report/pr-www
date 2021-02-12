DROP TABLE "markets";

ALTER TABLE "prices" RENAME COLUMN "security_market_id" TO "market_id";

ALTER TABLE "securities_markets" RENAME TO "markets";
