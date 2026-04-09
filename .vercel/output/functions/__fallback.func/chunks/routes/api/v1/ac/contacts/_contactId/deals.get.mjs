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

const deals_get = defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.contactId);
  console.log("id:", id);
  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      message: "Contact ID must be an integer"
    });
  }
  try {
    const response = await activecampaign.getAllDeal(id);
    console.log("Deals:", response);
    if (!response || response.deals.length === 0) {
      throw createError({
        statusCode: 404,
        message: "No deals found for this contact"
      });
    }
    return response.deals;
  } catch (err) {
    console.error(`Error fetching deals for contact ${id}:`, err);
    throw createError({
      statusCode: 500,
      message: "Failed to retrieve deals"
    });
  }
});

export { deals_get as default };
//# sourceMappingURL=deals.get.mjs.map
