import { a as defineEventHandler, f as readBody, b as activecampaign, k as setResponseStatus, c as createError } from '../../../../nitro/nitro.mjs';
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

const abandoned_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (body.type === "checkout.session.expired") {
    try {
      const updatedDeal = {
        deal: {
          fields: [
            { customFieldId: 20, fieldValue: "Abandon du paiement Stripe" }
          ]
        }
      };
      activecampaign.updateDeal(body.data.object.metadata.dealId, updatedDeal);
      setResponseStatus(event, 200);
    } catch (err) {
      console.log("Error abandoned", err);
      throw createError({
        statusCode: 400,
        message: "Error Abandon Stripe",
        err
      });
    }
  }
});

export { abandoned_post as default };
//# sourceMappingURL=abandoned.post.mjs.map
