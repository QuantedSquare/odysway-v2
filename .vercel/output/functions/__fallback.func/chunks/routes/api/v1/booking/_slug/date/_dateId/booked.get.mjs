import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, c as createError, s as supabase, b as activecampaign, h as booking } from '../../../../../../../nitro/nitro.mjs';
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

const booked_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  if (isProdEnv) requireBookingUser(event);
  const { dateId, slug } = event.context.params;
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: "slug et dateId requis" });
  }
  const { data: travelDate, error: travelDateError } = await supabase.from("travel_dates").select("id").eq("id", dateId).eq("travel_slug", slug).single();
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: "Date introuvable" });
  }
  const { data, error } = await supabase.from("booked_dates").select("*").eq("travel_date_id", dateId);
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  const travelers = await Promise.all((data || []).map(async (row) => {
    let contact = {};
    let customFields = {};
    try {
      const deal = await activecampaign.getDealById(row.deal_id);
      customFields = await activecampaign.getDealCustomFields(row.deal_id);
      customFields.price = deal.deal.value;
      if (deal && deal.deal && deal.deal.contact) {
        const contactId = deal.deal.contact;
        let contactData = null;
        contactData = await activecampaign.getClientById(contactId);
        if (contactData && contactData.contact) {
          contact = {
            name: (contactData.contact.firstName || "") + " " + (contactData.contact.lastName || ""),
            email: contactData.contact.email || ""
          };
        } else {
          contact = {
            name: deal.deal.contact.fullName || "",
            email: deal.deal.contact.email || ""
          };
        }
      }
    } catch {
      contact = { name: "", email: "" };
    }
    return {
      ...row,
      ...contact,
      nbTravelers: customFields.nbTravelers,
      alreadyPaid: customFields.alreadyPaid,
      restToPay: customFields.restToPay,
      price: +customFields.price
    };
  }));
  const validTravelers = [];
  const travelersToDelete = [];
  for (const traveler of travelers) {
    if (traveler.email && traveler.email.trim() !== "") {
      validTravelers.push(traveler);
    } else {
      travelersToDelete.push(traveler.id);
    }
  }
  if (travelersToDelete.length > 0) {
    const { error: deleteError } = await supabase.from("booked_dates").delete().in("id", travelersToDelete);
    if (deleteError) {
      console.error("Error deleting booked_dates entries:", deleteError);
    } else {
      console.log(`Deleted ${travelersToDelete.length} booked_dates entries without valid email`);
    }
    await booking.recomputeBookedSeatAndStatus(dateId);
  }
  return validTravelers;
});

export { booked_get as default };
//# sourceMappingURL=booked.get.mjs.map
