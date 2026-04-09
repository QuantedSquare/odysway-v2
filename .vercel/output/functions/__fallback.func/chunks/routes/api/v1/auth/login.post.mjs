import { a as defineEventHandler, u as useRuntimeConfig, f as readBody, o as setCookie } from '../../../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
import 'axios';
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

const login_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isDev = config.public.environment !== "production";
  const body = await readBody(event);
  const { id, password } = body || {};
  const validId = process.env.BOOKINGID;
  const validPassword = process.env.BOOKINGPASSWORD;
  const jwtSecret = process.env.BOOKING_JWT_SECRET;
  if (id === validId && password === validPassword) {
    const token = jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
    setCookie(event, "booking_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      // 7 days
      secure: isDev
    });
    return { success: true };
  } else {
    return {
      statusCode: 401,
      message: "Identifiant ou mot de passe incorrect."
    };
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
