import { a as defineEventHandler, C as readRawBody, A as getHeader, c as createError, E as stripeCLI, s as supabase, k as setResponseStatus, z as stripe } from '../../../../../nitro/nitro.mjs';
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

const transfer_completed = defineEventHandler(async (event) => {
  var _a;
  const body = await readRawBody(event, false);
  console.log("Body from webhook in transfer_completed.js", body);
  const stripeSignature = getHeader(event, "stripe-signature");
  console.log("stripeSignature in transfer_completed.js", stripeSignature);
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
      process.env.STRIPE_WEBHOOK_TRANSFER_SIGNATURE
    );
    console.log("=======stripeEvent=========", stripeEvent);
  } catch (err) {
    console.log("Error stripeEvent", err);
    throw createError({
      statusCode: 400,
      message: "Error stripeEvent in transfer_completed.js"
    });
  }
  if (stripeEvent.type === "payment_intent.succeeded") {
    const paymentIntent = stripeEvent.data.object;
    const latestCharge = paymentIntent.latest_charge ? await stripeCLI.charges.retrieve(paymentIntent.latest_charge) : null;
    const paymentMethodType = (_a = latestCharge == null ? void 0 : latestCharge.payment_method_details) == null ? void 0 : _a.type;
    if (paymentMethodType !== "customer_balance") {
      console.log("Payment type is not a bank transfer, skipping");
    } else {
      const { error: insertError } = await supabase.from("stripe_processed_events").insert({ id: stripeEvent.id });
      if (insertError) {
        console.log("Duplicate webhook event, skipping:", stripeEvent.id);
        setResponseStatus(event, 200);
        return;
      }
      console.log("========== payment type is a bank transfer =========");
      try {
        await stripe.handlePaymentSession(paymentIntent, "Virement");
      } catch (err) {
        console.error("Error processing bank transfer for event", stripeEvent.id, err);
        await $fetch(process.env.SLACK_URL_PAIEMENTS, {
          method: "post",
          body: {
            blocks: [{
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:fire: *Webhook Virement payment processing failed* \u2014 event \`${stripeEvent.id}\`
${(err == null ? void 0 : err.message) || err}`
              }
            }]
          }
        }).catch(() => {
        });
      }
    }
  }
  setResponseStatus(event, 200);
});

export { transfer_completed as default };
//# sourceMappingURL=transfer_completed.mjs.map
