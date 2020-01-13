-- rename tables
DROP TABLE IF EXISTS clientupdates CASCADE;
DROP TABLE IF EXISTS exchangerates CASCADE;
DROP TABLE IF EXISTS exchangerates_prices CASCADE;
ALTER TABLE "clientUpdates" RENAME TO clientupdates;
ALTER TABLE "exchangeRates" RENAME TO exchangerates;
ALTER TABLE "exchangeRatePrices" RENAME TO exchangerates_prices;

-- change column types
ALTER TABLE "clientupdates" ALTER COLUMN id TYPE INT;
ALTER TABLE "clientupdates" ALTER COLUMN timestamp TYPE TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE "clientupdates" ALTER COLUMN timestamp SET NOT NULL;
ALTER TABLE "clientupdates" ALTER COLUMN version TYPE varchar(20) ;
ALTER TABLE "clientupdates" ALTER COLUMN version SET NOT NULL;
ALTER TABLE "clientupdates" ALTER COLUMN country TYPE varchar(2);
ALTER TABLE "clientupdates" ALTER COLUMN useragent TYPE varchar(60);

ALTER TABLE "events" ALTER COLUMN id TYPE INT;
ALTER TABLE "events" ALTER COLUMN "securityId" TYPE INT;
ALTER TABLE "events" ALTER COLUMN date SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN type TYPE varchar(10);
ALTER TABLE "events" ALTER COLUMN type SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN "currencyCode" TYPE varchar(3);
ALTER TABLE "events" ALTER COLUMN "ratio" TYPE varchar(10);

ALTER TABLE "markets" ALTER COLUMN id TYPE INT;
ALTER TABLE "markets" ALTER COLUMN "securityId" TYPE INT;
ALTER TABLE "markets" ALTER COLUMN "marketCode" TYPE varchar(4);
ALTER TABLE "markets" ALTER COLUMN "marketCode" SET NOT NULL;
ALTER TABLE "markets" ALTER COLUMN "currencyCode" TYPE varchar(3);
ALTER TABLE "markets" ALTER COLUMN "symbol" TYPE varchar(10);
ALTER TABLE "markets" ALTER COLUMN "updatePrices" SET NOT NULL;

ALTER TABLE "prices" ALTER COLUMN id TYPE INT;
ALTER TABLE "prices" ALTER COLUMN "marketId" TYPE INT;
ALTER TABLE "prices" ALTER COLUMN date SET NOT NULL;
ALTER TABLE "prices" ALTER COLUMN close SET NOT NULL;

ALTER TABLE "securities" ALTER COLUMN id TYPE INT;
ALTER TABLE "securities" ALTER COLUMN "uuid" TYPE varchar(36);
UPDATE "securities" SET uuid = REPLACE(uuid,'-','');
ALTER TABLE "securities" ALTER COLUMN "uuid" TYPE char(32);
ALTER TABLE "securities" ALTER COLUMN "name" TYPE varchar(255);
ALTER TABLE "securities" ALTER COLUMN "isin" TYPE varchar(12);
ALTER TABLE "securities" ALTER COLUMN "wkn" TYPE varchar(6);
ALTER TABLE "securities" ALTER COLUMN "symbolXfra" TYPE varchar(10);
ALTER TABLE "securities" ALTER COLUMN "symbolXnas" TYPE varchar(10);
ALTER TABLE "securities" ALTER COLUMN "symbolXnys" TYPE varchar(10);

ALTER TABLE "exchangerates" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangerates" ALTER COLUMN "baseCurrencyCode" TYPE VARCHAR(3);
ALTER TABLE "exchangerates" ALTER COLUMN "baseCurrencyCode" SET NOT NULL;
ALTER TABLE "exchangerates" ALTER COLUMN "quoteCurrencyCode" TYPE VARCHAR(3);
ALTER TABLE "exchangerates" ALTER COLUMN "quoteCurrencyCode" SET NOT NULL;

ALTER TABLE "exchangerates_prices" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "exchangeRateId" TYPE INT;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "exchangerates_prices" ALTER COLUMN "value" SET NOT NULL;

-- primary keys & sequences
ALTER TABLE "clientupdates" ADD CONSTRAINT "clientupdates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "clientupdates_id_seq" OWNED BY "clientupdates".id;
SELECT setval('clientupdates_id_seq', coalesce(max(id), 0) + 1, false) FROM "clientupdates";
ALTER TABLE "clientupdates" ALTER COLUMN id SET DEFAULT nextval('clientupdates_id_seq');

