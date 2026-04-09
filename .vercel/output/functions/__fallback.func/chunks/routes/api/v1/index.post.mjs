import { a as defineEventHandler, g as getQuery, s as supabase, c as createError, f as readBody, j as alma, b as activecampaign, k as setResponseStatus } from '../../../nitro/nitro.mjs';
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
  const { bookedId } = getQuery(event);
  console.log("bookedId:", bookedId);
  const { data, error } = await supabase.from("booked_dates").select("deal_id").eq("id", bookedId).single();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting deal from booked_dates"
    });
  }
  const deal_id = data.deal_id;
  const body = await readBody(event);
  Object.assign(body, { dealId: deal_id, booked_id: bookedId });
  console.log("========ALMA REQUEST BODY=======", body);
  if (!body.dealId) {
    throw createError({
      statusCode: 400,
      statusMessage: "dealId is required"
    });
  }
  try {
    const almaSession = await alma.createAlmaSession(body);
    console.log("========ALMA SESSION=======", almaSession);
    console.log("========UPDATE THE DEAL=======");
    await activecampaign.updateDeal(body.dealId, { currentStep: "Passage sur la page de paiement Alma" });
    setResponseStatus(event, 200);
    return almaSession;
  } catch (err) {
    console.log("Error creating alma session", err);
    throw createError({
      statusCode: 400,
      statusMessage: "Error creating alma session",
      data: { details: err.message }
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
