import { a as defineEventHandler, A as getHeader, c as createError, s as supabase, b as activecampaign, h as booking } from '../../../../../nitro/nitro.mjs';
import axios from 'axios';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
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

const cronjob = defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = getHeader(event, "x-cron-secret");
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  console.log("Cronjob started");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase.from("booked_dates").select("*").eq("is_option", true).lt("expiracy_date", today.toISOString());
  if (error) {
    console.error(error);
    return;
  }
  if (data && data.length > 0) {
    for (const row of data) {
      let customFields = null;
      let deal = null;
      let contact = null;
      if (row.deal_id) {
        try {
          customFields = await activecampaign.getDealCustomFields(row.deal_id);
          const dealRes = await activecampaign.getDealById(row.deal_id);
          deal = dealRes == null ? void 0 : dealRes.deal;
          if (deal == null ? void 0 : deal.contact) {
            const contactRes = await activecampaign.getClientById(deal.contact);
            contact = contactRes == null ? void 0 : contactRes.contact;
          }
        } catch (err) {
          console.error("Error fetching ActiveCampaign data for expired option", row.deal_id, err);
          continue;
        }
        const alreadyPaid = Number((customFields == null ? void 0 : customFields.alreadyPaid) || 0);
        if (alreadyPaid > 0) {
          const bookedPlaces = Number(+(customFields == null ? void 0 : customFields.nbTravelers) || +row.booked_places || 0);
          const { error: updateBookedError } = await supabase.from("booked_dates").update({ is_option: false, expiracy_date: null, booked_places: bookedPlaces }).eq("id", row.id);
          if (updateBookedError) {
            console.error("Error removing option on booked_date", row.id, updateBookedError);
            continue;
          }
          const recompute2 = await booking.recomputeBookedSeatAndStatus(row.travel_date_id);
          if (recompute2 == null ? void 0 : recompute2.error) {
            console.error("Error recomputing travel_date", row.travel_date_id, recompute2.error);
          }
          continue;
        }
      }
      const { error: updateError } = await supabase.from("booked_dates").update({ is_option: false, expiracy_date: null, booked_places: 0 }).eq("id", row.id);
      if (updateError) {
        console.error("Error converting expired option to prospect", row.id, updateError);
        continue;
      }
      const recompute = await booking.recomputeBookedSeatAndStatus(row.travel_date_id);
      if (recompute == null ? void 0 : recompute.error) {
        console.error("Error recomputing travel_date", row.travel_date_id, recompute.error);
      }
      if (row.deal_id) {
        try {
          if (!customFields) customFields = await activecampaign.getDealCustomFields(row.deal_id);
          if (!deal) {
            const dealRes = await activecampaign.getDealById(row.deal_id);
            deal = dealRes == null ? void 0 : dealRes.deal;
          }
          if (!contact && (deal == null ? void 0 : deal.contact)) {
            const contactRes = await activecampaign.getClientById(deal.contact);
            contact = contactRes == null ? void 0 : contactRes.contact;
          }
          axios({
            url: process.env.SLACK_URL_POSE_OPTION,
            method: "post",
            data: {
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${row.deal_id}| Option Expir\xE9e-${(deal == null ? void 0 : deal.title) || (customFields == null ? void 0 : customFields.slug)}-${(contact == null ? void 0 : contact.firstName) || ""}${(contact == null ? void 0 : contact.lastName) || ""}-pax ${(customFields == null ? void 0 : customFields.nbTravelers) || ""}'>`
                  }
                }
              ]
            }
          });
        } catch (err) {
          console.error("Error notifying slack for expired option", row.deal_id, err);
        }
      }
    }
  }
  if (data) {
    console.log("Expired options processed:", data.length);
  }
});

export { cronjob as default };
//# sourceMappingURL=cronjob.mjs.map
