import { a as defineEventHandler, c as createError, r as readValidatedBody, b as activecampaign, D as DealSchema } from '../../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      message: "Method Not Allowed"
    });
  }
  const parsedBody = await readValidatedBody(event, (body) => DealSchema.safeParse(body));
  if (!parsedBody.success) {
    console.error("Deal creation validation error:", parsedBody.error);
    console.log("error on", parsedBody.data);
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`
    });
  }
  try {
    const t0 = Date.now();
    const response = await activecampaign.createDeal(parsedBody.data);
    console.log(`[create-deal] DONE dealId=${response} slug=${parsedBody.data.slug} in ${Date.now() - t0}ms`);
    return response;
  } catch (err) {
    console.error("=======Deal creation error=======", err);
    throw createError({
      statusCode: 500,
      message: "Failed to create deal"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
