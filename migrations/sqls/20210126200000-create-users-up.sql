CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL,
  "password" VARCHAR(200)
);

CREATE UNIQUE INDEX "users_username" ON "users" (LOWER("username"));
