import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, c as createError, f as readBody, s as supabase } from '../../../../../../../../nitro/nitro.mjs';
import nodeCrypto from 'node:crypto';
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

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const uploadUrl_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { fileName, fileSize, mimeType } = await readBody(event);
  if (!fileName || !fileSize || !mimeType) {
    throw createError({ statusCode: 400, statusMessage: "fileName, fileSize et mimeType requis" });
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: "Type de fichier non autoris\xE9" });
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "Fichier trop volumineux (max 10 Mo)" });
  }
  const { data: travelDate, error: travelDateError } = await supabase.from("travel_dates").select("id").eq("id", dateId).eq("travel_slug", slug).single();
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${dateId}/${nodeCrypto.randomUUID()}-${sanitizedName}`;
  const { data: signedUrl, error: signedUrlError } = await supabase.storage.from("date-attachments").createSignedUploadUrl(storagePath);
  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message });
  }
  const { data: attachment, error: insertError } = await supabase.from("date_attachments").insert([{
    travel_date_id: dateId,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    storage_path: storagePath,
    uploaded_by: (bookingUser == null ? void 0 : bookingUser.email) || "unknown"
  }]).select("*").single();
  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }
  return {
    uploadUrl: signedUrl.signedUrl,
    token: signedUrl.token,
    attachment
  };
});

export { uploadUrl_post as default };
//# sourceMappingURL=upload-url.post.mjs.map
