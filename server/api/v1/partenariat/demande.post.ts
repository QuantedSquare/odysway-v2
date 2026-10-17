import type { H3Event } from 'h3'

// Formulaire de la page /partenariat.
//
// 1. La demande est d'abord écrite dans `partnership_requests` : le lead n'est
//    jamais perdu, même si AC est indisponible.
// 2. Contact AC (créé ou mis à jour par email), tag `partenaire-inbound`, note
//    reprenant le projet.
// 3. Miroir du contact dans `activecampaign_clients`, relu depuis AC.
// 4. Alerte Slack.
// Une panne aux étapes 2 à 4 est loguée et signalée sur Slack, sans faire
// échouer l'envoi côté visiteur : la demande est déjà en base.

const TAG = 'partenaire-inbound'

const buildNote = (d: TypePartnershipRequest) => [
  'Demande de partenariat (page /partenariat)',
  '',
  `Concept : ${d.concept}`,
  `Destination : ${d.destination || '—'}`,
  `Communauté : ${d.communaute || '—'}`,
  `Participants envisagés : ${d.participants || '—'}`,
  `À déléguer : ${d.besoin || '—'}`,
  ...(d.utm ? [`UTM : ${d.utm}`] : []),
].join('\n')

export default defineEventHandler(async (event: H3Event) => {
  const parsed = await readValidatedBody(event, body => partnershipRequestSchema.safeParse(body))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide', data: parsed.error.flatten() })
  }
  const data = parsed.data

  // Pot de miel rempli : on répond comme si tout allait bien, sans rien écrire.
  if (data.website) return { success: true }

  const { data: inserted, error: insertError } = await supabase
    .from('partnership_requests')
    .insert({
      email: data.email,
      concept: data.concept,
      destination: data.destination || null,
      communaute: data.communaute || null,
      participants: data.participants || null,
      besoin: data.besoin || null,
      source_url: data.sourceUrl || null,
      utm: data.utm || null,
    })
    .select('id')
    .single()
  if (insertError) {
    console.error('[partenariat] insert partnership_requests:', insertError)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d\'enregistrer la demande' })
  }

  let contactId: number | null = null
  try {
    const contact = await activecampaign.upsertContact({ contact: { email: data.email } })
    contactId = Number(contact.id)

    await Promise.all([
      activecampaign.addTagToContact(contactId, TAG)
        .catch((err: Error) => console.error('[partenariat] tag AC:', err.message)),
      activecampaign.addContactNote(contactId, buildNote(data))
        .catch((err: Error) => console.error('[partenariat] note AC:', err.message)),
    ])

    // Relu après le tag, pour que le miroir le porte.
    await activecampaign.upsertContactIntoSupabase(contactId)

    await supabase
      .from('partnership_requests')
      .update({ ac_contact: contactId })
      .eq('id', inserted.id)
  }
  catch (err) {
    console.error('[partenariat] contact AC / miroir:', err instanceof Error ? err.message : err)
    await slack.send(process.env.SLACK_URL_FUNNEL_ERRORS,
      `:warning: *Partenariat* : contact AC ou miroir en échec pour ${data.email} (demande \`${inserted.id}\` bien enregistrée).`)
  }

  await slack.alertPartnershipRequest({ ...data, contactId })

  return { success: true }
})
