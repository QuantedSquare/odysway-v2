import { a as defineEventHandler, g as getQuery, c as createError, s as supabase, b as activecampaign } from '../../../../nitro/nitro.mjs';
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

const purchaseData_get = defineEventHandler(async (event) => {
  var _a;
  const { booked_id } = getQuery(event);
  if (!booked_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "booked_id is required"
    });
  }
  try {
    const { data: bookedDate, error: bookedError } = await supabase.from("booked_dates").select("deal_id, is_option").eq("id", booked_id).single();
    console.log("bookedDate", bookedDate);
    if (bookedError || !bookedDate) {
      throw createError({
        statusCode: 404,
        statusMessage: "Booked date not found"
      });
    }
    if (bookedDate.is_option) {
      return {
        isOption: true
      };
    }
    const [dealData, customFields] = await Promise.all([
      activecampaign.getDealById(bookedDate.deal_id),
      activecampaign.getDealCustomFields(bookedDate.deal_id)
    ]);
    if (!(dealData == null ? void 0 : dealData.deal)) {
      throw createError({
        statusCode: 404,
        statusMessage: "Deal not found in ActiveCampaign"
      });
    }
    const deal = { ...dealData.deal, ...customFields };
    const { contact } = await activecampaign.getClientById(deal.contact);
    if (!contact) {
      throw createError({
        statusCode: 404,
        statusMessage: "Contact not found in ActiveCampaign"
      });
    }
    const getCountryFromPhone = (phone) => {
      if (!phone) return null;
      const countryMap = {
        "+33": "France",
        "+32": "Belgium",
        "+1": "Canada/USA",
        "+41": "Switzerland",
        "+44": "United Kingdom",
        "+39": "Italy",
        "+34": "Spain",
        "+49": "Germany",
        "+352": "Luxembourg",
        "+31": "Netherlands"
      };
      for (const [code, country] of Object.entries(countryMap)) {
        if (phone.startsWith(code)) {
          return country;
        }
      }
      return null;
    };
    const userCountry = getCountryFromPhone(contact.phone) || "Unknown";
    const hasNewsletterOptin = ((_a = contact.contactLists) == null ? void 0 : _a.some((list) => list.list === "18")) || false;
    const notesResponse = await $fetch(`${process.env.ACTIVE_CAMPAIGN_URL}/deals/${bookedDate.deal_id}/notes`, {
      headers: {
        "Api-Token": process.env.ACTIVE_CAMPAIGN_API_KEY
      }
    });
    let transactionId = bookedDate.deal_id;
    let paymentType = "CB";
    if (notesResponse == null ? void 0 : notesResponse.notes) {
      const sortedNotes = [...notesResponse.notes].sort((a, b) => {
        return new Date(b.cdate) - new Date(a.cdate);
      });
      const paymentNote = sortedNotes.find((note) => {
        var _a2;
        return (_a2 = note.note) == null ? void 0 : _a2.startsWith("Paiement");
      });
      if (paymentNote) {
        const noteParts = paymentNote.note.split(" - ");
        if (noteParts.length >= 2) {
          paymentType = noteParts[0].replace("Paiement ", "").trim();
          transactionId = noteParts[1].trim();
        }
      }
    }
    const alreadyPaid = parseFloat(deal.alreadyPaid) || 0;
    const shouldTrack = alreadyPaid === 0;
    return {
      isOption: false,
      shouldTrack,
      transactionId: transactionId.startsWith("pi_") || transactionId.startsWith("al") ? transactionId : bookedDate.deal_id,
      paymentType,
      totalValue: (deal.totalTravelPrice || 0) / 100,
      // Convert from cents to euros
      optinNewsletter: hasNewsletterOptin,
      userData: {
        userId: contact.id,
        userMail: contact.email,
        userPhone: contact.phone,
        userCountry
      },
      dynamicDealValues: {
        nbAdults: parseInt(deal.nbAdults) || 0,
        nbChildren: parseInt(deal.nbChildren) || 0,
        nbTravelers: parseInt(deal.nbTravelers) || 0,
        insurance: deal.insurance && deal.insurance !== "Aucune Assurance" ? deal.insurance : null,
        insuranceCommissionPrice: parseInt(deal.insuranceCommissionPrice) || 0,
        indivRoom: deal.indivRoom === "Oui",
        extensionPrice: parseInt(deal.extensionPrice) || 0
      }
    };
  } catch (err) {
    console.error("Error fetching purchase data:", err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Error fetching purchase data"
    });
  }
});

export { purchaseData_get as default };
//# sourceMappingURL=purchase-data.get.mjs.map
