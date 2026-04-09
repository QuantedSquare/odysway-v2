import { a as defineEventHandler, c as createError, r as readValidatedBody, b as activecampaign, e as clientSchema } from '../../../../nitro/nitro.mjs';
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
  const parsedBody = await readValidatedBody(event, (body) => clientSchema.safeParse(body));
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`
    });
  }
  try {
    const response = await activecampaign.upsertContact(parsedBody.data);
    return response;
  } catch (err) {
    console.error("Contact upsert error:", err);
    throw createError({
      statusCode: 500,
      message: err instanceof Error ? err.message : "Failed to upsert contact"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
