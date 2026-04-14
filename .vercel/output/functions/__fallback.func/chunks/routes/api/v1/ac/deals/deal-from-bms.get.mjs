import { a as defineEventHandler, g as getQuery, s as supabase, c as createError, b as activecampaign } from '../../../../../nitro/nitro.mjs';
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

const dealFromBms_get = defineEventHandler(async (event) => {
  var _a;
  const { bookedId } = getQuery(event);
  const { data, error } = await supabase.from("booked_dates").select("deal_id").eq("id", bookedId).single();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting deal from booked_dates"
    });
  }
  try {
    await activecampaign.recalculatTotalValues(data.deal_id);
    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(data.deal_id),
      activecampaign.getDealCustomFields(data.deal_id)
    ]);
    const fullContact = await activecampaign.getClientById(fetchedDeal.deal.contact);
    const contact = fullContact.contact;
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
        phone: contact.phone,
        isoContact: ((_a = fullContact.fieldValues.find((i) => i.field === "22")) == null ? void 0 : _a.value) || ""
      }
    };
  } catch (err) {
    console.log("Error getting deal from booked_dates", err);
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting deal from booked_dates"
    });
  }
});

export { dealFromBms_get as default };
//# sourceMappingURL=deal-from-bms.get.mjs.map
