// Démo locale de l'Espace Voyageur : données de la maquette, aucun appel à
// Supabase ni à /api/v1/espace. Chargé par useEspace.js UNIQUEMENT sous
// `import.meta.dev` avec NUXT_PUBLIC_ESPACE_DEMO=true : absent de tout build.
//
// Code de connexion : 123456. Mot de passe : celui défini dans la page Sécurité
// (gardé dans sessionStorage). « Continuer avec Google » ouvre une session
// vieille de 2 heures, pour voir la reconfirmation par code avant le mot de passe.
//
// Camille figure dans AC sous son nom d'usage (« Rousseau-Martin ») : l'espace
// ne la reconnaît pas parmi ses voyageurs, pour montrer « C'est moi ». « Corriger »
// passe par les vraies règles (espaceCorrection.js) ; le voyage au Maroc, passé,
// montre le verrou « contactez-nous ».

import espaceCorrection from '../../server/utils/espaceCorrection.js'
import espaceDocument from '../../server/utils/espaceDocument.js'
import espaceProfil from '../../server/utils/espaceProfil.js'

const CODE = '123456'
const CLE = 'odysway-espace-demo'

const lire = (cle, defaut) => {
  try {
    return JSON.parse(sessionStorage.getItem(`${CLE}:${cle}`)) ?? defaut
  }
  catch {
    return defaut
  }
}
const ecrire = (cle, valeur) => {
  try {
    sessionStorage.setItem(`${CLE}:${cle}`, JSON.stringify(valeur))
  }
  catch {
    // navigation privée : la démo repart de zéro au rechargement
  }
}

const jeton = (methode, ageMinutes = 0) => {
  const charge = { sub: 'demo', amr: [{ method: methode, timestamp: Math.floor(Date.now() / 1000) - ageMinutes * 60 }] }
  return `demo.${btoa(JSON.stringify(charge)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.demo`
}

const nouvelleSession = (email, methode, ageMinutes = 0) => ({
  access_token: jeton(methode, ageMinutes),
  user: {
    id: 'demo',
    email,
    identities: methode === 'oauth' ? [{ provider: 'email' }, { provider: 'google' }] : [{ provider: 'email' }],
    user_metadata: { mot_de_passe: !!lire('motDePasse', null) },
  },
})

const erreur = (code, message) => ({ code, message })

