import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Vérifie le code reçu sur la seconde adresse et rattache ses dossiers.
//
//   POST /api/v1/espace/rattachement/verifier   { email, code }
//
// Le dernier code non utilisé de cette adresse, 15 minutes, 5 essais. Un code
// juste rattache les contacts AC de l'adresse ET les invitations reçues dessus.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const body = await readBody(event).catch(() => ({}))
  const email = espaceVoyageur.normaliserEmail(body?.email)
  const code = String(body?.code || '').trim()
  if (!espaceVoyageur.emailValide(email)) throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })

  const { data: demande } = await supabase.from('client_link_codes')
    .select('id, code_hash, attempts, expires_at')
    .eq('user_id', client.id).eq('email', email).is('consumed_at', null)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()

  const invalide = () => createError({ statusCode: 400, statusMessage: 'Code incorrect ou expiré. Demandez-en un nouveau.' })
  if (!demande || Date.parse(demande.expires_at) < Date.now() || demande.attempts >= espaceCodes.ESSAIS_MAX) throw invalide()

  // L'essai est compté AVANT la comparaison : deux requêtes simultanées ne
  // doivent pas offrir un essai gratuit.
  await supabase.from('client_link_codes').update({ attempts: demande.attempts + 1 }).eq('id', demande.id)
  if (!espaceCodes.verifier({ userId: client.id, email, code, hash: demande.code_hash })) throw invalide()

  await supabase.from('client_link_codes').update({ consumed_at: new Date().toISOString() }).eq('id', demande.id)

  const { data: contacts, error } = await supabase.from('activecampaign_clients')
    .select('contact').ilike('email', espaceVoyageur.motifEmailExact(email)).not('deleted', 'is', true)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Rattachement impossible pour le moment.' })
  const liens = (contacts || []).filter(c => c.contact).map(c => ({
    user_id: client.id, ac_contact: c.contact, linked_via: 'rattachement', linked_email: email,
  }))
  if (liens.length) {
    await supabase.from('client_account_links').upsert(liens, { onConflict: 'user_id,ac_contact', ignoreDuplicates: true })
  }
  await supabase.from('deal_travelers')
    .update({ user_id: client.id, joined_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('email', email).is('user_id', null)

  const dossiers = await espaceDossiers.dossiersDuCompte(client)
  return { contacts: liens.length, dossiers: dossiers.length }
})
