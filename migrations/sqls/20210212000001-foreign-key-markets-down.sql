ALTER TABLE "securities_markets" DROP CONSTRAINT securities_markets_market_code_fkey;
ALTER TABLE "securities_markets" ALTER COLUMN "market_code" TYPE VARCHAR(4);

ALTER INDEX "markets_pkey" RENAME TO "markets_pkey1";

ALTER INDEX "securities_markets_pkey" RENAME TO "markets_pkey";
ALTER INDEX "securities_markets_security_uuid_market_code" RENAME TO "markets_security_uuid_market_code";
ALTER INDEX "securities_markets_security_uuid" RENAME TO "markets_security_uuid";

ALTER TABLE "securities_markets" RENAME CONSTRAINT "securities_markets_security_uuid_fkey" TO "markets_security_uuid_fkey";
