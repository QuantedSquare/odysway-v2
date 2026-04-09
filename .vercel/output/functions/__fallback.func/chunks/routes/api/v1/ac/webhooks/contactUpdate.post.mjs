import { a as defineEventHandler, g as getQuery, f as readBody, c as createError, b as activecampaign } from '../../../../../nitro/nitro.mjs';
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

const contactUpdate_post = defineEventHandler(async (event) => {
  const { token } = getQuery(event);
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: "Unauthorized" };
  }
  try {
    const body = await readBody(event);
    console.log("Contact update BODY webhook received", body, "event", event);
    const contactId = body["contact[id]"];
    if (!body || !contactId) {
      throw createError({
        statusCode: 400,
        message: "Invalid contact data"
      });
    }
    const result = await activecampaign.upsertContactIntoSupabase(contactId);
    console.log("Contact upserted successfully:", result);
    return { success: true };
  } catch (err) {
    console.error("Contact update webhook error:", err);
    throw createError({
      statusCode: 500,
      message: "Unexpected error in contact update process"
    });
  }
});

export { contactUpdate_post as default };
//# sourceMappingURL=contactUpdate.post.mjs.map
