import { defineEventHandler } from 'h3'
import axios from 'axios'
import supabase from '~/server/utils/supabase'
import activecampaign from '~/server/utils/activecampaign'

export default defineEventHandler(async (event) => {
  // Get all booked_dates with is_option == true and expiracy_date < today
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = getHeader(event, 'x-cron-secret')
  if (!headerSecret || headerSecret !== cronSecret) {
    return { error: 'Unauthorized' }
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
      // Delete the booked_date row
      const { data: travelDate, error: travelDateError } = await supabase
        .from('travel_dates')
        .select('*')
        .eq('id', row.travel_date_id)
        .single()
      if (travelDateError) {
        console.error('Error getting travel_date', row.travel_date_id, travelDateError)
        continue
      }
      else {
        // Update the travel_date row
        const { error: updateError } = await supabase
          .from('travel_dates')
          .update({ booked_seat: travelDate.booked_seat - row.booked_places })
          .eq('id', row.travel_date_id)
        if (updateError) {
          console.error('Error updating travel_date', row.travel_date_id, updateError)
          continue
        }
      }
      const { error: deleteError } = await supabase
        .from('booked_dates')
        .delete()
        .eq('id', row.id)
      if (deleteError) {
        console.error('Error deleting booked_date', row.id, deleteError)
        continue
      }
      // Update the deal in ActiveCampaign (set stage to 1)
      if (row.deal_id) {
        try {
          const customFields = await activecampaign.getDealCustomFields(row.deal_id)
          const { deal } = await activecampaign.getDealById(row.deal_id)
          const { contact } = await activecampaign.getClientById(deal.contact)
          axios({
            url: process.env.SLACK_URL_POSE_OPTION,
            method: 'post',
            data:
              {
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${row.deal_id}| Option Expirée-${deal?.title || customFields?.slug}-${contact?.firstName}${contact?.lastName}-pax ${customFields?.nbTravelers}'>`,
                    },
                  },
                ],
              },
          })
        }
        catch (err) {
          console.error('Error updating deal in ActiveCampaign', row.deal_id, err)
        }
      }
    }
  }

  if (data) {
    console.log('Expired options processed:', data.length)
  }
})
