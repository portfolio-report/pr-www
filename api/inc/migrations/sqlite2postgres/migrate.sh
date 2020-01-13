# Expects DATABASE_URL="postgresql://username:password@host:port/database"

# Disable exit on non 0
set +e

pgloader --with "include drop" --with "create tables" --with "create no indexes" --with "quote identifiers" 'sqlite://../../../../db/database.sqlite' "$DATABASE_URL"

psql "$DATABASE_URL" < afterpgloader.sql
