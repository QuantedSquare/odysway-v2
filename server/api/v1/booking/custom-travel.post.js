import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'
import activecampaign from '~/server/utils/activecampaign'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  console.log('===========body in custom-travel.post.js===========', body)
  // Required fields
  const required = ['title', 'email', 'departure_date', 'return_date', 'destination', 'starting_price']
  for (const field of required) {
    if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
      return { error: `Champ obligatoire manquant: ${field}` }
    }
  }

  // Parse destination(s)
  let iso = ''
  let zoneChapka = ''
  let country = ''
  // let destizZnationTitles = []
  if (Array.isArray(body.destination) && body.destination.length > 0) {
    // Use the first destination for iso/zoneChapka/country, but keep all for destination field
    iso = body.destination.map(d => d.iso).join(',')
    zoneChapka = body.destination[0].chapka
    country = body.destination.map(d => d.title).join(',')
    // destinationTitles = body.destination.map(d => d.titre).join(',')
  }

  // 1. Create deal on ActiveCampaign

  const fetchedContact = await activecampaign.getClientByEmail(body.email)
  const contact = fetchedContact.contacts[0]
  const acContact = await activecampaign.getClientById(contact.id)

  console.log('===========fetchedContact in custom-travel.post.js===========', acContact.contact)
  let dealId
  try {
    delete body.destination
    // Compose deal data for ActiveCampaign
    let dealData
    if (body.ac_link) {
      // Only update fields provided by the frontend (payload), plus derived fields
      dealData = {
        ...body, // all fields from the payload (title, description, etc.)
        country,
        iso,
        zoneChapka,
        title: body.title,
        basePricePerTraveler: Number(body.starting_price),
        departureDate: body.departure_date,
        returnDate: body.return_date,
        firstname: acContact.contact.firstName || '',
        lastname: acContact.contact.lastName || '',
        phone: acContact.contact.phone || '',
        email: body.email,
      }
      // Remove ac_link from dealData if present
      delete dealData.ac_link
    }
    else {
      // Full object for creation
      dealData = {
        value: Number(body.starting_price) * 100,
        title: body.title,
        currency: 'eur',
        group: '1',
        owner: '1',
        stage: config.public.environment === 'development' ? '48' : '2',
        departureDate: body.departure_date,
        returnDate: body.return_date,
        travelType: ['Voyage sur-mesure'],
        nbTravelers: 1,
        nbChildren: 0,
        nbAdults: 1,
        country,
        iso,
        zoneChapka,
        image: '/images/default/Odysway-couverture-mongolie.jpeg',
        currentStep: 'Création du Deal sur mesure',
        alreadyPaid: 0,
        restToPay: 0,
        utm: '',
        slug: 'custom',
        basePricePerTraveler: Number(body.starting_price),
        promoChildren: 0,
        maxChildrenAge: 0,
        promoTeen: 0,
        nbTeen: 0,
        // maxTeenAge: 0,
        gotEarlybird: 'Non',
        promoEarlybird: 0,
        gotLastMinute: 'Non',
        promoLastMinute: 0,
        forcedIndivRoom: 'Non',
        indivRoomPrice: 0,
        flightPrice: 0,
        extensionPrice: 0,
        // contacts
        email: body.email,
        firstname: acContact.contact.firstName || '',
        lastname: acContact.contact.lastName || '',
        phone: acContact.contact.phone || '',
      }
    }
    console.log('===========dealData in custom-travel.post.js===========', dealData)
    if (body.ac_link) {
      // Try to extract dealId from the URL
      const match = body.ac_link.match(/deals\/(\d+)/)
      if (match && match[1]) {
        dealId = await activecampaign.updateDeal(match[1], dealData)
        console.log('===========dealId (updated) in custom-travel.post.js===========', dealId)
      }
      else {
        return { error: 'Lien ActiveCampaign invalide (dealId non trouvé)' }
      }
    }
    else {
      dealId = await activecampaign.createDeal(dealData)
      console.log('===========dealId (created) in custom-travel.post.js===========', dealId)
    }
  }
  catch (err) {
    return { error: 'Erreur lors de la création/mise à jour du deal ActiveCampaign', details: err.message || err }
  }

  // 2. Insert into travel_dates
  let travelDateRow
  try {
    console.log('===========body in custom-travel.post.js===========', body)
    const insertData = {
      published: false,
      status: 'soon_confirmed',
      departure_date: body.departure_date,
      return_date: body.return_date,
      max_travelers: body.max_travelers || 6,
      min_travelers: body.min_travelers || 1,
      booked_seat: 0,
      include_flight: !!body.include_flight,
      flight_price: body.flight_price || 0,
      badges: body.badges || '',
      starting_price: Number(body.starting_price),
      travel_slug: 'custom',
      is_custom_travel: true,
    }
    const { data, error } = await supabase
      .from('travel_dates')
      .insert([insertData])
      .select('*')
      .single()
    console.log('===========insertData SUPABASE in custom-travel.post.js===========', insertData)
    if (error) return { error: error.message }
    travelDateRow = data
  }
  catch (err) {
    return { error: 'Erreur lors de la création de la date custom', details: err.message || err }
  }

  // 3. Insert into booked_dates
  let bookedDateRow
  try {
    const { data, error } = await supabase
      .from('booked_dates')
      .insert([{
        travel_date_id: travelDateRow.id,
        deal_id: dealId,
        booked_places: 0,
      }])
      .select('*')
      .single()
    if (error) return { error: error.message }
    bookedDateRow = data
  }
  catch (err) {
    return { error: 'Erreur lors de la création de la réservation custom', details: err.message || err }
  }

  return { success: true, travel_date: travelDateRow, booked_date: bookedDateRow }
})
