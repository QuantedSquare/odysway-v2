import { a as defineEventHandler, l as getCookie, u as useRuntimeConfig, m as isAllowedEmail, n as getSuperadmins, o as setCookie } from '../../../../nitro/nitro.mjs';
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

const check_get = defineEventHandler((event) => {
  const token = getCookie(event, "booking_token");
  const jwtSecret = process.env.BOOKING_JWT_SECRET;
  if (!token || !jwtSecret) {
    return { statusCode: 401, message: "Non authentifi\xE9." };
  }
  try {
    const config = useRuntimeConfig();
    const isDev = config.public.environment !== "production";
    const payload = jwt.verify(token, jwtSecret);
    const email = payload == null ? void 0 : payload.email;
    if (!isAllowedEmail(email)) {
      return { statusCode: 401, message: "Non authentifi\xE9." };
    }
    const superadmins = getSuperadmins();
    const role = (payload == null ? void 0 : payload.role) || (superadmins.includes(email.toLowerCase()) ? "superadmin" : "user");
    const refreshedPayload = {
      sub: payload == null ? void 0 : payload.sub,
      email,
      name: payload == null ? void 0 : payload.name,
      picture: payload == null ? void 0 : payload.picture,
      role
    };
    const refreshedToken = jwt.sign(refreshedPayload, jwtSecret, { expiresIn: "7d" });
    setCookie(event, "booking_token", refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: isDev
    });
    return {
      success: true,
      refreshed: true,
      user: refreshedPayload
    };
  } catch {
    return { statusCode: 401, message: "Non authentifi\xE9." };
  }
});

export { check_get as default };
//# sourceMappingURL=check.get.mjs.map
