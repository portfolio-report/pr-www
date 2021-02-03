ALTER TABLE "securities" ALTER COLUMN "uuid" TYPE CHAR(32) USING (REPLACE(uuid::text,'-',''));
