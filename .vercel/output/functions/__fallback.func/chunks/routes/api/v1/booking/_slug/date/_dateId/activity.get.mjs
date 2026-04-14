import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, c as createError, g as getQuery, s as supabase } from '../../../../../../../nitro/nitro.mjs';
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

const activity_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  if (isProdEnv) requireBookingUser(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { limit = 20, offset = 0 } = getQuery(event);
  const { data: travelDate, error: travelDateError } = await supabase.from("travel_dates").select("id").eq("id", dateId).eq("travel_slug", slug).single();
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  const { data, error } = await supabase.from("date_activity_log").select("*").eq("travel_date_id", dateId).order("created_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return data || [];
});

export { activity_get as default };
//# sourceMappingURL=activity.get.mjs.map
