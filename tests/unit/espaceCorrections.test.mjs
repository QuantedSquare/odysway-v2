// Parcours de correction d'un voyageur et « C'est moi »
// (server/utils/espaceCorrections.js), avec la vraie synchro des voyageurs
// (espaceDossiers.js). AC, Supabase et Slack sont simulés : aucun appel réseau.
//
// Les modules Nitro lisent leurs dépendances par auto-import : hors serveur,
// elles sont posées en global avant l'import.
import assert from 'node:assert/strict'
import { before, beforeEach, describe, it } from 'node:test'

import espaceCorrection from '../../server/utils/espaceCorrection.js'
import espaceVoyageur from '../../server/utils/espaceVoyageur.js'

const DEAL = 17037
const CONTACT = 501

/** Supabase réduit à ce que ces modules appellent, sur des tables en mémoire. */
const creerBase = (tables) => {
  const from = (nom) => {
    const t = (tables[nom] ||= [])
    const filtres = []
    let op = 'select'
    let valeurs = null
    let conflit = null
    let unique = false
    const executer = () => {
      const lignes = t.filter(r => filtres.every(f => f(r)))
      if (op === 'update') {
        lignes.forEach(r => Object.assign(r, valeurs))
        return { data: null, error: null }
      }
      if (op === 'upsert') {
        const cles = conflit.split(',')
        for (const row of [].concat(valeurs)) {
          const existante = t.find(r => cles.every(k => r[k] === row[k]))
          if (existante) Object.assign(existante, row)
          else t.push({ holder_manuel: false, is_holder: false, user_id: null, email: null, ...row })
        }
        return { data: null, error: null }
      }
      if (unique) return { data: lignes[0] ? { ...lignes[0] } : null, error: null }
      return { data: lignes.map(r => ({ ...r })), error: null }
    }
    const q = {
      select: () => q,
      order: () => q,
      eq: (c, v) => (filtres.push(r => r[c] === v), q),
      neq: (c, v) => (filtres.push(r => r[c] !== v), q),
      is: (c, v) => (filtres.push(r => (r[c] ?? null) === v), q),
      in: (c, l) => (filtres.push(r => l.includes(r[c])), q),
      not: (c, o, v) => {
        if (o === 'in') {
          const l = v.slice(1, -1).split(',').map(Number)
          filtres.push(r => !l.includes(r[c]))
        }
        else filtres.push(r => (r[c] ?? null) !== v)
        return q
      },
      maybeSingle: () => ((unique = true), q),
      update: v => ((op = 'update'), (valeurs = v), q),
      upsert: (rows, o) => ((op = 'upsert'), (valeurs = rows), (conflit = o.onConflict), q),
      then: (res, rej) => Promise.resolve().then(executer).then(res, rej),
    }
    return q
  }
  return { from }
}

let tables
let ac
let appels
let corrections
let espaceDossiers

const place = (slot, raw, extra = {}) => {
  const v = espaceVoyageur.lireVoyageur(raw)
  return {
    id: `p${slot}`, deal_id: DEAL, slot, raw, firstname: v.firstname, lastname: v.lastname, birthdate: v.birthdate, iso: v.iso,
    is_holder: false, holder_manuel: false, user_id: null, email: null, removed_at: null, ...extra,
  }
}

const dossier = ({ role = 'titulaire', depart = '2027-03-14', billets = false } = {}) => ({
  role,
  deal: { id: DEAL, contact: CONTACT, departure_date: depart, flight_ticket_bought: billets },
  date: { departure_date: depart },
  reservation: null,
})

const client = { id: 'u-camille', email: 'camille@exemple.fr' }

