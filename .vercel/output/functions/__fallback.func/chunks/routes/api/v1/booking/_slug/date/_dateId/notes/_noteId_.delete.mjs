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

const _noteId__delete = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { dateId, slug, noteId } = event.context.params;
  if (!dateId || !slug || !noteId) {
    throw createError({ statusCode: 400, statusMessage: "slug, dateId et noteId requis" });
  }
  const { data: note, error: noteError } = await supabase.from("date_notes").select("*").eq("id", noteId).eq("travel_date_id", dateId).single();
  if (noteError || !note) {
    throw createError({ statusCode: 404, statusMessage: "Note introuvable" });
  }
  if ((bookingUser == null ? void 0 : bookingUser.email) !== note.author_email && (bookingUser == null ? void 0 : bookingUser.role) !== "superadmin") {
    throw createError({ statusCode: 403, statusMessage: "Non autoris\xE9 \xE0 supprimer cette note" });
  }
  const { error } = await supabase.from("date_notes").delete().eq("id", noteId);
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return { success: true };
});

export { _noteId__delete as default };
//# sourceMappingURL=_noteId_.delete.mjs.map
