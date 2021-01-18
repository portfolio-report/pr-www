-- rename tables
DROP TABLE IF EXISTS clientupdates CASCADE;
DROP TABLE IF EXISTS exchangerates CASCADE;
DROP TABLE IF EXISTS exchangerates_prices CASCADE;
ALTER TABLE "clientUpdates" RENAME TO clientupdates;
ALTER TABLE "exchangeRates" RENAME TO exchangerates;
ALTER TABLE "exchangeRatePrices" RENAME TO exchangerates_prices;

-- rename columns
ALTER TABLE events RENAME COLUMN "currencyCode" TO currency_code;
ALTER TABLE events RENAME COLUMN "securityId" TO security_id;
ALTER TABLE markets RENAME COLUMN "securityId" TO security_id;
ALTER TABLE markets RENAME COLUMN "marketCode" TO market_code;
ALTER TABLE markets RENAME COLUMN "currencyCode" TO currency_code;
ALTER TABLE markets RENAME COLUMN "firstPriceDate" TO first_price_date;
ALTER TABLE markets RENAME COLUMN "lastPriceDate" TO last_price_date;
ALTER TABLE markets RENAME COLUMN "updatePrices" TO update_prices;
ALTER TABLE prices RENAME COLUMN "marketId" TO market_id;
ALTER TABLE securities RENAME COLUMN "symbolXfra" TO symbol_xfra;
ALTER TABLE securities RENAME COLUMN "symbolXnas" TO symbol_xnas;
ALTER TABLE securities RENAME COLUMN "symbolXnys" TO symbol_xnys;
ALTER TABLE securities RENAME COLUMN "securityType" TO security_type;
ALTER TABLE exchangerates RENAME COLUMN "baseCurrencyCode" TO base_currency_code;
ALTER TABLE exchangerates RENAME COLUMN "quoteCurrencyCode" TO quote_currency_code;
ALTER TABLE exchangerates_prices RENAME COLUMN "exchangeRateId" TO exchangerate_id;

-- change column types
ALTER TABLE "clientupdates" ALTER COLUMN id TYPE INT;
ALTER TABLE "clientupdates" ALTER COLUMN timestamp TYPE TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE "clientupdates" ALTER COLUMN timestamp SET NOT NULL;
ALTER TABLE "clientupdates" ALTER COLUMN version TYPE varchar(20) ;
ALTER TABLE "clientupdates" ALTER COLUMN version SET NOT NULL;
ALTER TABLE "clientupdates" ALTER COLUMN country TYPE varchar(2);
ALTER TABLE "clientupdates" ALTER COLUMN useragent TYPE varchar(60);

ALTER TABLE "events" ALTER COLUMN id TYPE INT;
ALTER TABLE "events" ALTER COLUMN "security_id" TYPE INT;
ALTER TABLE "events" ALTER COLUMN date SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN type TYPE varchar(10);
ALTER TABLE "events" ALTER COLUMN type SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN "currency_code" TYPE varchar(3);
ALTER TABLE "events" ALTER COLUMN "ratio" TYPE varchar(10);

ALTER TABLE "markets" ALTER COLUMN id TYPE INT;
ALTER TABLE "markets" ALTER COLUMN "security_id" TYPE INT;
ALTER TABLE "markets" ALTER COLUMN "market_code" TYPE varchar(4);
ALTER TABLE "markets" ALTER COLUMN "market_code" SET NOT NULL;
ALTER TABLE "markets" ALTER COLUMN "currency_code" TYPE varchar(3);
ALTER TABLE "markets" ALTER COLUMN "symbol" TYPE varchar(10);
ALTER TABLE "markets" ALTER COLUMN "update_prices" SET NOT NULL;

ALTER TABLE "prices" ALTER COLUMN id TYPE INT;
ALTER TABLE "prices" ALTER COLUMN "market_id" TYPE INT;
ALTER TABLE "prices" ALTER COLUMN date SET NOT NULL;
ALTER TABLE "prices" ALTER COLUMN close SET NOT NULL;

ALTER TABLE "securities" ALTER COLUMN id TYPE INT;
ALTER TABLE "securities" ALTER COLUMN "uuid" TYPE varchar(36);
UPDATE "securities" SET uuid = REPLACE(uuid,'-','');
ALTER TABLE "securities" ALTER COLUMN "uuid" TYPE char(32);
ALTER TABLE "securities" ALTER COLUMN "name" TYPE varchar(255);
ALTER TABLE "securities" ALTER COLUMN "isin" TYPE varchar(12);
ALTER TABLE "securities" ALTER COLUMN "wkn" TYPE varchar(6);
ALTER TABLE "securities" ALTER COLUMN "symbol_xfra" TYPE varchar(10);
ALTER TABLE "securities" ALTER COLUMN "symbol_xnas" TYPE varchar(10);
ALTER TABLE "securities" ALTER COLUMN "symbol_xnys" TYPE varchar(10);

ALTER TABLE "exchangerates" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangerates" ALTER COLUMN "base_currency_code" TYPE VARCHAR(3);
ALTER TABLE "exchangerates" ALTER COLUMN "base_currency_code" SET NOT NULL;
ALTER TABLE "exchangerates" ALTER COLUMN "quote_currency_code" TYPE VARCHAR(3);
ALTER TABLE "exchangerates" ALTER COLUMN "quote_currency_code" SET NOT NULL;