ALTER TABLE "events" ADD CONSTRAINT "events_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "events_id_seq" OWNED BY events.id;
SELECT setval('events_id_seq', coalesce(max(id), 0) + 1, false) FROM "events";
ALTER TABLE "events" ALTER COLUMN id SET DEFAULT nextval('events_id_seq');

ALTER TABLE "markets" ADD CONSTRAINT "markets_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "markets_id_seq" OWNED BY "markets".id;
SELECT setval('markets_id_seq', coalesce(max(id), 0) + 1, false) FROM "markets";
ALTER TABLE "markets" ALTER COLUMN id SET DEFAULT nextval('markets_id_seq');

ALTER TABLE "prices" ADD CONSTRAINT "prices_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "prices_id_seq" OWNED BY "prices".id;
SELECT setval('prices_id_seq', coalesce(max(id), 0) + 1, false) FROM "prices";
ALTER TABLE "prices" ALTER COLUMN id SET DEFAULT nextval('prices_id_seq');

ALTER TABLE "securities" ADD CONSTRAINT "securities_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "securities_id_seq" OWNED BY "securities".id;
SELECT setval('securities_id_seq', coalesce(max(id), 0) + 1, false) FROM "securities";
ALTER TABLE "securities" ALTER COLUMN id SET DEFAULT nextval('securities_id_seq');

ALTER TABLE "exchangerates" ADD CONSTRAINT "exchangerates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_id_seq" OWNED BY "exchangerates".id;
SELECT setval('exchangerates_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangerates";
ALTER TABLE "exchangerates" ALTER COLUMN id SET DEFAULT nextval('exchangerates_id_seq');

ALTER TABLE "exchangerate_prices" ADD CONSTRAINT "exchangerates_prices_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_prices_id_seq" OWNED BY "exchangerates_prices".id;
SELECT setval('exchangerates_prices_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangerates_prices";
ALTER TABLE "exchangerates_prices" ALTER COLUMN id SET DEFAULT nextval('exchangerates_prices_id_seq');

-- additional indexes
CREATE INDEX "clientupdates_timestamp" ON "clientUpdates" ("timestamp");
CREATE INDEX "clientupdates_version" ON "clientUpdates" ("version");
CREATE INDEX "clientupdates_country" ON "clientUpdates" ("country");
CREATE INDEX "exchangerates_base_currency_code" ON "exchangerates" ("baseCurrencyCode");
CREATE INDEX "exchangerates_quote_currency_code" ON "exchangerates" ("quoteCurrencyCode");
CREATE UNIQUE INDEX "exchangerates_base_currency_code_quote_currency_code" ON "exchangerates" ("baseCurrencyCode", "quoteCurrencyCode");
CREATE INDEX "exchangerates_prices_exchange_rate_id" ON "exchangerates_prices" ("exchangeRateId");
CREATE UNIQUE INDEX "exchangerates_prices_exchange_rate_id_date" ON "exchangeRates_prices" ("exchangeRateId", "date");
CREATE UNIQUE INDEX "securities_uuid" ON "securities" ("uuid");
CREATE INDEX "securities_name" ON "securities" ("name");
CREATE INDEX "securities_isin" ON "securities" ("isin");
CREATE INDEX "securities_wkn" ON "securities" ("wkn");
CREATE INDEX "securities_symbol_xfra" ON "securities" ("symbolXfra");
CREATE INDEX "securities_symbol_xnas" ON "securities" ("symbolXnas");
CREATE INDEX "securities_symbol_xnys" ON "securities" ("symbolXnys");
CREATE INDEX "securities_security_type" ON "securities" ("securityType");
CREATE INDEX "events_security_id" ON "events" ("securityId");
CREATE INDEX "events_security_id_date" ON "events" ("securityId", "date");
CREATE INDEX "events_security_id_type" ON "events" ("securityId", "type");
CREATE INDEX "markets_security_id" ON "markets" ("securityId");
CREATE UNIQUE INDEX "markets_security_id_market_code" ON "markets" ("securityId", "marketCode");
CREATE INDEX "prices_market_id" ON "prices" ("marketId");
CREATE UNIQUE INDEX "prices_market_id_date" ON "prices" ("marketId", "date");

-- foreign keys
ALTER TABLE "events" ADD CONSTRAINT "events_security_id_fkey" FOREIGN KEY ("securityId") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "markets" ADD CONSTRAINT "markets_security_id_fkey" FOREIGN KEY ("securityId") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prices" ADD CONSTRAINT "prices_market_id_fkey" FOREIGN KEY ("marketId") REFERENCES "markets" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exchangerates_prices" ADD CONSTRAINT "exchangerates_prices_exchangerate_id_fkey" FOREIGN KEY ("exchangeRateId") REFERENCES "exchangerates" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
