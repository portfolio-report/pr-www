CREATE TABLE "taxonomies" (
  "uuid" UUID NOT NULL PRIMARY KEY,
  "parent_uuid" UUID NULL REFERENCES "taxonomies" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
  "root_uuid" UUID NULL REFERENCES "taxonomies" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NULL,
);

CREATE INDEX "taxonomies_parent_uuid" ON "taxonomies" ("parent_uuid");
CREATE INDEX "taxonomies_root_uuid" ON "taxonomies" ("root_uuid");

CREATE TABLE "securities_taxonomies" (
  "taxonomy_uuid" UUID NOT NULL REFERENCES "taxonomies" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
  "security_uuid" UUID NOT NULL REFERENCES "securities" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
  "weight" DECIMAL(5, 2) NOT NULL,
  PRIMARY KEY(taxonomy_uuid, security_uuid)
);
