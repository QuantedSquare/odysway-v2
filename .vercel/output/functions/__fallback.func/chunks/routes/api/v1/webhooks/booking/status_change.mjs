import { a as defineEventHandler, A as getHeader, c as createError, f as readBody, s as supabase } from '../../../../../nitro/nitro.mjs';
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

function computeStatus({ booked_seat, min_travelers, max_travelers }) {
  const booked = Number(booked_seat || 0);
  const min = Number(min_travelers || 0);
  const max = Number(max_travelers || 0);
  if (max > 0 && booked >= max) return "guaranteed";
  if (min > 0 && booked >= min) return "confirmed";
  return "soon_confirmed";
}
function extractRecord(body) {
  var _a, _b;
  return (body == null ? void 0 : body.record) || (body == null ? void 0 : body.new) || ((_a = body == null ? void 0 : body.data) == null ? void 0 : _a.record) || ((_b = body == null ? void 0 : body.data) == null ? void 0 : _b.new) || null;
}
const DEBOUNCE_MS = 1e4;
let lastRunAt = 0;
const status_change = defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = getHeader(event, "x-cron-secret");
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const now = Date.now();
  if (now - lastRunAt < DEBOUNCE_MS) {
    return { success: true, skipped: true, reason: "debounced" };
  }
  lastRunAt = now;
  const body = await readBody(event);
  const record = extractRecord(body);
  const PAGE_SIZE = 1e3;
  let from = 0;
  let totalScanned = 0;
  let totalUpdated = 0;
  while (true) {
    const { data: rows, error: fetchError } = await supabase.from("travel_dates").select("id, booked_seat, min_travelers, max_travelers, status").range(from, from + PAGE_SIZE - 1);
    if (fetchError) {
      throw createError({ statusCode: 500, statusMessage: fetchError.message });
    }
    if (!rows || rows.length === 0) break;
    totalScanned += rows.length;
    const updates = [];
    for (const row of rows) {
      const nextStatus = computeStatus(row);
      if (row.status !== nextStatus) {
        updates.push({ id: row.id, status: nextStatus });
      }
    }
    if (updates.length) {
      const CHUNK = 500;
      for (let i = 0; i < updates.length; i += CHUNK) {
        const slice = updates.slice(i, i + CHUNK);
        const { error: upsertError, data: upserted } = await supabase.from("travel_dates").upsert(slice, { onConflict: "id" }).select("id");
        if (upsertError) {
          throw createError({ statusCode: 500, statusMessage: upsertError.message });
        }
        totalUpdated += (upserted == null ? void 0 : upserted.length) || slice.length;
      }
    }
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return {
    success: true,
    updated: totalUpdated,
    scanned: totalScanned,
    trigger: (record == null ? void 0 : record.id) ? { id: record.id } : null
  };
});

export { status_change as default };
//# sourceMappingURL=status_change.mjs.map
