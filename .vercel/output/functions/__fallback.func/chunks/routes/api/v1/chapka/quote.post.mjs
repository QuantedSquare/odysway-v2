import { a as defineEventHandler, c as createError, r as readValidatedBody, x as chapka, I as InsuranceSchema } from '../../../../nitro/nitro.mjs';
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

const quote_post = defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      message: "Method Not Allowed"
    });
  }
  const parsedBody = await readValidatedBody(event, (body) => InsuranceSchema.safeParse(body));
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`
    });
  }
  try {
    const result = await chapka.quote(parsedBody.data);
    return {
      ...result
    };
  } catch (err) {
    console.error("Error Chapka quote:", err);
    throw createError({
      statusCode: 500,
      message: "Error Chapka quote"
    });
  }
});

export { quote_post as default };
//# sourceMappingURL=quote.post.mjs.map
