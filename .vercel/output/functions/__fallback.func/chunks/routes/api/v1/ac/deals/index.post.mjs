import { a as defineEventHandler, c as createError, r as readValidatedBody, b as activecampaign, U as UpdateDealSchema } from '../../../../../nitro/nitro.mjs';
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
  var _a;
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      message: "Method Not Allowed"
    });
  }
  const dealId = (_a = event.context.params) == null ? void 0 : _a.dealId;
  if (!dealId) {
    throw createError({
      statusCode: 400,
      message: "Deal ID is required"
    });
  }
  if (!Number.isInteger(+dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Deal ID should be an integer"
    });
  }
  const parsedBody = await readValidatedBody(event, (body) => UpdateDealSchema.safeParse(body));
  console.log("===========Parsed body ============:", parsedBody);
  if (!parsedBody.success) {
    console.error("Validation failed:", parsedBody.error);
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`
    });
  }
  try {
    console.log("===========Updating deal after parsing ============:", dealId, parsedBody.data);
    const response = await activecampaign.updateDeal(dealId, parsedBody.data);
    return response;
  } catch (err) {
    console.error("Deal updating error:", err);
    throw createError({
      statusCode: 500,
      message: "Failed to update deal"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
