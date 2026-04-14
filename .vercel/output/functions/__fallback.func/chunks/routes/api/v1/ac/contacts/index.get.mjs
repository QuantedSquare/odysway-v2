import { a as defineEventHandler, c as createError, b as activecampaign } from '../../../../../nitro/nitro.mjs';
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
  const id = parseInt(event.context.params.contactId);
  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Contact ID should be an integer"
    });
  }
  try {
    const reponse = await activecampaign.getClientById(id);
    return reponse.contact;
  } catch (err) {
    console.log("Error getting client", err);
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting client",
      err
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
