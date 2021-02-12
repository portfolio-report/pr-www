ALTER TABLE "securities_markets" ALTER COLUMN "market_code" TYPE TEXT;
ALTER TABLE "securities_markets" ADD CONSTRAINT securities_markets_market_code_fkey FOREIGN KEY (market_code) REFERENCES "markets" ("code") ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER INDEX "markets_pkey" RENAME TO "securities_markets_pkey";
ALTER INDEX "markets_security_uuid_market_code" RENAME TO "securities_markets_security_uuid_market_code";
ALTER INDEX "markets_security_uuid" RENAME TO "securities_markets_security_uuid";

ALTER TABLE "securities_markets" RENAME CONSTRAINT "markets_security_uuid_fkey" TO "securities_markets_security_uuid_fkey";

ALTER INDEX "markets_pkey1" RENAME TO "markets_pkey";
