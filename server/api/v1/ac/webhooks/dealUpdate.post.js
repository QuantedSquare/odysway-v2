import { createError } from 'h3'

const { mapDealStatus } = dealMirror

// Auteur des suppressions/restaurations déclenchées par ce webhook, dans la
// piste d'audit (deleted_by, date_activity_log).
const AC_USER = { email: 'activecampaign' }

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  try {
    // Extract deal data from request body
    const body = await readBody(event)
    console.log('===========body', body, '========')

    const dealId = body['deal[id]']
    const contactId = body['deal[contactid]'] || body['contact[id]']
    const eventTime = body.date_time || null

    // Idempotency guard — skip if (dealId, eventTime) tuple already processed.
    // AC webhooks don't include deal[mdate]; the top-level `date_time` is the
    // closest stable signature of a unique event.
    if (eventTime) {
      const eventId = `deal-${dealId}-${eventTime}`
      const { data: existing } = await supabase
        .from('ac_processed_events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle()
      if (existing) {
        console.log('Webhook already processed, skipping:', eventId)
        return { success: true, skipped: true, reason: 'duplicate event' }
      }
      // Best-effort record (ignore conflict in parallel races)
      await supabase.from('ac_processed_events').upsert({ id: eventId })
    }

    console.log('===========dealId', dealId, '========')
    console.log('===========contactId', contactId, '========')
    if (!dealId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid deal data: missing deal id',
      })
    }
    if (!contactId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid deal data: missing contact id',
      })
    }

    // Les dossiers de départ (pipeline 4, « Gestions Départs ») sont recopiés eux
    // aussi : Ulysse vérifie leur valeur et leurs voyageurs contre les deals du
    // pipeline 2. Aucune branche ci-dessous ne les abîme : ils n'ont pas de
    // booked_dates (le lien passe par travel_dates.departure_id) et
    // recalculatTotalValues les ignore. Ne JAMAIS les additionner aux pipelines
    // 1 et 2 : chaque voyageur y a déjà son propre deal.

    // Fetch and process contact information
    const contactData = await activecampaign.upsertContactIntoSupabase(contactId)
    if (!contactData) {
      throw createError({
        statusCode: 404,
        message: 'Contact not found',
      })
    }

    // Retrieve custom field data
    const reponse = await activecampaign.getDealById(dealId)
    const customFields = await activecampaign.getDealCustomFields(dealId)
    const fetchedDeal = { ...reponse.deal, ...customFields }

    // Handle destructive/cleanup flows
    if (fetchedDeal.group === '3') {
      // Fetch the row to get travel_date_id
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId)

      console.log('======bookedRow=======', bookedRow)
      if (!bookedRow) {
        console.log('No booked_dates found for dealId:', dealId)
        // Still delete from ActiveCampaign even if no booked_dates found
        try {
          await activecampaign.deleteDeal(dealId)
          console.log('Deal deleted from ActiveCampaign successfully even if no booked_dates found')
        }
        catch (acError) {
          console.error('Error deleting deal from ActiveCampaign:', acError)
        }
        return { success: true, message: 'Deal deleted from ActiveCampaign, no booked_dates found' }
      }
      else {
        const travel_date_id = bookedRow.travel_date_id

        // Delete from ActiveCampaign and Supabase
        try {
          console.log('Attempting to delete deal from ActiveCampaign with dealId:', dealId)
          const deleteResult = await activecampaign.deleteDeal(dealId)
          console.log('Deal deleted from ActiveCampaign successfully, result:', deleteResult)
        }
        catch (acError) {
          console.error('Error deleting deal from ActiveCampaign:', acError)
          console.error('Error details:', {
            message: acError.message,
            dealId: dealId,
          })
        // Continue with Supabase cleanup even if ActiveCampaign deletion fails
        }

        console.log('Attempting to soft delete deal from Supabase with dealId:', dealId)
        try {
          await booking.softDeleteBookedDateByDealId(dealId, {
            user: AC_USER,
            reason: softDelete.REASONS.AC_DEAL_TRASHED,
          })
          console.log('Deal soft deleted from Supabase successfully')

          await booking.recomputeBookedSeatAndStatus(travel_date_id)
          console.log('Booked places updated successfully, travel_date_id:', travel_date_id)

          // Deal de départ mis en veille s'il ne reste aucun payant (jamais supprimé)
          await departures.cleanupDepartureDealIfEmpty(travel_date_id)

          await logDateActivity(travel_date_id, AC_USER, 'deal_removed', {
            deal_id: dealId, booked_id: bookedRow.id, source: 'ac_deal_trashed',
          })
        }
        catch (bookingError) {
          console.error('Error in booking operations:', bookingError)
          // Continue with the process even if booking operations fail
        }
      }
      // La ligne miroir suivait le deal vers la corbeille sans être marquée —
      // incohérence avec dealDelete, qui lui la supprimait.
      await softDelete.remove('activecampaign_deals', q => q.eq('id', dealId), {
        user: AC_USER,
        reason: softDelete.REASONS.AC_DEAL_TRASHED,
      })
      return { success: true }
    }
    else if (['Perdu', 'Supprimé'].includes(mapDealStatus(fetchedDeal.status))) {
      // Only update Supabase (do not delete ActiveCampaign deal)
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId)

      console.log('======bookedRow=======', bookedRow)
      if (!bookedRow) {
        console.log('No booked_dates found for dealId:', dealId)
      }
      else {
        const travel_date_id = bookedRow.travel_date_id

        console.log('Attempting to soft delete deal from Supabase with dealId:', dealId)
        try {
          await booking.softDeleteBookedDateByDealId(dealId, {
            user: AC_USER,
            reason: softDelete.REASONS.AC_DEAL_LOST,
          })
          console.log('Deal soft deleted from Supabase successfully')

          await booking.recomputeBookedSeatAndStatus(travel_date_id)
          console.log('Booked places updated successfully, travel_date_id:', travel_date_id)

          // Deal de départ mis en veille s'il ne reste aucun payant (jamais supprimé)
          await departures.cleanupDepartureDealIfEmpty(travel_date_id)

          await logDateActivity(travel_date_id, AC_USER, 'deal_removed', {
            deal_id: dealId, booked_id: bookedRow.id, source: 'ac_deal_lost',
          })
        }
        catch (bookingError) {
          console.error('Error in booking operations:', bookingError)
          // Continue with the process even if booking operations fail
        }
      }
    }
    else {
      // Branche inverse : le deal revient à un état vivant (Ouvert / Gagné, hors
      // corbeille). Si sa réservation porte une pierre tombale posée par l'un
      // des deux cas ci-dessus, on la ressuscite.
      //
      // Sans ça, marquer un deal « Perdu » par erreur serait une porte à sens
      // unique — précisément le mode de défaillance que le soft delete existe
      // pour éliminer.
      const tombstone = await booking.retrieveBookedDateByDealId(dealId, { includeDeleted: true })
      const revivable = [softDelete.REASONS.AC_DEAL_LOST, softDelete.REASONS.AC_DEAL_TRASHED]
      if (tombstone?.deleted && revivable.includes(tombstone.deleted_reason)) {
        try {
          const res = await booking.upsertBookedDateForDeal(dealId, null, {}, {
            user: AC_USER,
            allowMove: false,
            resetOnRevive: false,
          })
          if (res.row) {
            await booking.recomputeBookedSeatAndStatus(res.row.travel_date_id)
            await logDateActivity(res.row.travel_date_id, AC_USER, 'deal_restored', {
              deal_id: dealId,
              booked_id: res.row.id,
              cause: 'ac_status_reopened',
              previous_reason: tombstone.deleted_reason,
              status: fetchedDeal.status,
            })
            console.log(`[dealUpdate] réservation ressuscitée dealId=${dealId} bookedId=${res.row.id}`)
          }
        }
        catch (reviveError) {
          console.error('Error reviving booking after deal reopened:', reviveError)
        }
      }
      // La ligne miroir suit le même chemin de retour.
      await softDelete.restore('activecampaign_deals', q => q.eq('id', dealId))
    }

    // Ligne miroir : une seule construction pour le webhook et la
    // resynchronisation (server/utils/dealMirror.js). Un champ absent d'AC y
    // devient `null`, plus un 0 ni une valeur par défaut inventée.
    const upsertData = dealMirror.mapDealToMirrorRow({ dealId, contactId, fetchedDeal, body, eventTime })

    await activecampaign.recalculatTotalValues(dealId)
    console.log('[dealUpdate] before upsert gate', {
      hasContactData: !!contactData,
      hasDataArray: !!contactData?.data,
      dataLength: contactData?.data?.length,
      contactEmail: contactData?.contact?.email,
      dealId,
      contactId,
    })
    console.log('[dealUpdate] upsertData preview', {
      id: upsertData.id,
      contact: upsertData.contact,
      status: upsertData.status,
      pipeline_id: upsertData.pipeline_id,
      total_value: upsertData.total_value,
    })
    if (contactData.data && contactData.data.length > 0 && contactData.contact.email !== 'ottmann.alex@gmail.com' && contactData.contact.email !== 'test@gmail.com') {
      // Upsert deal data to Supabase. onConflict: 'id' handles the case where
      // AC reassigns a deal's primary contact (the legacy UNIQUE(id) would
      // otherwise block an INSERT against the composite PK (id, contact)).
      const { error, data: upsertedData } = await supabase
        .from('activecampaign_deals')
        .upsert(upsertData, { onConflict: 'id' })
        .select()

      // Log any upsert errors
      if (error) {
        console.error('Supabase upsert error:', error)
        throw createError({
          statusCode: 500,
          message: 'Failed to upsert deal data',
        })
      }

      // Log successful upsert
      console.log('Deal upserted successfully:', upsertedData)

      return { success: true }
    }
  }
  catch (err) {
    console.error('DealUpdate webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in deal update process',
    })
  }
})
