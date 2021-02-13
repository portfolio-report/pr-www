ALTER TABLE "securities_markets_prices" RENAME TO "prices";
ALTER INDEX "securities_markets_prices_pkey" RENAME TO "prices_pkey";
ALTER INDEX "securities_markets_prices_security_market_id" RENAME TO "prices_market_id";
ALTER TABLE "prices" RENAME CONSTRAINT "securities_markets_prices_security_market_id_fkey" TO "prices_market_id_fkey";

ALTER TABLE "securities" ALTER COLUMN "name" TYPE VARCHAR(255);

ALTER TABLE "securities_markets" ALTER COLUMN "currency_code" DROP NOT NULL;
ALTER SEQUENCE "securities_markets_id_seq" RENAME TO "markets_id_seq";
