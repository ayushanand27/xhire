-- One-time migration helper for converting ResumeChunk.embedding from text -> vector(384)
-- Keeps valid 384-d vector strings, nulls invalid/legacy values.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ResumeChunk"
  ADD COLUMN IF NOT EXISTS "embedding_v2" vector(384);

UPDATE "ResumeChunk"
SET "embedding_v2" = CASE
  WHEN "embedding" IS NULL THEN NULL
  WHEN left(trim("embedding"), 1) = '['
    AND right(trim("embedding"), 1) = ']'
    AND array_length(
      string_to_array(
        regexp_replace(trim("embedding"), '^[\[]|[\]]$', '', 'g'),
        ','
      ),
      1
    ) = 384
  THEN trim("embedding")::vector(384)
  ELSE NULL
END;

ALTER TABLE "ResumeChunk" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "ResumeChunk" RENAME COLUMN "embedding_v2" TO "embedding";
