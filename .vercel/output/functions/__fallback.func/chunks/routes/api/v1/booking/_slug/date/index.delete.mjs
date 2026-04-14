import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, c as createError, s as supabase } from '../../../../../../nitro/nitro.mjs';
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

const index_delete = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  if (isProdEnv) requireBookingUser(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { data: dateRow, error: fetchError } = await supabase.from("travel_dates").select("id").eq("id", dateId).eq("travel_slug", slug).single();
  if (fetchError || !dateRow) {
    throw createError({
      statusCode: 404,
      statusMessage: "Impossible de trouver la r\xE9servation \xE0 supprimer."
    });
  }
  const travel_date_id = dateRow.id;
  const { error: sumError } = await supabase.from("booked_dates").delete().eq("travel_date_id", travel_date_id);
  if (sumError) {
    throw createError({
      statusCode: 500,
      statusMessage: sumError.message
    });
  }
  const { error } = await supabase.from("travel_dates").delete().eq("id", travel_date_id);
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  return { success: true };
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
