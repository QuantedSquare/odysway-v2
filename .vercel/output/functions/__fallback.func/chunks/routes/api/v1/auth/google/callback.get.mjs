import { a as defineEventHandler, u as useRuntimeConfig, g as getQuery, l as getCookie, o as setCookie, m as isAllowedEmail, n as getSuperadmins, p as sendRedirect } from '../../../../../nitro/nitro.mjs';
import { jwtVerify, createRemoteJWKSet } from 'jose';
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

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const callback_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isDev = config.public.environment !== "production";
  const query = getQuery(event);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const jwtSecret = process.env.BOOKING_JWT_SECRET;
  const redirectWithError = (code2) => sendRedirect(event, `/booking-login?error=${code2}`);
  if (!clientId || !clientSecret || !redirectUri || !jwtSecret) {
    return redirectWithError("server_config");
  }
  const stateFromCookie = getCookie(event, "booking_oauth_state");
  const stateFromQuery = typeof query.state === "string" ? query.state : "";
  setCookie(event, "booking_oauth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: isDev
  });
  if (!stateFromCookie || stateFromCookie !== stateFromQuery) {
    return redirectWithError("state");
  }
  if (query.error) {
    return redirectWithError("access_denied");
  }
  const code = typeof query.code === "string" ? query.code : "";
  if (!code) {
    return redirectWithError("missing_code");
  }
  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!tokenResponse.ok) {
      return redirectWithError("token_exchange");
    }
    const tokenJson = await tokenResponse.json();
    const idToken = tokenJson.id_token;
    if (!idToken) {
      return redirectWithError("missing_token");
    }
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId
    });
    const email = payload.email;
    const emailVerified = payload.email_verified;
    if (!emailVerified || !isAllowedEmail(email)) {
      return redirectWithError("unauthorized");
    }
    const superadmins = getSuperadmins();
    const role = superadmins.includes(email.toLowerCase()) ? "superadmin" : "user";
    const sessionPayload = {
      sub: payload.sub,
      email,
      name: payload.name,
      picture: payload.picture,
      role
    };
    const sessionToken = jwt.sign(sessionPayload, jwtSecret, { expiresIn: "7d" });
    setCookie(event, "booking_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: isDev
    });
    return sendRedirect(event, "/booking-management");
  } catch (err) {
    console.error("Google OAuth error", err);
    return redirectWithError("verification");
  }
});

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map
