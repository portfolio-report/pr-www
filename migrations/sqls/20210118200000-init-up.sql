CREATE TABLE "clientupdates" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "version" VARCHAR(20) NOT NULL,
  "country" VARCHAR(2),
  "useragent" VARCHAR(60)
);

CREATE INDEX "clientupdates_timestamp" ON "clientupdates" ("timestamp");
CREATE INDEX "clientupdates_version" ON "clientupdates" ("version");
CREATE INDEX "clientupdates_country" ON "clientupdates" ("country");

CREATE TABLE "exchangerates" (
  "id" SERIAL PRIMARY KEY,
  "base_currency_code" VARCHAR(3) NOT NULL,
  "quote_currency_code" VARCHAR(3) NOT NULL
);

CREATE INDEX "exchangerates_base_currency_code" ON "exchangerates" ("base_currency_code");
CREATE INDEX "exchangerates_quote_currency_code" ON "exchangerates" ("quote_currency_code");
CREATE UNIQUE INDEX "exchangerates_base_currency_code_quote_currency_code" ON "exchangerates" ("base_currency_code", "quote_currency_code");

CREATE TABLE "exchangerates_prices" (
  "id" SERIAL PRIMARY KEY,
  "date" DATE NOT NULL,
  "value" DECIMAL(12, 6) NOT NULL,
  "exchangerate_id" INTEGER REFERENCES "exchangerates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "exchangerates_prices_exchange_rate_id" ON "exchangerates_prices" ("exchangerate_id");
CREATE UNIQUE INDEX "exchangerates_prices_exchange_rate_id_date" ON "exchangerates_prices" ("exchangerate_id", "date");

CREATE TABLE "securities" (
  "id" SERIAL PRIMARY KEY,
  "uuid" CHAR(32),
  "name" VARCHAR(255),
  "isin" VARCHAR(12),
  "wkn" VARCHAR(6),
  "symbol_xfra" VARCHAR(10),
  "symbol_xnas" VARCHAR(10),
  "symbol_xnys" VARCHAR(10),
  "security_type" TEXT
);

CREATE UNIQUE INDEX "securities_uuid" ON "securities" ("uuid");
CREATE INDEX "securities_name" ON "securities" ("name");
CREATE INDEX "securities_isin" ON "securities" ("isin");
CREATE INDEX "securities_wkn" ON "securities" ("wkn");
CREATE INDEX "securities_symbol_xfra" ON "securities" ("symbol_xfra");
CREATE INDEX "securities_symbol_xnas" ON "securities" ("symbol_xnas");
CREATE INDEX "securities_symbol_xnys" ON "securities" ("symbol_xnys");
CREATE INDEX "securities_security_type" ON "securities" ("security_type");

CREATE TABLE "events" (
  "id" SERIAL PRIMARY KEY,
  "security_id" INTEGER REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "date" DATE NOT NULL,
  "type" VARCHAR(10) NOT NULL,
  "amount" DECIMAL(10, 4),
  "currency_code" VARCHAR(3),
  "ratio" VARCHAR(10)
);

CREATE INDEX "events_security_id" ON "events" ("security_id");
CREATE INDEX "events_security_id_date" ON "events" ("security_id", "date");
CREATE INDEX "events_security_id_type" ON "events" ("security_id", "type");

CREATE TABLE "markets" (
  "id" SERIAL PRIMARY KEY,
  "security_id" INTEGER REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "market_code" VARCHAR(4) NOT NULL,
  "currency_code" VARCHAR(3),
  "first_price_date" DATE,
  "last_price_date" DATE,
  "symbol" VARCHAR(10),
  "update_prices" BOOLEAN NOT NULL
);

CREATE INDEX "markets_security_id" ON "markets" ("security_id");
CREATE UNIQUE INDEX "markets_security_id_market_code" ON "markets" ("security_id", "market_code");

CREATE TABLE "prices" (
  "id" SERIAL PRIMARY KEY,
  "market_id" INTEGER REFERENCES "markets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "date" DATE NOT NULL,
  "close" DECIMAL(10, 4) NOT NULL
);

CREATE INDEX "prices_market_id" ON "prices" ("market_id");
CREATE UNIQUE INDEX "prices_market_id_date" ON "prices" ("market_id", "date");
