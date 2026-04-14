import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, c as createError, s as supabase, v as logDateActivity } from '../../../../../../../nitro/nitro.mjs';
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

const assignDepartureDeal_delete = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { data: travelDate, error: travelDateError } = await supabase.from("travel_dates").select("id, travel_slug, departure_id").eq("id", dateId).eq("travel_slug", slug).single();
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  const { error: updateError } = await supabase.from("travel_dates").update({ departure_id: null }).eq("id", dateId);
  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }
  await logDateActivity(dateId, bookingUser, "departure_removed", { previous_departure_id: travelDate.departure_id || null });
  return { departure_id: null };
});

export { assignDepartureDeal_delete as default };
//# sourceMappingURL=assign-departure-deal.delete.mjs.map
