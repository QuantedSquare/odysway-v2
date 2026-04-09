import { a as defineEventHandler, f as readBody, c as createError, s as supabase, h as booking } from '../../../../../nitro/nitro.mjs';
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

const option_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.id)) {
    throw createError({ statusCode: 400, statusMessage: "id requis" });
  }
  if (body.booked_places === void 0 || body.booked_places === null) {
    throw createError({ statusCode: 400, statusMessage: "booked_places requis" });
  }
  const { data: bookedDate, error: bookedDateError } = await supabase.from("booked_dates").select("is_option, travel_date_id").eq("id", body.id).single();
  if (bookedDateError || !bookedDate) {
    throw createError({ statusCode: 404, statusMessage: (bookedDateError == null ? void 0 : bookedDateError.message) || "R\xE9servation introuvable" });
  }
  if (bookedDate.is_option) {
    throw createError({ statusCode: 409, statusMessage: "La date est d\xE9j\xE0 r\xE9serv\xE9e" });
  } else {
    const { data, error } = await supabase.from("booked_dates").update({ is_option: true, expiracy_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3), booked_places: body.booked_places }).eq("id", body.id).select("*").single();
    const { data: allBooked, error: sumError } = await supabase.from("booked_dates").select("booked_places").eq("travel_date_id", bookedDate.travel_date_id);
    if (sumError) throw createError({ statusCode: 500, statusMessage: sumError.message });
    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0);
    const recomputeRes = await booking.updateTravelDate(bookedDate.travel_date_id, totalBooked);
    if (recomputeRes == null ? void 0 : recomputeRes.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error });
    if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    return data;
  }
});

export { option_post as default };
//# sourceMappingURL=option.post.mjs.map