before(async () => {
  globalThis.espaceVoyageur = espaceVoyageur
  globalThis.espaceCorrection = espaceCorrection
  globalThis.useStorage = () => ({ setItem: () => Promise.resolve(), getItem: () => Promise.resolve(null) })
  globalThis.dealMirrorSync = {
    lireDeal: () => Promise.resolve().then(() => {
      appels.push('lireDeal')
      if (ac.lectureEnPanne) throw new Error('AC injoignable')
      return { deal: { ...ac.deal }, champs: { ...ac.champs }, fusion: { ...ac.deal, ...ac.champs } }
    }),
  }
  globalThis.activecampaign = {
    getDealCustomFields: () => Promise.resolve({ ...ac.champs }),
    updateDeal: (id, plat) => Promise.resolve().then(() => {
      appels.push(['updateDeal', id, plat])
      if (ac.ecritureEnPanne) throw new Error('422')
      Object.assign(ac.champs, plat)
    }),
    addNote: (id, corps) => Promise.resolve().then(() => {
      appels.push(['addNote', id, corps.note.note])
      if (ac.noteEnPanne) throw new Error('note')
    }),
  }
  globalThis.slack = {
    alertCorrectionVoyageur: (p) => {
      appels.push(['slack', p])
      return Promise.resolve(false)
    },
  }
  espaceDossiers = (await import('../../server/utils/espaceDossiers.js')).default
  globalThis.espaceDossiers = espaceDossiers
  corrections = (await import('../../server/utils/espaceCorrections.js')).default
})

beforeEach(() => {
  appels = []
  ac = {
    deal: { id: String(DEAL), group: '2' },
    champs: {
      traveler1: 'Camille_Rousseau_12/06/1979_FR',
      traveler2: 'Julien_Rouseau_03/02/1977_FR',
      traveler3: 'Inès_Rousseau_03/04/2015_FR',
      flightTicketBought: 'Non',
      insurance: 'Multirisque',
    },
  }
  tables = {
    deal_travelers: [
      place(1, ac.champs.traveler1, { is_holder: true }),
      place(2, ac.champs.traveler2, { user_id: 'u-julien' }),
      place(3, ac.champs.traveler3),
    ],
    activecampaign_clients: [{ contact: CONTACT, firstname: 'Camille', lastname: 'Rousseau' }],
  }
  globalThis.supabase = creerBase(tables)
})

const ligne = slot => tables.deal_travelers.find(p => p.slot === slot)
const appel = nom => appels.filter(a => Array.isArray(a) && a[0] === nom)
const julien = { prenom: 'Julien', nom: 'Rouseau', dateNaissance: '1977-02-03' }

const refus = async (promesse, statusCode, code) => {
  await assert.rejects(promesse, (err) => {
    assert.equal(err.statusCode, statusCode)
    if (code) assert.equal(err.data?.code, code)
    return true
  })
}

