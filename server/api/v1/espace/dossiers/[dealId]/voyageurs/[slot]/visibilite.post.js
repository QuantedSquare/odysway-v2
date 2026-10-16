import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Apparaître ou non dans la liste du groupe (prénom + initiale), vue par les
// autres voyageurs du même départ.
//
//   POST /api/v1/espace/dossiers/:dealId/voyageurs/:slot/visibilite   { visible: true }
//
// Refusé par défaut (deal_travelers.visible_groupe = false). Décide la
// personne elle-même si elle a un compte ; sinon le titulaire pour elle.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const dossier = await espaceDossiers.dossierDuCompte(client, event.context.params.dealId)
  const slot = Number.parseInt(event.context.params.slot, 10)
  const body = await readBody(event).catch(() => ({}))
  if (typeof body?.visible !== 'boolean') throw createError({ statusCode: 400, statusMessage: '`visible` doit valoir true ou false.' })

  const { data: place } = await supabase.from('deal_travelers')
    .select('id, user_id, is_holder')
    .eq('deal_id', dossier.deal.id).eq('slot', slot).is('removed_at', null).maybeSingle()
  if (!place) throw createError({ statusCode: 404, statusMessage: 'Voyageur introuvable.' })

  const titulaire = dossier.role === 'titulaire'
  const autorise = place.user_id
    ? place.user_id === client.id
    : titulaire // place sans compte, dont celle du titulaire lui-même
  if (!autorise) throw createError({ statusCode: 403, statusMessage: 'Seul ce voyageur peut choisir.' })

  const { error } = await supabase.from('deal_travelers')
    .update({ visible_groupe: body.visible, updated_at: new Date().toISOString() })
    .eq('id', place.id)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Enregistrement impossible pour le moment.' })
  return { slot, visibleGroupe: body.visible }
})
