import { a as defineEventHandler, c as createError, s as supabase } from '../../../../../nitro/nitro.mjs';
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

const _dateId__get = defineEventHandler(async (event) => {
  const { dateId } = event.context.params;
  if (!dateId) {
    throw createError({
      statusCode: 400,
      statusMessage: "dateId requis"
    });
  }
  const { data, error } = await supabase.from("travel_dates").select("*").eq("id", dateId).single();
  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Date introuvable"
    });
  }
  return data;
});

export { _dateId__get as default };
//# sourceMappingURL=_dateId_.get.mjs.map