describe('corrigerIdentite', () => {
  it('réécrit le champ AC au format du tunnel, note signée, voyageurs resynchronisés, Slack prévenu', async () => {
    const r = await corrections.corrigerIdentite({ client, dossier: dossier(), slot: '2', avant: julien, saisie: { ...julien, nom: 'Rousseau' } })

    assert.equal(r.resultat, 'corrige')
    assert.deepEqual(appel('updateDeal'), [['updateDeal', DEAL, { traveler2: 'Julien_Rousseau_03/02/1977_FR' }]])
    assert.deepEqual(appel('addNote'), [['addNote', DEAL, 'Correction depuis l\'Espace Voyageur par camille@exemple.fr : Voyageur 2 « Julien_Rouseau_03/02/1977_FR » → « Julien_Rousseau_03/02/1977_FR »']])
    assert.equal(r.note, true)
    assert.equal(ligne(2).lastname, 'Rousseau')
    assert.equal(ligne(2).raw, 'Julien_Rousseau_03/02/1977_FR')
    assert.equal(ligne(2).user_id, 'u-julien') // ce qu'AC ne porte pas est gardé
    const [[, alerte]] = appel('slack')
    assert.equal(alerte.personneChangee, false)
    assert.equal(alerte.assurance, true)
  })

  it('signale une autre personne et ne parle pas de Chapka avant le premier paiement', async () => {
    ac.deal.group = '1'
    await corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { prenom: 'Paul', nom: 'Durand', dateNaissance: '1980-01-01' } })
    const [[, alerte]] = appel('slack')
    assert.equal(alerte.personneChangee, true)
    assert.equal(alerte.assurance, false)
  })

  it('sa propre place reste « (vous) » quand le nouveau nom ne correspond plus au contact', async () => {
    const avant = { prenom: 'Camille', nom: 'Rousseau', dateNaissance: '1979-06-12' }
    await corrections.corrigerIdentite({ client, dossier: dossier(), slot: 1, avant, saisie: { ...avant, nom: 'Rousseau-Martin' } })
    assert.equal(ligne(1).holder_manuel, true)
    assert.equal(ligne(1).is_holder, true)
    assert.equal(tables.deal_travelers.filter(p => p.is_holder).length, 1)
  })

  it('409 si AC ne porte plus ce que la page affichait ; rien n’est écrit, la place est relue', async () => {
    ac.champs.traveler2 = 'Julien_Rousseau_03/02/1977_FR' // corrigé par l'équipe entre-temps
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, prenom: 'Jules' } }), 409, 'modifie')
    assert.equal(appel('updateDeal').length, 0)
    assert.equal(ligne(2).lastname, 'Rousseau')
  })

  it('409 si les billets sont émis dans AC, même si le miroir ne le sait pas encore', async () => {
    ac.champs.flightTicketBought = '||Oui||'
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, nom: 'Rousseau' } }), 409, 'verrouille')
    assert.equal(appel('updateDeal').length, 0)
  })

  it('409 à moins de 30 jours du départ, sans lire AC', async () => {
    const proche = espaceVoyageur.aujourdhuiParis()
    await refus(corrections.corrigerIdentite({ client, dossier: dossier({ depart: proche }), slot: 2, avant: julien, saisie: julien }), 409, 'verrouille')
    await refus(corrections.corrigerIdentite({ client, dossier: dossier({ billets: true }), slot: 2, avant: julien, saisie: julien }), 409, 'verrouille')
    assert.equal(appels.includes('lireDeal'), false)
  })

  it('400 avec les champs en erreur, sans lire AC', async () => {
    await assert.rejects(
      corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { prenom: 'Jul_ien', nom: '', dateNaissance: '1977-02-30' } }),
      (err) => {
        assert.equal(err.statusCode, 400)
        assert.deepEqual(Object.keys(err.data.erreurs).sort(), ['dateNaissance', 'nom', 'prenom'])
        return true
      },
    )
    assert.equal(appels.includes('lireDeal'), false)
  })

  it('409 pour la date de naissance d’un mineur ; son nom reste corrigeable', async () => {
    const ines = { prenom: 'Inès', nom: 'Rousseau', dateNaissance: '2015-04-03' }
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 3, avant: ines, saisie: { ...ines, dateNaissance: '2015-05-03' } }), 409, 'age')
    const r = await corrections.corrigerIdentite({ client, dossier: dossier(), slot: 3, avant: ines, saisie: { ...ines, prenom: 'Inés' } })
    assert.equal(r.resultat, 'corrige')
    assert.equal(ac.champs.traveler3, 'Inés_Rousseau_03/04/2015_FR')
  })

  it('rien à écrire quand rien ne change', async () => {
    const r = await corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, prenom: ' Julien ' } })
    assert.equal(r.resultat, 'inchange')
    assert.equal(appel('updateDeal').length, 0)
    assert.equal(appel('slack').length, 0)
  })

  it('un voyageur invité ne corrige rien ; une place absente est introuvable', async () => {
    await refus(corrections.corrigerIdentite({ client, dossier: dossier({ role: 'voyageur' }), slot: 2, avant: julien, saisie: julien }), 404)
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 9, avant: julien, saisie: julien }), 404)
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 'abc', avant: julien, saisie: julien }), 404)
  })

  it('502 si AC refuse l’écriture : ni note ni Slack ; une note en échec ne fait pas échouer la correction', async () => {
    ac.ecritureEnPanne = true
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, nom: 'Rousseau' } }), 502)
    assert.equal(appel('addNote').length, 0)
    assert.equal(appel('slack').length, 0)

    ac.ecritureEnPanne = false
    ac.noteEnPanne = true
    const r = await corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, nom: 'Rousseau' } })
    assert.equal(r.resultat, 'corrige')
    assert.equal(r.note, false)
  })

  it('502 si AC est injoignable à la lecture', async () => {
    ac.lectureEnPanne = true
    await refus(corrections.corrigerIdentite({ client, dossier: dossier(), slot: 2, avant: julien, saisie: { ...julien, nom: 'Rousseau' } }), 502)
  })
})

