ALTER TABLE events ALTER COLUMN security_id DROP NOT NULL;
ALTER TABLE exchangerates_prices ALTER COLUMN exchangerate_id DROP NOT NULL;
ALTER TABLE markets ALTER COLUMN security_id DROP NOT NULL;
ALTER TABLE prices ALTER COLUMN market_id DROP NOT NULL;
