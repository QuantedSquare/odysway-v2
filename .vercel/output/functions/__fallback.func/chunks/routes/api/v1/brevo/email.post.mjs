import { a as defineEventHandler, f as readBody, w as brevo, c as createError } from '../../../../nitro/nitro.mjs';
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

const email_post = defineEventHandler(async (event) => {
  const data = await readBody(event);
  try {
    await brevo.sendContactEmail(data);
    await brevo.sendConfirmationEmail(data);
    return { success: true };
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error sending brevo email",
      err
    });
  }
});

export { email_post as default };
//# sourceMappingURL=email.post.mjs.map
