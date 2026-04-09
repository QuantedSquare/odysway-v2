import { a as defineEventHandler, g as getQuery, f as readBody, c as createError, b as activecampaign, h as booking, i as departures, s as supabase } from '../../../../../nitro/nitro.mjs';
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

const formatPrice = (price) => {
  if (!price) return 0;
  return +price.replace("\u20AC", "").replace(".", "").replace(",", ".");
};
const mapDealStatus = (status) => {
  const statusMap = {
    0: "Ouvert",
    1: "Gagn\xE9",
    default: "Perdu"
  };
  return statusMap[status] || statusMap.default;
};
const dealUpdate_post = defineEventHandler(async (event) => {
  const { token } = getQuery(event);
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: "Unauthorized" };
  }
  try {
    const body = await readBody(event);
    console.log("===========body", body, "========");
    const dealId = body["deal[id]"];
    const contactId = body["deal[contactid]"] || body["contact[id]"];
    const isoDate = body["deal[create_date_iso]"];
    const owner = body["deal[owner]"];
    console.log("===========dealId", dealId, "========");
    console.log("===========contactId", contactId, "========");
    if (!dealId) {
      throw createError({
        statusCode: 400,
        message: "Invalid deal data: missing deal id"
      });
    }
    if (!contactId) {
      throw createError({
        statusCode: 400,
        message: "Invalid deal data: missing contact id"
      });
    }
    const pipelineId = body["deal[group]"];
    if (pipelineId === "4") {
      return { success: true, skipped: true, reason: "Gestions D\xE9parts pipeline" };
    }
    const contactData = await activecampaign.upsertContactIntoSupabase(contactId);
    if (!contactData) {
      throw createError({
        statusCode: 404,
        message: "Contact not found"
      });
    }
    const reponse = await activecampaign.getDealById(dealId);
    const customFields = await activecampaign.getDealCustomFields(dealId);
    const fetchedDeal = { ...reponse.deal, ...customFields };
    if (fetchedDeal.group === "3") {
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId);
      console.log("======bookedRow=======", bookedRow);
      if (!bookedRow) {
        console.log("No booked_dates found for dealId:", dealId);
        try {
          await activecampaign.deleteDeal(dealId);
          console.log("Deal deleted from ActiveCampaign successfully even if no booked_dates found");
        } catch (acError) {
          console.error("Error deleting deal from ActiveCampaign:", acError);
        }
        return { success: true, message: "Deal deleted from ActiveCampaign, no booked_dates found" };
      } else {
        const travel_date_id = bookedRow.travel_date_id;
        try {
          console.log("Attempting to delete deal from ActiveCampaign with dealId:", dealId);
          const deleteResult = await activecampaign.deleteDeal(dealId);
          console.log("Deal deleted from ActiveCampaign successfully, result:", deleteResult);
        } catch (acError) {
          console.error("Error deleting deal from ActiveCampaign:", acError);
          console.error("Error details:", {
            message: acError.message,
            dealId
          });
        }
        console.log("Attempting to delete deal from Supabase with dealId:", dealId);
        try {
          await booking.deleteBookedDateByDealId(dealId);
          console.log("Deal deleted from Supabase successfully");
          console.log("Attempting to update travel_dates.booked_seat with travel_date_id:", travel_date_id);
          const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id);
          const totalBooked = allBooked.reduce((acc, row) => acc + (row.booked_places || 0), 0);
          await booking.updateTravelDate(travel_date_id, totalBooked);
          console.log("Booked places updated successfully, travel_date_id:", travel_date_id);
          await departures.cleanupDepartureDealIfEmpty(travel_date_id);
        } catch (bookingError) {
          console.error("Error in booking operations:", bookingError);
        }
      }
      return { success: true };
    } else if (mapDealStatus(fetchedDeal.status) === "Perdu") {
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId);
      console.log("======bookedRow=======", bookedRow);
      if (!bookedRow) {
        console.log("No booked_dates found for dealId:", dealId);
      } else {
        const travel_date_id = bookedRow.travel_date_id;
        console.log("Attempting to delete deal from Supabase with dealId:", dealId);
        try {
          await booking.deleteBookedDateByDealId(dealId);
          console.log("Deal deleted from Supabase successfully");
          console.log("Attempting to update travel_dates.booked_seat with travel_date_id:", travel_date_id);
          const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id);
          const totalBooked = allBooked.reduce((acc, row) => acc + (row.booked_places || 0), 0);
          await booking.updateTravelDate(travel_date_id, totalBooked);
          console.log("Booked places updated successfully, travel_date_id:", travel_date_id);
          await departures.cleanupDepartureDealIfEmpty(travel_date_id);
        } catch (bookingError) {
          console.error("Error in booking operations:", bookingError);
        }
      }
    }
    const upsertData = {
      id: dealId,
      contact: contactId,
      title: fetchedDeal.title,
      status: mapDealStatus(fetchedDeal.status),
      stage: fetchedDeal.stage_title,
      pipeline_id: fetchedDeal.pipelineid,
      total_value: formatPrice(fetchedDeal.value),
      price_per_traveler: +fetchedDeal.basePricePerTraveler / 100 || 0,
      nb_traveler: +fetchedDeal.nbTravelers || 0,
      nb_adults: +fetchedDeal.nbAdults || 0,
      nb_children: +fetchedDeal.nbChildren || 0,
      travel_type: fetchedDeal.travelType || null,
      indiv_room: fetchedDeal.indivRoom === "Oui",
      rest_to_pay: +fetchedDeal.restToPay / 100 || 0,
      total_paid: +fetchedDeal.alreadyPaid / 100 || 0,
      margin_per_traveler: +fetchedDeal.marginPerTraveler / 100 || 0,
      flight_margin: +fetchedDeal.flightMargin / 100 || 0,
      total_margin: +fetchedDeal.totalMargin / 100 || 0,
      insurance_commission: +fetchedDeal.insuranceCommissionPrice / 100 || 0,
      insurance_choice: fetchedDeal.insurance || "Aucune Assurance",
      promo_code: fetchedDeal.promoCode || null,
      insurance_price_per_traveler: +fetchedDeal.insuranceCommissionPerTraveler / 100 || 0,
      country: fetchedDeal.country || "Non renseign\xE9",
      is_couple: fetchedDeal.isCouple === "Oui",
      lost_reason: fetchedDeal.reasonLost || fetchedDeal.otherReasonLost || null,
      applied_promo_per_traveler: +fetchedDeal.promoValue / 100 || 0,
      children_promo: +fetchedDeal.promoChildren / 100 || 80,
      // teen_promo: +fetchedDeal.promoTeen / 100 || 80,
      rest_to_pay_per_traveler: +fetchedDeal.restToPayPerTraveler / 100 || 0,
      iso: fetchedDeal.iso || null,
      // max_teen_age: +fetchedDeal.maxTeenAge || 18,
      max_children_age: +fetchedDeal.maxChildrenAge || 12,
      flight_ticket_price_per_traveler: +fetchedDeal.flightPrice / 100 || 0,
      departure_date: fetchedDeal.departureDate || null,
      return_date: fetchedDeal.returnDate || null,
      conversion_date: fetchedDeal.conversionDate || null,
      seller: owner,
      source: fetchedDeal.source || null,
      paiement_method: fetchedDeal.paiementMethod || null,
      created_at: isoDate.includes("2023-12-19") ? fetchedDeal.oldCreationDate || isoDate : isoDate
    };
    await activecampaign.recalculatTotalValues(dealId);
    if (contactData.data && contactData.data.length > 0 && contactData.contact.email !== "ottmann.alex@gmail.com" && contactData.contact.email !== "test@gmail.com") {
      const { error, data: upsertedData } = await supabase.from("activecampaign_deals").upsert(upsertData).select();
      if (error) {
        console.error("Supabase upsert error:", error);
        throw createError({
          statusCode: 500,
          message: "Failed to upsert deal data"
        });
      }
      console.log("Deal upserted successfully:", upsertedData);
      return { success: true };
    }
  } catch (err) {
    console.error("DealUpdate webhook error:", err);
    throw createError({
      statusCode: 500,
      message: "Unexpected error in deal update process"
    });
  }
});

export { dealUpdate_post as default };
//# sourceMappingURL=dealUpdate.post.mjs.map