describe('designerTitulaire (« C’est moi »)', () => {
  beforeEach(() => {
    // Camille est inscrite sous son nom d'usage : le nom ne la retrouve pas.
    ac.champs.traveler1 = 'Camille_Rousseau-Martin_12/06/1979_FR'
    Object.assign(ligne(1), place(1, ac.champs.traveler1))
  })

  it('pose la place choisie, que la synchro AC garde ensuite', async () => {
    assert.deepEqual(await corrections.designerTitulaire({ client, dossier: dossier(), slot: 1 }), { slot: 1 })
    assert.equal(ligne(1).is_holder, true)
    assert.equal(ligne(1).holder_manuel, true)

    await espaceDossiers.synchroniserVoyageurs(DEAL, { fusion: ac.champs, contact: { firstname: 'Camille', lastname: 'Rousseau' } })
    assert.equal(ligne(1).is_holder, true)
    assert.equal(tables.deal_travelers.filter(p => p.is_holder).length, 1)
  })

  it('le choix l’emporte sur une autre place qui porte le nom du contact', async () => {
    ac.champs.traveler3 = 'Camille_Rousseau_01/01/1950_FR'
    Object.assign(ligne(3), place(3, ac.champs.traveler3))
    await corrections.designerTitulaire({ client, dossier: dossier(), slot: 1 })
    await espaceDossiers.synchroniserVoyageurs(DEAL, { fusion: ac.champs, contact: { firstname: 'Camille', lastname: 'Rousseau' } })
    assert.deepEqual(tables.deal_travelers.filter(p => p.is_holder).map(p => p.slot), [1])

    // Changer d'avis : une seule place choisie par deal.
    await corrections.designerTitulaire({ client, dossier: dossier(), slot: 3 })
    assert.deepEqual(tables.deal_travelers.filter(p => p.holder_manuel).map(p => p.slot), [3])
    assert.deepEqual(tables.deal_travelers.filter(p => p.is_holder).map(p => p.slot), [3])

    // « Ce n'est pas moi » : retour à la reconnaissance par le nom.
    ac.champs.traveler3 = 'Camille_Rousseau_01/01/1950_FR'
    assert.deepEqual(await corrections.designerTitulaire({ client, dossier: dossier(), slot: null }), { slot: 3 })
    assert.equal(tables.deal_travelers.some(p => p.holder_manuel), false)
  })

  it('retour au nom sans aucune place correspondante : plus personne n’est titulaire', async () => {
    await corrections.designerTitulaire({ client, dossier: dossier(), slot: 1 })
    assert.deepEqual(await corrections.designerTitulaire({ client, dossier: dossier(), slot: null }), { slot: null })
    assert.equal(tables.deal_travelers.some(p => p.is_holder || p.holder_manuel), false)
  })

  it('refuse la place d’un autre compte ou invitée ailleurs, et les non-titulaires', async () => {
    await refus(corrections.designerTitulaire({ client, dossier: dossier(), slot: 2 }), 409)
    ligne(3).email = 'ines@exemple.fr'
    await refus(corrections.designerTitulaire({ client, dossier: dossier(), slot: 3 }), 409)
    await refus(corrections.designerTitulaire({ client, dossier: dossier({ role: 'voyageur' }), slot: 1 }), 404)
    await refus(corrections.designerTitulaire({ client, dossier: dossier(), slot: 12 }), 404)
    assert.equal(tables.deal_travelers.some(p => p.holder_manuel), false)
  })
})
