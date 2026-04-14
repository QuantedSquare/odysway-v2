import { a as defineEventHandler, u as useRuntimeConfig, g as getQuery, j as alma, w as brevo, k as setResponseStatus } from '../../../../../nitro/nitro.mjs';
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

const payments_get = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  const isDev = config.public.environment !== "production";
  try {
    const query = getQuery(event);
    const pid = query.pid;
    const payment = await alma.retrievePayment(pid);
    await alma.insertAlmaId(pid);
    await alma.handlePaymentSession(payment);
    console.log("Payment session handled successfully");
    if (!isDev && ((_a = payment.customer) == null ? void 0 : _a.email)) {
      try {
        await brevo.updateContactListId(payment.customer.email, 14);
        console.log("Brevo contact updated successfully");
      } catch (brevoErr) {
        console.error("Failed to update Brevo contact:", brevoErr.message);
      }
    }
    setResponseStatus(event, 200);
  } catch (err) {
    console.error("Alma webhook error:", err);
    setResponseStatus(event, err.statusCode || 500);
    return {
      error: err.statusMessage || "Internal server error",
      paymentId: getQuery(event).pid
    };
  }
});

export { payments_get as default };
//# sourceMappingURL=payments.get.mjs.map
