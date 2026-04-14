import { a as defineEventHandler, u as useRuntimeConfig, q as requireBookingUser, t as getBookingUserOrNull, h as booking, c as createError, i as departures, v as logDateActivity } from '../../../../../../../../nitro/nitro.mjs';
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

const _bookedId__delete = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const isProdEnv = config.public.environment === "production" && true;
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event);
  const { bookedId } = event.context.params;
  const bookedRow = await booking.retrieveBookedDateById(bookedId);
  if (bookedRow.error || !bookedRow.deal_id) {
    throw createError({ statusCode: 404, statusMessage: "Impossible de trouver la r\xE9servation \xE0 supprimer." });
  }
  console.log("BMS: bookedRow =", bookedRow);
  const travel_date_id = bookedRow.travel_date_id;
  console.log(`BMS: Deleting booked reservation ${bookedId} for travel_date ${travel_date_id}`);
  const deletedBookedId = await booking.deleteBookedDateById(bookedId);
  if (deletedBookedId.error) {
    throw createError({ statusCode: 500, statusMessage: deletedBookedId.error });
  }
  const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id);
  if (allBooked.error) {
    throw createError({ statusCode: 500, statusMessage: allBooked.error });
  }
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0);
  await booking.updateTravelDate(travel_date_id, totalBooked);
  await departures.cleanupDepartureDealIfEmpty(travel_date_id);
  await logDateActivity(travel_date_id, bookingUser, "deal_removed", { deal_id: bookedRow.deal_id, booked_id: bookedId });
  console.log(`BMS: Successfully deleted booked reservation ${bookedId}, updated total booked seats to ${totalBooked}`);
  return { success: true };
});

export { _bookedId__delete as default };
//# sourceMappingURL=_bookedId_.delete.mjs.map
