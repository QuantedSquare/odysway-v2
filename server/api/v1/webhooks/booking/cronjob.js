import { defineEventHandler, getHeader, createError } from 'h3'
import axios from 'axios'
import supabase from '../../../utils/supabase'
import booking from '../../../utils/booking'
import activecampaign from '../../../utils/activecampaign'

export default defineEventHandler(async (event) => {
  // Get all booked_dates with is_option == true and expiracy_date < today
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = getHeader(event, 'x-cron-secret')
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  console.log('Cronjob started')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('is_option', true)
    .lt('expiracy_date', today.toISOString())

  if (error) {
    console.error(error)
    return
  }

  if (data && data.length > 0) {
    for (const row of data) {
      // Safety: if the deal is already paid in ActiveCampaign, preserve the row and remove the option flag.
      let customFields = null
      let deal = null
      let contact = null

      if (row.deal_id) {
        try {
          customFields = await activecampaign.getDealCustomFields(row.deal_id)
          const dealRes = await activecampaign.getDealById(row.deal_id)
          deal = dealRes?.deal
          if (deal?.contact) {
            const contactRes = await activecampaign.getClientById(deal.contact)
            contact = contactRes?.contact
          }
        }
        catch (err) {
          // If we can't verify alreadyPaid, do not delete.
          console.error('Error fetching ActiveCampaign data for expired option', row.deal_id, err)
          continue
        }

        const alreadyPaid = Number(customFields?.alreadyPaid || 0)
        if (alreadyPaid > 0) {
          const bookedPlaces = Number(customFields?.nbTravelers || row.booked_places || 0)
          const { error: updateBookedError } = await supabase
            .from('booked_dates')
            .update({ is_option: false, expiracy_date: null, booked_places: bookedPlaces })
            .eq('id', row.id)

          if (updateBookedError) {
            console.error('Error removing option on booked_date', row.id, updateBookedError)
            continue
          }

          const recompute = await booking.recomputeBookedSeatAndStatus(row.travel_date_id)
          if (recompute?.error) {
            console.error('Error recomputing travel_date', row.travel_date_id, recompute.error)
          }

          // We intentionally do NOT delete the row in this case.
          continue
        }
      }

      // Not paid (or no deal_id): delete the booked_date row, then recompute booked_seat + status.
      const { error: deleteError } = await supabase
        .from('booked_dates')
        .delete()
        .eq('id', row.id)
      if (deleteError) {
        console.error('Error deleting booked_date', row.id, deleteError)
        continue
      }

      const recompute = await booking.recomputeBookedSeatAndStatus(row.travel_date_id)
      if (recompute?.error) {
        console.error('Error recomputing travel_date', row.travel_date_id, recompute.error)
      }

      // Slack notification for expired option removal (best-effort)
      if (row.deal_id) {
        try {
          if (!customFields) customFields = await activecampaign.getDealCustomFields(row.deal_id)
          if (!deal) {
            const dealRes = await activecampaign.getDealById(row.deal_id)
            deal = dealRes?.deal
          }
          if (!contact && deal?.contact) {
            const contactRes = await activecampaign.getClientById(deal.contact)
            contact = contactRes?.contact
          }

          axios({
            url: process.env.SLACK_URL_POSE_OPTION,
            method: 'post',
            data: {
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${row.deal_id}| Option Expirée-${deal?.title || customFields?.slug}-${contact?.firstName || ''}${contact?.lastName || ''}-pax ${customFields?.nbTravelers || ''}'>`,
                  },
                },
              ],
            },
          })
        }
        catch (err) {
          console.error('Error notifying slack for expired option', row.deal_id, err)
        }
      }
    }
  }

  if (data) {
    console.log('Expired options processed:', data.length)
  }
})
