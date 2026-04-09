import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, c as createError, s as supabase } from '../../../../../../../../nitro/nitro.mjs';
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

const _attachmentId__delete = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { dateId, slug, attachmentId } = event.context.params;
  if (!dateId || !slug || !attachmentId) {
    throw createError({ statusCode: 400, statusMessage: "slug, dateId et attachmentId requis" });
  }
  const { data: attachment, error: fetchError } = await supabase.from("date_attachments").select("*").eq("id", attachmentId).eq("travel_date_id", dateId).single();
  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: "Fichier introuvable" });
  }
  if ((bookingUser == null ? void 0 : bookingUser.email) !== attachment.uploaded_by && (bookingUser == null ? void 0 : bookingUser.role) !== "superadmin") {
    throw createError({ statusCode: 403, statusMessage: "Non autoris\xE9 \xE0 supprimer ce fichier" });
  }
  const { error: storageError } = await supabase.storage.from("date-attachments").remove([attachment.storage_path]);
  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
  }
  const { error: deleteError } = await supabase.from("date_attachments").delete().eq("id", attachmentId);
  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message });
  }
  return { success: true };
});

export { _attachmentId__delete as default };
//# sourceMappingURL=_attachmentId_.delete.mjs.map
