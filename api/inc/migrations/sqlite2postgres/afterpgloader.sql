-- change column types
ALTER TABLE "clientUpdates" ALTER COLUMN id TYPE INT;
ALTER TABLE "clientUpdates" ALTER COLUMN timestamp TYPE TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE "clientUpdates" ALTER COLUMN timestamp SET NOT NULL;
ALTER TABLE "clientUpdates" ALTER COLUMN version TYPE varchar(20) ;
ALTER TABLE "clientUpdates" ALTER COLUMN version SET NOT NULL;
ALTER TABLE "clientUpdates" ALTER COLUMN country TYPE varchar(2);
ALTER TABLE "clientUpdates" ALTER COLUMN useragent TYPE varchar(60);

ALTER TABLE events ALTER COLUMN id TYPE INT;
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

ALTER TABLE "exchangeRates" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangeRates" ALTER COLUMN "baseCurrencyCode" TYPE VARCHAR(3);
ALTER TABLE "exchangeRates" ALTER COLUMN "baseCurrencyCode" SET NOT NULL;
ALTER TABLE "exchangeRates" ALTER COLUMN "quoteCurrencyCode" TYPE VARCHAR(3);
ALTER TABLE "exchangeRates" ALTER COLUMN "quoteCurrencyCode" SET NOT NULL;

ALTER TABLE "exchangeRatePrices" ALTER COLUMN id TYPE INT;
ALTER TABLE "exchangeRatePrices" ALTER COLUMN "exchangeRateId" TYPE INT;
ALTER TABLE "exchangeRatePrices" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "exchangeRatePrices" ALTER COLUMN "value" SET NOT NULL;

-- primary keys & sequences
ALTER TABLE "clientUpdates" ADD CONSTRAINT "clientupdates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "clientupdates_id_seq" OWNED BY "clientUpdates".id;
SELECT setval('clientupdates_id_seq', coalesce(max(id), 0) + 1, false) FROM "clientUpdates";
ALTER TABLE "clientUpdates" ALTER COLUMN id SET DEFAULT nextval('clientupdates_id_seq');

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

ALTER TABLE "exchangeRates" ADD CONSTRAINT "exchangerates_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_id_seq" OWNED BY "exchangeRates".id;
SELECT setval('exchangerates_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangeRates";
ALTER TABLE "exchangeRates" ALTER COLUMN id SET DEFAULT nextval('exchangerates_id_seq');

ALTER TABLE "exchangeRatePrices" ADD CONSTRAINT "exchangerates_prices_pkey" PRIMARY KEY (id);
CREATE SEQUENCE "exchangerates_prices_id_seq" OWNED BY "exchangeRatePrices".id;
SELECT setval('exchangerates_prices_id_seq', coalesce(max(id), 0) + 1, false) FROM "exchangeRatePrices";
ALTER TABLE "exchangeRatePrices" ALTER COLUMN id SET DEFAULT nextval('exchangerates_prices_id_seq');

-- foreign keys
ALTER TABLE "events" ADD CONSTRAINT "events_security_id_fkey" FOREIGN KEY ("securityId") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "markets" ADD CONSTRAINT "markets_security_id_fkey" FOREIGN KEY ("securityId") REFERENCES "securities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prices" ADD CONSTRAINT "prices_market_id_fkey" FOREIGN KEY ("marketId") REFERENCES "markets" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exchangeRatePrices" ADD CONSTRAINT "exchangerates_prices_exchangerate_id_fkey" FOREIGN KEY ("exchangeRateId") REFERENCES "exchangeRates" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
