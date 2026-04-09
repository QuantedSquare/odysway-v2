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
  const dealId = parseInt(event.context.params.dealId);
  if (!Number.isInteger(dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Deal ID should be an integer"
    });
  }
  try {
    await activecampaign.recalculatTotalValues(dealId);
    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(dealId),
      activecampaign.getDealCustomFields(dealId)
    ]);
    const { contact } = await activecampaign.getClientById(fetchedDeal.deal.contact);
    if (!fetchedDeal.deal || !customFields) {
      throw createError({
        statusCode: 404,
        message: "Deal not found"
      });
    }
    return {
      ...fetchedDeal.deal,
      ...customFields,
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone
      }
    };
  } catch (err) {
    console.log("Error getting one deal", err, dealId);
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting one deal",
      err
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
