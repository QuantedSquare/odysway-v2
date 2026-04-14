import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, s as supabase, c as createError } from '../../../../nitro/nitro.mjs';
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

const travels_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  if (isProdEnv) requireBookingUser(event);
  const { data, error } = await supabase.from("travel_dates").select("travel_slug, booked_seat, is_custom_travel, departure_date, return_date");
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  const today = /* @__PURE__ */ new Date();
  const slugMap = {};
  for (const row of data) {
    if (!row.travel_slug) continue;
    if (!slugMap[row.travel_slug]) {
      slugMap[row.travel_slug] = {
        nb_dates: 0,
        booked_seats: 0,
        is_custom_travel: false,
        ongoing_dates: 0
      };
    }
    slugMap[row.travel_slug].nb_dates++;
    slugMap[row.travel_slug].booked_seats += row.booked_seat || 0;
    slugMap[row.travel_slug].is_custom_travel = row.is_custom_travel;
    const dep = new Date(row.departure_date);
    const ret = new Date(row.return_date);
    if (today >= dep && today <= ret) {
      slugMap[row.travel_slug].ongoing_dates += 1;
    }
  }
  return Object.entries(slugMap).map(([travel_slug, { nb_dates, booked_seats, is_custom_travel, ongoing_dates }]) => ({
    travel_slug,
    nb_dates,
    booked_seats,
    is_custom_travel,
    ongoing_dates
  }));
});

export { travels_get as default };
//# sourceMappingURL=travels.get.mjs.map
