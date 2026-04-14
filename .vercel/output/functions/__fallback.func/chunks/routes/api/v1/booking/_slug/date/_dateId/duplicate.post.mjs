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

const duplicate_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { data: original, error } = await supabase.from("travel_dates").select("*").eq("id", dateId).eq("travel_slug", slug).single();
  if (error || !original) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  const rest = { ...original };
  delete rest.id;
  delete rest.created_at;
  delete rest.booked_seat;
  delete rest.status;
  delete rest.departure_id;
  const newDate = { ...rest, booked_seat: 0, status: "soon_confirmed" };
  const { data: inserted, error: insertError } = await supabase.from("travel_dates").insert([newDate]).select("*").single();
  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }
  await logDateActivity(inserted.id, bookingUser, "duplicated", { source_date_id: dateId });
  return inserted;
});

export { duplicate_post as default };
//# sourceMappingURL=duplicate.post.mjs.map
