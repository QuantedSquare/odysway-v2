import { a as defineEventHandler, u as useRuntimeConfig, g as getQuery, s as supabase } from '../../../../nitro/nitro.mjs';
import xe from 'dayjs';
import { createClient } from '@sanity/client';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import 'axios';
import 'jsonwebtoken';
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

const travelDates_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { slugs } = getQuery(event);
  const slugList = typeof slugs === "string" ? slugs.split(",").map((s) => s.trim()).filter(Boolean) : [];
  if (!slugList.length) {
    return [];
  }
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const sanityVoyages = await sanityClient.fetch(
    '*[_type == "voyage" && slug.current in $slugs]{ _id, "slug": slug.current, closingDays }',
    { slugs: slugList }
  );
  if (!(sanityVoyages == null ? void 0 : sanityVoyages.length)) return [];
  const metaBySlug = sanityVoyages.reduce((acc, v) => {
    if (!(v == null ? void 0 : v.slug)) return acc;
    acc[v.slug] = {
      voyage_id: v._id,
      // Sanity schema initialValue is 30; keep a safe fallback for older docs.
      closingDays: Number.isFinite(Number(v.closingDays)) ? Number(v.closingDays) : 30
    };
    return acc;
  }, {});
  const now = xe();
  const toPostgrestTimestamp = (date) => new Date(date).toISOString().replace(/\.\d{3}Z$/, "Z");
  const orFilters = sanityVoyages.filter((v) => v == null ? void 0 : v.slug).map((v) => {
    var _a, _b;
    const closingDays = (_b = (_a = metaBySlug[v.slug]) == null ? void 0 : _a.closingDays) != null ? _b : 30;
    const threshold = toPostgrestTimestamp(now.add(closingDays, "day").toDate());
    return `and(travel_slug.eq.${JSON.stringify(v.slug)},departure_date.gte.${JSON.stringify(threshold)})`;
  }).join(",");
  const { data, error } = await supabase.from("travel_dates").select("travel_slug, booked_seat, displayed_booked_seat, departure_date, return_date, early_bird, last_minute, starting_price, max_travelers, min_travelers, status, displayed_status, displayed_badges").or(orFilters).eq("published", true).eq("is_custom_travel", false).gte("departure_date", (/* @__PURE__ */ new Date()).toISOString());
  if (error) {
    console.error("travel-dates supabase error", error);
    return [];
  }
  return data.map((date) => {
    var _a, _b, _c, _d, _e;
    return {
      ...date,
      voyage_id: (_a = metaBySlug[date.travel_slug]) == null ? void 0 : _a.voyage_id,
      closingDays: (_c = (_b = metaBySlug[date.travel_slug]) == null ? void 0 : _b.closingDays) != null ? _c : 30,
      closing_date: xe(date.departure_date).subtract((_e = (_d = metaBySlug[date.travel_slug]) == null ? void 0 : _d.closingDays) != null ? _e : 30, "day").toDate(),
      departure_date: new Date(date.departure_date),
      early_bird: xe().isAfter(xe(date.departure_date).add(7, "month")) ? date.early_bird : false,
      last_minute: xe(date.departure_date).diff(xe(), "day") <= 31 ? date.last_minute : false
    };
  });
});

export { travelDates_get as default };
//# sourceMappingURL=travel-dates.get.mjs.map
