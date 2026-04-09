import { a as defineEventHandler, u as useRuntimeConfig, t as getBookingUserOrNull, c as createError, f as readBody, s as supabase, b as activecampaign, h as booking, i as departures, v as logDateActivity } from '../../../../../../../nitro/nitro.mjs';
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

const assignDeal_post = defineEventHandler(async (event) => {
  const startTime = Date.now();
  const config = useRuntimeConfig();
  const bookingUser = getBookingUserOrNull(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { dealId, booked_places, is_option, expiracy_date, nbTravelers: bodyNbTravelers, alreadyPaid: bodyAlreadyPaid } = await readBody(event);
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: "dealId requis" });
  }
  const origin = config.public.siteURL;
  const skipAcFetch = typeof bodyNbTravelers === "number" && typeof bodyAlreadyPaid === "number";
  console.log(`[assign-deal] START dealId=${dealId} dateId=${dateId} slug=${slug} skipAcFetch=${skipAcFetch}`);
  const { data: travelDate, error: travelDateError } = await supabase.from("travel_dates").select("id, travel_slug").eq("id", dateId).eq("travel_slug", slug).single();
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  let deal = null;
  let nbTravelers, alreadyPaid;
  if (skipAcFetch) {
    nbTravelers = bodyNbTravelers;
    alreadyPaid = bodyAlreadyPaid;
  } else {
    const acFetchStart = Date.now();
    try {
      const [fetchedDeal, customFields] = await Promise.all([
        activecampaign.getDealById(dealId),
        activecampaign.getDealCustomFields(dealId)
      ]);
      deal = { ...fetchedDeal.deal, ...customFields };
    } catch {
      console.error(`[assign-deal] AC fetch FAILED dealId=${dealId} after ${Date.now() - acFetchStart}ms`);
      throw createError({ statusCode: 502, statusMessage: "Erreur lors de la r\xE9cup\xE9ration du deal AC" });
    }
    if (!deal) throw createError({ statusCode: 404, statusMessage: "Deal introuvable" });
    nbTravelers = +deal.nbTravelers;
    alreadyPaid = +deal.alreadyPaid;
    console.log(`[assign-deal] AC fetch done dealId=${dealId} in ${Date.now() - acFetchStart}ms`);
  }
  if (!nbTravelers) throw createError({ statusCode: 400, statusMessage: "Le deal ne contient pas nbTravelers" });
  const bookedPlaceCount = alreadyPaid > 0 || is_option === true ? booked_places || Number(nbTravelers) : 0;
  const { data: bookedDate, error } = await supabase.from("booked_dates").insert([{
    travel_date_id: dateId,
    deal_id: dealId,
    booked_places: bookedPlaceCount,
    is_option: is_option || null,
    expiracy_date: expiracy_date || null
  }]).select("*").single();
  if (bookedDate) {
    console.log(`[assign-deal] Supabase insert OK bookedId=${bookedDate.id} dealId=${dealId} in ${Date.now() - startTime}ms`);
  }
  const alreadyAssigned = error && error.message.includes("duplicate key value violates unique constraint");
  if (alreadyAssigned) {
    console.warn(`[assign-deal] Duplicate dealId=${dealId} dateId=${dateId}`);
    const { data: existingBookedDate, error: existingError } = await supabase.from("booked_dates").select("deal_id, travel_dates(id, travel_slug)").eq("deal_id", dealId).single();
    if (existingError || !(existingBookedDate == null ? void 0 : existingBookedDate.travel_dates)) {
      throw createError({ statusCode: 409, statusMessage: "Deal d\xE9j\xE0 assign\xE9" });
    }
    throw createError({
      statusCode: 409,
      statusMessage: "Deal d\xE9j\xE0 assign\xE9 \xE0 une autre date",
      data: {
        redirectTo: `/booking-management/${existingBookedDate.travel_dates.travel_slug}/${existingBookedDate.travel_dates.id}`
      }
    });
  } else if (error) {
    console.error(`[assign-deal] Supabase insert FAILED dealId=${dealId}`, error.message);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  const { data: allBooked, error: sumError } = await supabase.from("booked_dates").select("booked_places").eq("travel_date_id", dateId);
  if (sumError) throw createError({ statusCode: 500, statusMessage: sumError.message });
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0);
  const recomputeRes = await booking.updateTravelDate(dateId, totalBooked);
  if (recomputeRes == null ? void 0 : recomputeRes.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error });
  if (bookedPlaceCount > 0 && alreadyPaid > 0 && deal) {
    await departures.handlePaymentForDeparture(bookedDate, deal.title, deal.contact);
  }
  const { data: travel_date, error: slugError } = await supabase.from("travel_dates").select("*").eq("id", dateId).single();
  if (slugError || !travel_date) throw createError({ statusCode: 500, statusMessage: (slugError == null ? void 0 : slugError.message) || "Erreur travel_date" });
  const data_to_update = {
    slug: travel_date.travel_slug,
    linkBms: `${origin}/booking-management/${travel_date.travel_slug}/${dateId}`
  };
  if (is_option) {
    Object.assign(data_to_update, { stage: "27", currentStep: "A pos\xE9 une option" });
  }
  Object.assign(data_to_update, { paiementLink: `${origin}/checkout?type=balance&booked_id=${bookedDate.id}` });
  await activecampaign.updateDeal(dealId, data_to_update);
  await logDateActivity(dateId, bookingUser, "deal_assigned", { deal_id: dealId, booked_places: bookedPlaceCount });
  console.log(`[assign-deal] DONE dealId=${dealId} bookedId=${bookedDate.id} totalTime=${Date.now() - startTime}ms`);
  return bookedDate;
});

export { assignDeal_post as default };
//# sourceMappingURL=assign-deal.post.mjs.map
