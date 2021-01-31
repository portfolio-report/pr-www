ALTER TABLE events ALTER COLUMN security_id SET NOT NULL;
ALTER TABLE exchangerates_prices ALTER COLUMN exchangerate_id SET NOT NULL;
ALTER TABLE markets ALTER COLUMN security_id SET NOT NULL;
ALTER TABLE prices ALTER COLUMN market_id SET NOT NULL;
