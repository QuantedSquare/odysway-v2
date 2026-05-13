-- Pipeline title is only exposed in the AC webhook body (deal[pipeline_title])
-- and not in the REST API response. Storing it alongside pipeline_id makes
-- dashboard queries readable without a join to a static mapping.

ALTER TABLE "public"."activecampaign_deals"
    ADD COLUMN IF NOT EXISTS "pipeline_title" text;
