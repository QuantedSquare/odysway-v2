import { a as defineEventHandler, u as useRuntimeConfig, s as supabase } from '../../../../nitro/nitro.mjs';
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

const travelsByDate_get = defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const { data, error } = await supabase.from("travel_dates").select("travel_slug, booked_seat, displayed_booked_seat, departure_date, return_date, early_bird, last_minute, starting_price, max_travelers, min_travelers, status, displayed_status, displayed_badges").eq("published", true).eq("is_custom_travel", false).gte("departure_date", (/* @__PURE__ */ new Date()).toISOString());
  if (error) {
    return [];
  }
  const parsedDatesByExtra = data.map((date) => ({
    ...date,
    departure_date: new Date(date.departure_date),
    early_bird: xe().isAfter(xe(date.departure_date).add(7, "month")) ? date.early_bird : false,
    last_minute: xe(date.departure_date).diff(xe(), "day") <= 31 ? date.last_minute : false
  }));
  const travelsQuery = `*[_type == "voyage" && (
    !('custom' in availabilityTypes)
  )]{
    _id,
    closingDays,
    "slug": slug.current,
    title,
    image,
    rating,
    comments,
    availabilityTypes,
    "startingPrice": pricing.startingPrice,
    duration,
    destinations[]-> {
      _id,
      title,
      iso,
      interjection,
      "slug": slug.current
    }
  }`;
  const travels = await sanityClient.fetch(travelsQuery);
  const travelWithDates = travels.map((travel) => {
    var _a;
    const dates = parsedDatesByExtra.filter((date) => date.travel_slug === travel.slug);
    return {
      slug: travel.slug,
      title: travel.title,
      image: travel.image,
      rating: travel.rating,
      comments: travel.comments,
      availabilityTypes: travel.availabilityTypes,
      startingPrice: travel.startingPrice,
      iso: ((_a = travel.destinations) == null ? void 0 : _a.map((destination) => destination.iso).filter(Boolean)) || [],
      destinations: travel.destinations || [],
      dates,
      duration: travel.duration,
      closingDays: travel.closingDays,
      voyage_id: travel._id
    };
  });
  return travelWithDates;
});

export { travelsByDate_get as default };
//# sourceMappingURL=travels-by-date.get.mjs.map
