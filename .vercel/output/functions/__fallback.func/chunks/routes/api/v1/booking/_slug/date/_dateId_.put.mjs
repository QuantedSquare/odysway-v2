import { a as defineEventHandler, c as createError, f as readBody, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, s as supabase, v as logDateActivity, h as booking } from '../../../../../../nitro/nitro.mjs';
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

const _dateId__put = defineEventHandler(async (event) => {
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "slug et dateId requis"
    });
  }
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const updateFields = {};
  const allowed = [
    "published",
    "is_indiv_travel",
    "departure_date",
    "return_date",
    "max_travelers",
    "min_travelers",
    "include_flight",
    "flight_price",
    "badges",
    "starting_price",
    "early_bird",
    "last_minute",
    // Custom display fields
    "displayed_booked_seat",
    "displayed_status"
  ];
  for (const key of allowed) {
    if (body[key] !== void 0) updateFields[key] = body[key];
  }
  if (!Object.keys(updateFields).length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucun champ \xE0 mettre \xE0 jour"
    });
  }
  updateFields.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  if (bookingUser == null ? void 0 : bookingUser.email) {
    updateFields.last_editor = bookingUser.email;
  }
  const { data: current } = await supabase.from("travel_dates").select(allowed.join(",")).eq("id", dateId).eq("travel_slug", slug).single();
  const { data, error } = await supabase.from("travel_dates").update(updateFields).eq("id", dateId).eq("travel_slug", slug).select("*").single();
  if (error || !data) {
    throw createError({
      statusCode: error ? 500 : 404,
      statusMessage: error ? error.message : "Date introuvable"
    });
  }
  if (current) {
    const changes = {};
    for (const key of Object.keys(updateFields)) {
      if (key === "updated_at" || key === "last_editor") continue;
      if (JSON.stringify(current[key]) !== JSON.stringify(updateFields[key])) {
        changes[key] = { old: current[key], new: updateFields[key] };
      }
    }
    if (Object.keys(changes).length) {
      await logDateActivity(dateId, bookingUser, "updated", changes);
    }
  }
  const statusRes = await booking.recomputeStatusOnly(dateId);
  if (statusRes == null ? void 0 : statusRes.error) {
    console.error("Status recompute failed", statusRes.error);
  }
  return data;
});

export { _dateId__put as default };
//# sourceMappingURL=_dateId_.put.mjs.map