ALTER TABLE "exchangerates_prices" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "exchangerate_id" TYPE INT;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "value" SET NOT NULL;

-- primary keys & sequences
ALTER TABLE "clientupdates" ADD CONSTRAINT "clientupdates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "clientupdates_id_seq" AS INTEGER OWNED BY "clientupdates".id;
SELECT setval('clientupdates_id_seq', coalesce(max(id), 0) + 1, false) FROM "clientupdates";
ALTER TABLE "clientupdates" ALTER COLUMN id SET DEFAULT nextval('clientupdates_id_seq');

ALTER TABLE "events" ADD CONSTRAINT "events_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "events_id_seq" AS INTEGER OWNED BY events.id;
SELECT setval('events_id_seq', coalesce(max(id), 0) + 1, false) FROM "events";
ALTER TABLE "events" ALTER COLUMN id SET DEFAULT nextval('events_id_seq');

ALTER TABLE "markets" ADD CONSTRAINT "markets_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "markets_id_seq" AS INTEGER OWNED BY "markets".id;
SELECT setval('markets_id_seq', coalesce(max(id), 0) + 1, false) FROM "markets";
ALTER TABLE "markets" ALTER COLUMN id SET DEFAULT nextval('markets_id_seq');

ALTER TABLE "prices" ADD CONSTRAINT "prices_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "prices_id_seq" AS INTEGER OWNED BY "prices".id;
SELECT setval('prices_id_seq', coalesce(max(id), 0) + 1, false) FROM "prices";
ALTER TABLE "prices" ALTER COLUMN id SET DEFAULT nextval('prices_id_seq');

ALTER TABLE "securities" ADD CONSTRAINT "securities_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "securities_id_seq" AS INTEGER OWNED BY "securities".id;
SELECT setval('securities_id_seq', coalesce(max(id), 0) + 1, false) FROM "securities";
ALTER TABLE "securities" ALTER COLUMN id SET DEFAULT nextval('securities_id_seq');

ALTER TABLE "exchangerates" ADD CONSTRAINT "exchangerates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_id_seq" AS INTEGER OWNED BY "exchangerates".id;
SELECT setval('exchangerates_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangerates";
ALTER TABLE "exchangerates" ALTER COLUMN id SET DEFAULT nextval('exchangerates_id_seq');

ALTER TABLE "exchangerates_prices" ADD CONSTRAINT "exchangerates_prices_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_prices_id_seq" AS INTEGER OWNED BY "exchangerates_prices".id;
SELECT setval('exchangerates_prices_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangerates_prices";
ALTER TABLE "exchangerates_prices" ALTER COLUMN id SET DEFAULT nextval('exchangerates_prices_id_seq');

-- additional indexes
CREATE INDEX "clientupdates_timestamp" ON "clientupdates" ("timestamp");
CREATE INDEX "clientupdates_version" ON "clientupdates" ("version");
CREATE INDEX "clientupdates_country" ON "clientupdates" ("country");
CREATE INDEX "exchangerates_base_currency_code" ON "exchangerates" ("base_currency_code");
CREATE INDEX "exchangerates_quote_currency_code" ON "exchangerates" ("quote_currency_code");
CREATE UNIQUE INDEX "exchangerates_base_currency_code_quote_currency_code" ON "exchangerates" ("base_currency_code", "quote_currency_code");
CREATE INDEX "exchangerates_prices_exchange_rate_id" ON "exchangerates_prices" ("exchangerate_id");
CREATE UNIQUE INDEX "exchangerates_prices_exchange_rate_id_date" ON "exchangerates_prices" ("exchangerate_id", "date");
CREATE UNIQUE INDEX "securities_uuid" ON "securities" ("uuid");
CREATE INDEX "securities_name" ON "securities" ("name");
CREATE INDEX "securities_isin" ON "securities" ("isin");
CREATE INDEX "securities_wkn" ON "securities" ("wkn");
CREATE INDEX "securities_symbol_xfra" ON "securities" ("symbol_xfra");
CREATE INDEX "securities_symbol_xnas" ON "securities" ("symbol_xnas");
CREATE INDEX "securities_symbol_xnys" ON "securities" ("symbol_xnys");
CREATE INDEX "securities_security_type" ON "securities" ("security_type");
CREATE INDEX "events_security_id" ON "events" ("security_id");
CREATE INDEX "events_security_id_date" ON "events" ("security_id", "date");
CREATE INDEX "events_security_id_type" ON "events" ("security_id", "type");
CREATE INDEX "markets_security_id" ON "markets" ("security_id");
CREATE UNIQUE INDEX "markets_security_id_market_code" ON "markets" ("security_id", "market_code");
CREATE INDEX "prices_market_id" ON "prices" ("market_id");
CREATE UNIQUE INDEX "prices_market_id_date" ON "prices" ("market_id", "date");

-- foreign keys
ALTER TABLE "events" ADD CONSTRAINT "events_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "markets" ADD CONSTRAINT "markets_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prices" ADD CONSTRAINT "prices_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exchangerates_prices" ADD CONSTRAINT "exchangerates_prices_exchangerate_id_fkey" FOREIGN KEY ("exchangerate_id") REFERENCES "exchangerates" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- delete old migration table
DROP TABLE "SequelizeMeta";

-- create new migration table
CREATE TABLE "migrations" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "run_on" TIMESTAMP NOT NULL
);
INSERT INTO migrations (name, run_on) VALUES ('/20210118200000-init', NOW());