export const creerAuthDemo = () => {
  const abonnes = []
  const changer = (s) => {
    ecrire('session', s)
    abonnes.forEach(f => f(s ? 'SIGNED_IN' : 'SIGNED_OUT', s))
  }
  return {
    getSession: () => Promise.resolve({ data: { session: lire('session', null) } }),
    onAuthStateChange: (f) => {
      abonnes.push(f)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithOtp: ({ email }) => Promise.resolve().then(() => {
      ecrire('emailCode', email)
      return { error: null }
    }),
    verifyOtp: ({ email, token }) => Promise.resolve().then(() => {
      if (token !== CODE) return { data: {}, error: erreur('otp_expired', 'Token has expired or is invalid') }
      const s = nouvelleSession(email, 'otp')
      changer(s)
      return { data: { session: s }, error: null }
    }),
    signInWithPassword: ({ email, password }) => Promise.resolve().then(() => {
      const attendu = lire('motDePasse', null)
      if (!attendu || attendu.email !== email || attendu.valeur !== password) {
        return { data: {}, error: erreur('invalid_credentials', 'Invalid login credentials') }
      }
      const s = nouvelleSession(email, 'password')
      changer(s)
      return { data: { session: s }, error: null }
    }),
    signInWithOAuth: ({ options }) => Promise.resolve().then(() => {
      changer(nouvelleSession('camille.rousseau@email.fr', 'oauth', 120))
      window.location.assign(options.redirectTo)
      return { error: null }
    }),
    updateUser: ({ password }) => Promise.resolve().then(() => {
      const s = lire('session', null)
      if (!s) return { data: {}, error: erreur('session_not_found', 'No session') }
      ecrire('motDePasse', { email: s.user.email, valeur: password })
      const user = { ...s.user, user_metadata: { ...s.user.user_metadata, mot_de_passe: true } }
      ecrire('session', { ...s, user })
      return { data: { user }, error: null }
    }),
    signOut: () => Promise.resolve().then(() => {
      changer(null)
      return { error: null }
    }),
  }
}

const auj = () => new Date().toISOString().slice(0, 10)
const joursAvant = date => Math.round((Date.parse(date) - Date.parse(auj())) / 86400000)

const nepal = () => ({
  id: 17037,
  role: 'titulaire',
  slug: 'trek-pays-sherpas-nepal',
  titre: 'Trek au pays des Sherpas',
  pays: 'Népal',
  depart: '2027-03-14',
  retour: '2027-03-25',
  duree: 12,
  joursAvantDepart: joursAvant('2027-03-14'),
  etat: 'a_venir',
  nbVoyageurs: 3,
  groupe: true,
  conseiller: 'Léa',
  option: null,
  paiement: { total: 2890, paye: 870, reste: 2020, echeance: '2027-01-13', delaiJours: 60, joursAvantEcheance: joursAvant('2027-01-13'), statut: 'a_regler' },
})

const maroc = () => ({
  id: 15188,
  role: 'titulaire',
  slug: 'immersion-berberes-maroc',
  titre: 'Immersion chez les Berbères',
  pays: 'Maroc',
  depart: '2025-05-12',
  retour: '2025-05-19',
  duree: 8,
  joursAvantDepart: null,
  etat: 'passe',
  nbVoyageurs: 2,
  groupe: true,
  conseiller: 'Léa',
  option: null,
  paiement: { total: 1980, paye: 1980, reste: 0, echeance: '2025-03-13', delaiJours: 60, joursAvantEcheance: joursAvant('2025-03-13'), statut: 'solde' },
})

const voyageurs = () => lire('voyageurs', [
  { slot: 1, prenom: 'Camille', nom: 'Rousseau-Martin', dateNaissance: '1979-06-12', titulaire: false, titulaireChoisi: false, peutSeDesigner: true, moi: false, visibleGroupe: false, peutChangerVisibilite: true, invitation: null, email: null, peutInviter: true },
  { slot: 2, prenom: 'Julien', nom: 'Rousseau', dateNaissance: '1977-02-03', titulaire: false, titulaireChoisi: false, peutSeDesigner: false, moi: false, visibleGroupe: true, peutChangerVisibilite: false, invitation: 'rejoint', email: 'julien.rousseau@email.fr', peutInviter: false },
  { slot: 3, prenom: 'Inès', nom: 'Rousseau', dateNaissance: '2015-04-03', titulaire: false, titulaireChoisi: false, peutSeDesigner: true, moi: false, visibleGroupe: false, peutChangerVisibilite: true, invitation: null, email: null, peutInviter: true },
])

// « C'est moi » sur `slot`, ou null : le contact AC (Camille Rousseau) ne
// correspond à aucune place par le nom.
const designer = slot => ecrire('voyageurs', voyageurs().map((v) => {
  const moi = v.slot === slot
  return { ...v, moi, titulaire: moi, titulaireChoisi: moi, peutInviter: !moi && v.invitation !== 'rejoint' }
}))

const correction = (dossier) => {
  const verrou = espaceCorrection.verrouCorrection({ billetsAchetes: false, depart: dossier.depart, aujourdhui: auj() })
  return { possible: !verrou, verrou, message: verrou ? espaceCorrection.MESSAGES_VERROU[verrou] : null }
}

// Profils au format de la table traveler_profiles, pour réutiliser les vraies
// règles (espaceProfil.js). Julien (place 2) a son propre compte : profil
// complet, que Camille ne peut pas ouvrir.
const RETOUR = '2027-03-25'
const profils = () => lire('profils', {
  2: { piece_type: 'passeport', piece_numero_chiffre: 'demo', piece_numero_fin: '7731', piece_expiration: '2031-05-02', regimes: ['tout'], urgence_nom: 'Camille Rousseau', urgence_telephone: '+33 6 24 55 18 03' },
})
const modifiable = slot => slot !== 2
const avecProfils = liste => liste.map((v) => {
  const c = espaceProfil.completude(profils()[v.slot] || null, { retour: RETOUR })
  return { ...v, peutModifierProfil: modifiable(v.slot), profil: { complet: c.complet, manques: c.manques, expireTropTot: c.expireTropTot } }
})
// Documents au format de la table trip_documents, passés par les vraies règles.
const DOCS = [
  { id: 'doc-fiche', type: 'fiche_voyage', titre: 'Fiche voyage — Népal', description: 'Programme jour par jour, équipement, vaccins', mime_type: 'application/pdf', taille: 1468006, publie: true, publie_le: '2026-09-02T09:00:00Z' },
  { id: 'doc-carnet', type: 'carnet', titre: 'Carnet de séjour', description: 'Hébergements, contacts sur place', mime_type: 'application/pdf', taille: 900000, publie: true, publie_le: '2026-09-02T09:00:00Z', disponible_le: '2027-02-12' },
  { id: 'doc-assurance', type: 'assurance', titre: 'Contrat d\'assurance', description: 'Multirisque Odysway', mime_type: 'application/pdf', taille: 245760, publie: true, publie_le: '2026-09-04T09:00:00Z' },
  { id: 'doc-facture', type: 'facture', titre: 'Facture d\'acompte — 870 €', mime_type: 'application/pdf', taille: 98304, publie: true, publie_le: '2026-09-04T08:00:00Z', reserve_titulaire: true },
]
const documentsDemo = () => {
  const vus = lire('documentsVus', [])
  const auj = new Date().toISOString().slice(0, 10)
  return DOCS.map(d => espaceDocument.vueClient(d, { aujourdhui: auj, vu: vus.includes(d.id) })).sort(espaceDocument.trier)
}

const erreurDemo = (statusCode, statusMessage, data) => Object.assign(new Error(statusMessage), { statusCode, data: { statusMessage, data } })

export const reponseDemo = async (chemin, options = {}, session) => {
  await new Promise(r => setTimeout(r, 250))
  const corps = options.body || {}

  if (chemin === 'moi') {
    return { compte: { email: session.user.email, prenom: 'Camille', nom: 'Rousseau' }, aujourdhui: auj(), dossiers: [nepal(), maroc()] }
  }

  const visibilite = /^dossiers\/\d+\/voyageurs\/(\d+)\/visibilite$/.exec(chemin)
  if (visibilite) {
    ecrire('voyageurs', voyageurs().map(v => (v.slot === +visibilite[1] ? { ...v, visibleGroupe: corps.visible } : v)))
    return { slot: +visibilite[1], visibleGroupe: corps.visible }
  }

  const invitation = /^dossiers\/\d+\/voyageurs\/(\d+)\/invitation$/.exec(chemin)
  if (invitation) {
    ecrire('voyageurs', voyageurs().map(v => (v.slot === +invitation[1] ? { ...v, email: corps.email, invitation: corps.email ? 'envoyee' : null } : v)))
    return { slot: +invitation[1], invitation: corps.email ? 'envoyee' : null, email: corps.email }
  }

  const titulaire = /^dossiers\/\d+\/titulaire$/.exec(chemin)
  if (titulaire) {
    designer(corps.slot)
    return { slot: corps.slot }
  }

  const identite = /^dossiers\/(\d+)\/voyageurs\/(\d+)\/identite$/.exec(chemin)
  if (identite) {
    const base = +identite[1] === 15188 ? maroc() : nepal()
    const c = correction(base)
    if (!c.possible) throw erreurDemo(409, c.message, { code: 'verrouille', verrou: c.verrou })
    const { identite: nouvelle, erreurs } = espaceCorrection.validerIdentite(corps.apres, { aujourdhui: auj() })
    if (!nouvelle) throw erreurDemo(400, 'Formulaire invalide.', { erreurs })
    const v = voyageurs().find(x => x.slot === +identite[2])
    const actuel = { prenom: v.prenom, nom: v.nom, dateNaissance: v.dateNaissance }
    if (!espaceCorrection.memeIdentite(actuel, corps.avant)) throw erreurDemo(409, 'Ce voyageur a été modifié entre-temps : rechargez la page pour voir la version à jour.', { code: 'modifie' })
    if (espaceCorrection.memeIdentite(actuel, nouvelle)) return { resultat: 'inchange', voyageur: { slot: v.slot, ...actuel } }
    if (espaceCorrection.ageEnJeu({ avant: actuel, apres: nouvelle, depart: base.depart, aujourdhui: auj() })) {
      throw erreurDemo(409, 'La date de naissance d\'un voyageur mineur peut changer le tarif : contactez-nous pour la corriger.', { code: 'age' })
    }
    ecrire('voyageurs', voyageurs().map(x => (x.slot === v.slot ? { ...x, ...nouvelle } : x)))
    return { resultat: 'corrige', voyageur: { slot: v.slot, ...nouvelle }, note: true }
  }

  const dossier = /^dossiers\/(\d+)$/.exec(chemin)
  if (dossier) {
    const base = +dossier[1] === 15188 ? maroc() : nepal()
    return {
      ...base,
      lienPaiement: base.paiement.reste > 0 ? '/checkout?type=balance&booked_id=demo&step=1' : null,
      correction: correction(base),
      carnet: null,
      paiements: { complet: true, paiements: [{ le: '2026-09-04T10:00:00Z', montant: 870, rembourse: 0, moyen: 'carte', statut: 'paye', via: 'Stripe' }] },
      voyageurs: avecProfils(voyageurs()),
      documents: +dossier[1] === 15188 ? [] : documentsDemo(),
      compagnons: { visibles: ['Paul D.', 'Hélène M.'], autres: 4 },
    }
  }

  if (chemin === 'profils') {
    return {
      profils: voyageurs().filter(v => modifiable(v.slot)).map((v) => {
        const c = espaceProfil.completude(profils()[v.slot] || null, { retour: RETOUR })
        return { dossier: { id: 17037, slug: 'trek-pays-sherpas-nepal', titre: 'Trek au pays des Sherpas', depart: '2027-03-14' }, slot: v.slot, prenom: v.prenom, nom: v.nom, moi: v.moi, completude: c }
      }),
    }
  }

  const profil = /^dossiers\/\d+\/voyageurs\/(\d+)(?:\/(profil|piece))?$/.exec(chemin)
  if (profil) {
    const slot = +profil[1]
    if (!modifiable(slot)) throw erreurDemo(404, 'Voyageur introuvable.')
    const v = voyageurs().find(x => x.slot === slot)
    const tous = profils()
    const ligne = tous[slot] || null
    const methode = (options.method || 'GET').toUpperCase()
    const vue = l => espaceProfil.vueProfil(l, { retour: RETOUR })

    if (!profil[2]) {
      return {
        voyageur: { slot, prenom: v.prenom, nom: v.nom, moi: v.moi },
        dossier: { id: 17037, retour: RETOUR },
        regimesDisponibles: espaceProfil.REGIMES,
        validiteMois: espaceProfil.VALIDITE_MOIS_APRES_RETOUR,
        conservationScanJours: espaceProfil.CONSERVATION_SCAN_JOURS,
        profil: vue(ligne),
        precedent: !ligne && v.moi ? { misAJourLe: '2025-05-02T10:00:00Z', pieceNumeroFin: '4521', pieceType: 'passeport' } : null,
      }
    }

    if (profil[2] === 'profil') {
      let nouvelle
      if (corps.reprendre) {
        nouvelle = { piece_type: 'passeport', piece_numero_chiffre: 'demo', piece_numero_fin: '4521', piece_expiration: '2029-11-30', piece_pays: 'FR', regimes: ['vegetarien', 'sans_gluten'], allergies: 'Arachides (allergie sévère)', urgence_nom: 'Julien Rousseau', urgence_lien: 'Conjoint', urgence_telephone: '+33 6 11 22 33 44' }
      }
      else {
        nouvelle = {
          ...ligne,
          piece_type: corps.pieceType || null,
          piece_expiration: corps.pieceExpiration || null,
          piece_pays: corps.piecePays || null,
          regimes: espaceProfil.normaliserRegimes(corps.regimes),
          allergies: corps.allergies || null,
          urgence_nom: corps.urgenceNom || null,
          urgence_lien: corps.urgenceLien || null,
          urgence_telephone: corps.urgenceTelephone || null,
          notes: corps.notes || null,
        }
        if (corps.pieceNumero === null) Object.assign(nouvelle, { piece_numero_chiffre: null, piece_numero_fin: null })
        else if (corps.pieceNumero !== undefined) {
          const n = espaceProfil.normaliserNumero(corps.pieceNumero)
          if (!espaceProfil.numeroValide(n)) throw erreurDemo(400, 'Numéro de pièce invalide : 5 à 20 lettres ou chiffres.')
          Object.assign(nouvelle, { piece_numero_chiffre: 'demo', piece_numero_fin: n.slice(-4) })
        }
      }
      nouvelle.updated_at = new Date().toISOString()
      ecrire('profils', { ...tous, [slot]: nouvelle })
      return { profil: vue(nouvelle) }
    }

    // Copie de la pièce : seules ses métadonnées sont gardées en démo.
    if (methode === 'POST') {
      const fichier = corps.get?.('fichier')
      ecrire('profils', { ...tous, [slot]: { ...ligne, scan_path: 'demo', scan_type: fichier?.type || 'image/jpeg', scan_taille: fichier?.size || 0, scan_depose_le: new Date().toISOString() } })
      return { scan: { type: fichier?.type, taille: fichier?.size } }
    }
    if (methode === 'DELETE') {
      ecrire('profils', { ...tous, [slot]: { ...ligne, scan_path: null, scan_type: null, scan_taille: null, scan_depose_le: null } })
      return { supprime: true }
    }
    return { url: 'data:text/html;charset=utf-8,' + encodeURIComponent('<p style="font-family:sans-serif;padding:2em">Démo : la copie de la pièce s\'ouvrirait ici, par un lien valable 60 secondes.</p>'), expireDans: 60 }
  }

  if (chemin === 'documents') {
    return { dossiers: [{ ...nepal(), documents: documentsDemo() }, { ...maroc(), documents: [] }] }
  }
  const lienDoc = /^documents\/([\w-]+)\/lien$/.exec(chemin)
  if (lienDoc) {
    ecrire('documentsVus', [...new Set([...lire('documentsVus', []), lienDoc[1]])])
    // blob: plutôt que data: — les navigateurs refusent d'y naviguer.
    const blob = new Blob(['Démo Odysway : le vrai document se téléchargerait ici, par un lien valable 60 secondes.'], { type: 'text/plain' })
    return { url: URL.createObjectURL(blob), expireDans: 60 }
  }

  if (chemin === 'rattachement/code') return { envoye: true }
  if (chemin === 'rattachement/verifier') {
    if (corps.code !== CODE) throw Object.assign(new Error('Code'), { statusCode: 400, data: { statusMessage: 'Code incorrect ou expiré. Demandez-en un nouveau.' } })
    return { contacts: 1, dossiers: 2 }
  }

  throw erreurDemo(404, 'Dossier introuvable.')
}
