-- Round all margin values to the nearest integer.
-- The Excel extraction agent emitted spurious decimals (165.95, 508.15, …) that
-- need to be cleaned up across both margin storage surfaces.
--
-- Idempotent — safe to re-run; ROUND() on an already-integer value is a no-op.

UPDATE "public"."voyage_margins"
SET "margin_per_traveler" = ROUND("margin_per_traveler")
WHERE "margin_per_traveler" IS NOT NULL
  AND "margin_per_traveler" <> ROUND("margin_per_traveler");

UPDATE "public"."travel_dates"
SET "margin_override_per_traveler" = ROUND("margin_override_per_traveler")
WHERE "margin_override_per_traveler" IS NOT NULL
  AND "margin_override_per_traveler" <> ROUND("margin_override_per_traveler");
