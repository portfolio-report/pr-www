ALTER TABLE "prices" RENAME TO "securities_markets_prices";
ALTER INDEX "prices_pkey" RENAME TO "securities_markets_prices_pkey";
ALTER INDEX "prices_market_id" RENAME TO "securities_markets_prices_security_market_id";
ALTER TABLE "securities_markets_prices" RENAME CONSTRAINT "prices_market_id_fkey" TO "securities_markets_prices_security_market_id_fkey";

ALTER TABLE "securities" ALTER COLUMN "name" TYPE TEXT;

ALTER TABLE "securities_markets" ALTER COLUMN "currency_code" SET NOT NULL;
ALTER SEQUENCE "markets_id_seq" RENAME TO "securities_markets_id_seq";

