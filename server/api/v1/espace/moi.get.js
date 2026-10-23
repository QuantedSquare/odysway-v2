import { defineEventHandler, setResponseHeaders } from 'h3'

// Compte connecté et ses dossiers.
//
//   GET /api/v1/espace/moi   Authorization: Bearer <jeton Supabase>
//
// Chaque appel rejoue le rattachement par email : un dossier créé depuis la
// dernière visite apparaît sans autre action, et le premier appel EST la
// création du compte côté Odysway. Rien à migrer.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)

  await espaceDossiers.rattacherParEmail(client)
  const dossiers = await espaceDossiers.dossiersDuCompte(client)
  await espaceDossiers.voyageursAJour(dossiers.filter(d => d.role === 'titulaire').map(d => d.deal))

  const contacts = [...new Set(dossiers.map(d => Number(d.deal.contact)))]
  const { data: fiches } = contacts.length
    ? await supabase.from('activecampaign_clients').select('contact, firstname, lastname, email').in('contact', contacts)
    : { data: [] }
  const parContact = new Map((fiches || []).map(f => [Number(f.contact), f]))

  // Le nom : celui de la fiche AC qui porte l'email du compte, sinon celui que
  // donne Google, sinon celui de sa place de voyageur.
  const fiche = (fiches || []).find(f => espaceVoyageur.normaliserEmail(f.email) === client.email)
  let prenom = fiche?.firstname || client.meta.given_name || null
  let nom = fiche?.lastname || client.meta.family_name || null
  if (!prenom) {
    const { data: place } = await supabase.from('deal_travelers').select('firstname, lastname').eq('user_id', client.id).limit(1).maybeSingle()
    prenom = place?.firstname || null
    nom = nom || place?.lastname || null
  }

  // Un compte de l'équipe ne se supprime ni ne change d'email depuis l'espace.
  const equipe = await espaceComptes.estMembreEquipe(client)

  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  return {
    compte: { email: client.email, prenom, nom, equipe },
    aujourdhui,
    dossiers: dossiers
      .map(d => espaceVoyageur.resumeDossier(d, aujourdhui, { contact: parContact.get(Number(d.deal.contact)) }))
      .sort((a, b) => String(a.depart || '9999').localeCompare(String(b.depart || '9999'))),
  }
})
