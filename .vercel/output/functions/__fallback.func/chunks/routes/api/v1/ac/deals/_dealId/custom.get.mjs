import { a as defineEventHandler, c as createError, b as activecampaign } from '../../../../../../nitro/nitro.mjs';
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

const custom_get = defineEventHandler(async (event) => {
  const dealId = parseInt(event.context.params.dealId);
  if (!Number.isInteger(dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Deal ID should be an integer"
    });
  }
  try {
    const customFields = await activecampaign.getDealCustomFields(dealId);
    return customFields;
  } catch (err) {
    console.log("Error getting customFields", err, dealId);
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting customFields",
      err
    });
  }
});

export { custom_get as default };
//# sourceMappingURL=custom.get.mjs.map
