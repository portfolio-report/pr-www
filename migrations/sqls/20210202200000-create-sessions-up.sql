CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX "sessions_sid" ON "sessions" ("sid");
