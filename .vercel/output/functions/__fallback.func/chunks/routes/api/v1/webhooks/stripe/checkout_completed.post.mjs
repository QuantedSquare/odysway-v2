import { a as defineEventHandler, C as readRawBody, A as getHeader, c as createError, E as stripeCLI, s as supabase, z as stripe, k as setResponseStatus } from '../../../../../nitro/nitro.mjs';
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

const checkout_completed_post = defineEventHandler(async (event) => {
  const body = await readRawBody(event, "utf8");
  console.log("Body from webhook in checkout_completed.post.js", body);
  const stripeSignature = getHeader(event, "stripe-signature");
  console.log("stripeSignature in checkout_completed.post.js", stripeSignature);
  if (!stripeSignature) {
    throw createError({
      statusCode: 400,
      message: "Unauthorized"
    });
  }
  let stripeEvent;
  try {
    stripeEvent = stripeCLI.webhooks.constructEvent(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SIGNATURE
    );
    console.log("=======stripeEvent=========", stripeEvent);
  } catch (err) {
    console.log("Error stripeEvent", err);
    throw createError({
      statusCode: 400,
      message: "Error verifying webhook signature"
    });
  }
  if (stripeEvent.type === "checkout.session.completed" && stripeEvent.data.object.payment_status === "paid") {
    const { error: insertError } = await supabase.from("stripe_processed_events").insert({ id: stripeEvent.id });
    if (insertError) {
      console.log("Duplicate webhook event, skipping:", stripeEvent.id);
      return;
    }
    try {
      console.log("--------------GOING INTO HANDLE PAYMENT SESSION--------------");
      await stripe.handlePaymentSession(stripeEvent.data.object, "CB");
    } catch (err) {
      console.error("Error processing payment for event", stripeEvent.id, err);
      await $fetch(process.env.SLACK_URL_PAIEMENTS, {
        method: "post",
        body: {
          blocks: [{
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:fire: *Webhook CB payment processing failed* \u2014 event \`${stripeEvent.id}\`
${(err == null ? void 0 : err.message) || err}`
            }
          }]
        }
      }).catch(() => {
      });
    }
  }
  setResponseStatus(event, 200);
});

export { checkout_completed_post as default };
//# sourceMappingURL=checkout_completed.post.mjs.map
