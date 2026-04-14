import { a as defineEventHandler, u as useRuntimeConfig, o as setCookie, p as sendRedirect } from '../../../../../nitro/nitro.mjs';
import { randomUUID } from 'node:crypto';
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
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const login_get = defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const isDev = config.public.environment !== "production";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = config.public.environment !== "production" ? "http://localhost:3000/api/v1/auth/google/callback" : process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return {
      statusCode: 500,
      message: "Google OAuth is not configured."
    };
  }
  const state = randomUUID();
  setCookie(event, "booking_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    // 10 minutes
    secure: isDev
  });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    include_granted_scopes: "true",
    state,
    prompt: "select_account"
  });
  return sendRedirect(event, `${GOOGLE_AUTH_URL}?${params.toString()}`);
});

export { login_get as default };
//# sourceMappingURL=login.get.mjs.map
