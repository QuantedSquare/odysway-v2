import { a as defineEventHandler, g as getQuery, s as supabase, b as activecampaign } from '../../../../nitro/nitro.mjs';
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

const bookingExists = defineEventHandler(async (event) => {
  const { booked_id } = getQuery(event);
  const { data: bookedDate, error: supabaseError } = await supabase.from("booked_dates").select("deal_id").eq("id", booked_id).single();
  if (supabaseError || !bookedDate) {
    return false;
  }
  try {
    const { deal } = await activecampaign.getDealById(bookedDate.deal_id);
    return !!deal;
  } catch {
    return false;
  }
});

export { bookingExists as default };
//# sourceMappingURL=booking-exists.mjs.map
