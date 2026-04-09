import { a as defineEventHandler, c as createError, g as getQuery, b as activecampaign } from '../../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      message: "Method Not Allowed"
    });
  }
  const { email } = getQuery(event);
  if (!email) {
    throw createError({
      statusCode: 400,
      message: "Email is required"
    });
  }
  try {
    const client = await activecampaign.getClientByEmail(email);
    if (!client.contacts || client.contacts.length === 0) {
      throw createError({
        statusCode: 404,
        message: "No client found"
      });
    }
    return client.contacts[0];
  } catch (err) {
    console.error("Error getting client:", err);
    throw createError({
      statusCode: 500,
      message: "Failed to retrieve client"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
