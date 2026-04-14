import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, c as createError, s as supabase } from '../../../../../../../../../nitro/nitro.mjs';
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

const download_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  if (isProdEnv) requireBookingUser(event);
  const { dateId, slug, attachmentId } = event.context.params;
  if (!dateId || !slug || !attachmentId) {
    throw createError({ statusCode: 400, statusMessage: "slug, dateId et attachmentId requis" });
  }
  const { data: attachment, error: fetchError } = await supabase.from("date_attachments").select("storage_path, file_name").eq("id", attachmentId).eq("travel_date_id", dateId).single();
  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: "Fichier introuvable" });
  }
  const { data: signedUrl, error: signedUrlError } = await supabase.storage.from("date-attachments").createSignedUrl(attachment.storage_path, 60);
  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message });
  }
  return { url: signedUrl.signedUrl, fileName: attachment.file_name };
});

export { download_get as default };
//# sourceMappingURL=download.get.mjs.map
