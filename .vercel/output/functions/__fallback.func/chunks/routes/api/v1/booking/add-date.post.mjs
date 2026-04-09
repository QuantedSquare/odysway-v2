import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, f as readBody, c as createError, s as supabase, v as logDateActivity } from '../../../../nitro/nitro.mjs';
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

const addDate_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.travel_slug)) {
    throw createError({ statusCode: 400, statusMessage: "travel_slug requis" });
  }
  if (!(body == null ? void 0 : body.departure_date) || !(body == null ? void 0 : body.return_date)) {
    throw createError({ statusCode: 400, statusMessage: "departure_date et return_date requis" });
  }
  const insertData = {};
  const allowed = [
    "travel_slug",
    "published",
    "is_indiv_travel",
    "is_custom_travel",
    "departure_date",
    "return_date",
    "max_travelers",
    "min_travelers",
    "booked_seat",
    "include_flight",
    "flight_price",
    "badges",
    "starting_price",
    "early_bird",
    "last_minute",
    "status",
    "displayed_status",
    "displayed_booked_seat",
    "displayed_badges"
  ];
  for (const key of allowed) {
    if (body[key] !== void 0) insertData[key] = body[key];
  }
  insertData.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  if (bookingUser == null ? void 0 : bookingUser.email) {
    insertData.last_editor = bookingUser.email;
  }
  if (!("booked_seat" in insertData)) insertData.booked_seat = 0;
  if (!("published" in insertData)) insertData.published = false;
  if (!insertData.displayed_status && insertData.status) insertData.displayed_status = insertData.status;
  const { data, error } = await supabase.from("travel_dates").insert([insertData]).select("*").single();
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  await logDateActivity(data.id, bookingUser, "created", insertData);
  return data;
});

export { addDate_post as default };
//# sourceMappingURL=add-date.post.mjs.map
