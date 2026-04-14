import { a as defineEventHandler, A as getHeader, c as createError, s as supabase, i as departures, b as activecampaign } from '../../../../../nitro/nitro.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
import 'axios';
import 'jsonwebtoken';
import 'dayjs';
import '@supabase/supabase-js';
import 'stripe';
import 'crypto';
import 'zod';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';

const departureStages = defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = getHeader(event, "x-cron-secret");
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const { data: rows, error: fetchError } = await supabase.from("travel_dates").select("id, departure_date, return_date, booked_seat, min_travelers, departure_id").not("departure_id", "is", null);
  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message });
  }
  if (!rows || rows.length === 0) {
    return { success: true, scanned: 0, updated: 0 };
  }
  let updated = 0;
  for (const row of rows) {
    try {
      const stageId = departures.computeDepartureStage(
        row.departure_date,
        row.return_date,
        row.booked_seat,
        row.min_travelers
      );
      const { deal } = await activecampaign.getDealById(row.departure_id);
      const currentStage = (deal == null ? void 0 : deal.stage) ? String(deal.stage) : null;
      if (currentStage !== String(stageId)) {
        await activecampaign.updateDeal(row.departure_id, {
          stage: String(stageId)
        });
        updated++;
        console.log(`Departure deal ${row.departure_id} (travel_date ${row.id}): stage ${currentStage} \u2192 ${stageId}`);
      }
    } catch (err) {
      console.error(`Error syncing departure deal for travel_date ${row.id}:`, err.message);
    }
  }
  return {
    success: true,
    scanned: rows.length,
    updated
  };
});

export { departureStages as default };
//# sourceMappingURL=departure-stages.mjs.map
