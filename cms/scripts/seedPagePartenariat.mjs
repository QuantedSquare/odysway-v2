/* eslint-env node */
// Amorce le document `page_partenariat` avec les textes de la maquette validée.
//
// Écrit un BROUILLON (drafts.page_partenariat), et seulement s'il n'existe ni
// brouillon ni version publiée : ne remplace jamais une page déjà éditée.
// À relire et publier dans le Studio, après avoir ajouté les photos (hero,
// agence, formulaire), de vrais cas partenaires et des avis vérifiés : les cas
// et avis de la maquette sont fictifs et volontairement absents d'ici.
//
//   cd cms && SANITY_WRITE_TOKEN=… node scripts/seedPagePartenariat.mjs
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import process from 'node:process'
import {log, error} from 'node:console'
import {randomUUID} from 'node:crypto'

dotenv.config()

const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  error('SANITY_WRITE_TOKEN manquant')
  process.exit(1)
}
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'nu6yntji',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  token,
  useCdn: false,
})

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

// Paragraphe portable text ; les segments entre ** sont en gras.
const para = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => {
    const bold = part.startsWith('**')
    return {_type: 'span', _key: key(), text: bold ? part.slice(2, -2) : part, marks: bold ? ['strong'] : []}
  }),
})
const withKeys = (items) => items.map((item) => ({_key: key(), ...item}))

const doc = {
  _id: 'drafts.page_partenariat',
  _type: 'page_partenariat',
  seo: {
    _type: 'seo',
    metaTitle: 'Devenir partenaire Odysway',
    metaDescription: 'Vous accompagnez un groupe et vous avez un séjour en tête. Odysway devient l\'agence qui le contractualise, l\'encadre et le fait partir.',
  },
  hero: {
    title: 'On voyage aussi pour ce qui nous rassemble.',
    leads: [
      'Une passion que l\'on veut explorer. Une personne qui nous inspire. Une communauté dans laquelle on se sent bien.',
      'Le voyage devient une occasion de se retrouver et de vivre pleinement ce qui nous anime. La destination accueille l\'expérience, les personnes avec qui on la partage lui donnent sa dimension.',
    ],
    punch: 'Vous êtes coach, photographe, professeur ou créateur ? Faites vivre cette expérience à votre communauté.',
    ctaText: 'Parlons de votre projet',
    trustItems: withKeys([
      {value: '+50 accompagnants', label: 'déjà accompagnés sur leurs voyages'},
      {value: '+8 000 voyageurs', label: 'partis avec Odysway'},
      {value: 'APST & Atout France', label: 'garantie financière'},
      {value: 'Depuis 2018', label: 'agence de voyages'},
    ]),
  },
  subnav: {
    label: 'Devenir partenaire',
    partenaires: 'Nos partenaires',
    cadre: 'L\'agence Odysway',
    preuves: 'Exemples',
    modeles: 'Comment ça marche',
    faq: 'Questions',
    ctaText: 'Décrire mon projet',
  },
  partenaires: {
    eyebrow: 'Nos partenaires',
    title: 'Ceux qui vous suivent ont peut-être envie de partir avec vous.',
    text: [
      para('Vous êtes photographe, coach, professeur de yoga ou créateur. Autour de vous, des personnes se retrouvent dans votre pratique et votre façon de transmettre.'),
      para('Un voyage prolonge ce lien : pratiquer la photo ensemble au fil d\'un itinéraire, réunir ses élèves pour une retraite, emmener ses clients ailleurs. Vous apportez l\'intention, le savoir-faire et la confiance.'),
    ],
    profiles: ['Professeurs de yoga', 'Coachs et thérapeutes', 'Photographes', 'Créateurs de contenu', 'Sportifs et clubs', 'Associations', 'Experts et formateurs', 'Entreprises'],
    momentTitle: 'C\'est le bon moment si...',
    momentItems: [
      'Vous avez déjà un groupe, ou des personnes qui vous ont dit vouloir partir avec vous',
      'Vous cherchez une agence pour gérer la logistique et le cadre légal',
      'Votre projet est déjà avancé : une thématique, une période, une destination en tête',
      'Vous voulez rester au contact de votre communauté et déléguer tout le reste',
    ],
  },
  cadre: {
    eyebrow: 'L\'agence Odysway',
    title: 'Pour faire vivre cette expérience, il faut aussi organiser un voyage.',
    text: [
      para('Derrière les moments partagés, il y a des hébergements à réserver, des prestataires à coordonner, des paiements à encaisser et des voyageurs à accompagner.'),
      para('Dès que plusieurs prestations sont vendues ensemble, le séjour devient un forfait touristique : immatriculation, garantie financière, contrats voyageurs et responsabilité de l\'organisation.'),
      para('**C\'est là qu\'Odysway intervient, par le portage.** Vous nous confiez le rôle d\'agence organisatrice. Que le programme soit déjà bouclé ou entièrement à construire, seul le périmètre change.'),
    ],
    includedTitle: 'Toujours compris',
    includedItems: [
      'Le statut d\'agence organisatrice et la responsabilité qui va avec',
      'Les contrats voyageurs et l\'information précontractuelle',
      'Les inscriptions, les acomptes et les soldes',
      'La garantie financière APST et les assurances',
      'Le règlement des prestataires',
      'Les modifications et les annulations',
      'L\'assistance avant le départ',
    ],
    scopeTitle: 'Selon le périmètre que vous nous confiez',
    scopeItems: [
      'La réservation des vols et des trains de vos participants',
      'Le conseil voyage et la préparation avant départ',
      'L\'accompagnement sur les formalités',
      'Les demandes individuelles des voyageurs',
      'La recherche et la négociation des prestataires locaux',
      'La construction du séjour : destination, itinéraire, hébergements, budget et prix de vente',
    ],
    priceLabel: 'Notre rémunération',
    priceRate: 'De 10 à 15 % de commission',
    priceNote: [
      para('**10 %** quand le séjour est déjà construit et les prestataires identifiés. **Jusqu\'à 15 %** quand nous construisons le voyage et prenons les réservations. Le taux se fixe projet par projet.'),
    ],
    footnote: 'Vos frais d\'accompagnement (vol, hébergement, transferts) peuvent être intégrés au prix du voyage, qui couvre les prestations, l\'accompagnement, la part qui vous revient et notre commission.',
    ctaText: 'Parlons de votre projet',
    ctaNote: 'On vous dit en un appel ce qu\'Odysway prendrait en charge sur votre séjour.',
  },
  preuves: {
    eyebrow: 'Ils sont partis',
    title: 'Quelques exemples de partenariats.',
    cases: [],
    reviewsTitle: 'Et ce que vos voyageurs en disent',
    reviewsScore: '4,9',
    reviewsScoreLabel: 'sur Trustpilot',
    reviews: [],
  },
  modeles: {
    eyebrow: 'Comment ça marche',
    title: 'De l\'échange initial au départ.',
    lead: 'Vous savez à chaque étape ce qu\'on attend de vous et ce qu\'on prend en charge.',
    steps: withKeys([
      {label: 'ÉTAPE 01', title: 'Vous nous décrivez le projet', text: 'Votre projet, votre groupe, votre destination et la période visée. Un formulaire court, puis un appel.', when: '15 min'},
      {label: 'ÉTAPE 02', title: 'On cale le modèle et le prix', text: 'Portage seul ou construction complète. On valide ensemble le budget, le prix de vente, la part qui vous revient et le seuil de départ.', when: 'Selon le niveau de construction du projet'},
      {label: 'ÉTAPE 03', title: 'Vous ouvrez les inscriptions', text: 'On met en place les contrats, la page d\'inscription, les encaissements et les assurances. Vous annoncez à votre groupe, on gère les dossiers.', when: 'Jour J du lancement'},
      {label: 'ÉTAPE 04', title: 'Le voyage part', text: 'Prestataires réglés, voyageurs suivis, assistance avant et pendant. Vous animez, on tient l\'opérationnel.', when: 'Puis on recommence'},
    ]),
    ctaText: 'Parlons de votre projet',
  },
  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Ce qu\'on nous demande avant de signer.',
    questions: withKeys([
      {question: 'Faut-il déjà avoir un groupe constitué ?', answer: 'Non. Il faut une communauté à qui proposer le voyage, pas des participants déjà inscrits. Des élèves, des abonnés, des clients, des adhérents : des gens qui vous suivent et à qui l\'idée parlera. En revanche, si vous n\'avez pas encore d\'audience, c\'est probablement trop tôt.'},
      {question: 'Odysway peut-il remplir le voyage à ma place ?', answer: 'Non, et c\'est ce qui fait la force du modèle. C\'est vous qui vendez, parce que vous connaissez votre communauté et que ce voyage est fait pour elle. Nous vous conseillons sur le prix, le calendrier de lancement et le seuil de confirmation, mais nous ne créons pas d\'audience à votre place.'},
      {question: 'Qui est responsable si un voyageur a un problème sur place ?', answer: 'Odysway, en tant qu\'agence organisatrice. C\'est le cœur du portage : nous portons la responsabilité de l\'organisation du voyage, avec l\'assurance et la garantie financière APST qui vont avec. Vous restez responsable de l\'animation et du contenu que vous apportez.'},
      {question: 'Qui réserve les vols des participants ?', answer: 'Cela dépend du projet. Les vols peuvent être intégrés au forfait que nous vendons, proposés en complément à ceux qui le souhaitent, ou laissés à la charge des voyageurs. Même logique pour les trajets en train. On tranche ensemble au moment de construire le prix, parce que ce choix change le montant affiché et le niveau de service.'},
      {question: 'Dois-je payer mon propre voyage pour accompagner le groupe ?', answer: 'À vous de décider. Votre billet d\'avion, votre hébergement et vos transferts peuvent être intégrés au coût du séjour et répartis entre les participants, ou rester à votre charge si vous préférez ne pas faire monter le prix de vente. On calcule les deux avec vous avant la mise en vente.'},
      // Formulation à faire valider par le juriste (CGV, titres de transport émis).
      {question: 'Que se passe-t-il si le minimum de participants n\'est pas atteint ?', answer: 'Le seuil de confirmation et la date limite sont fixés ensemble avant la mise en vente, et communiqués aux voyageurs dès l\'inscription. Si le seuil n\'est pas atteint, le départ est annulé selon les conditions prévues et les sommes versées sont remboursées.'},
      {question: 'Combien de temps faut-il prévoir avant le départ ?', answer: 'Comptez au minimum trois mois pour un portage sur un séjour déjà construit, et plutôt six à neuf mois pour une construction complète. Ces délais couvrent la contractualisation avec les prestataires et surtout la période de commercialisation auprès de votre communauté.'},
      {question: 'Puis-je accompagner le groupe si je ne suis pas guide diplômé ?', answer: 'Oui, dans la majorité des projets. Votre rôle et les activités que vous animez sont définis ensemble en amont. Lorsque certaines prestations nécessitent une qualification spécifique, elles sont confiées à un professionnel habilité.'},
      {question: 'Est-ce que je peux encaisser directement les paiements ?', answer: 'Non. C\'est précisément ce que le portage évite : les encaissements passent par Odysway, qui les sécurise dans le cadre de la garantie financière. La part qui vous revient est reversée selon les modalités définies au contrat de partenariat.'},
      {question: 'Le voyage sera-t-il vendu sous ma marque ou sous celle d\'Odysway ?', answer: 'La communication se fait sous votre marque si vous le souhaitez, ou en co-branding. Sur les éléments contractuels qui l\'exigent, Odysway apparaît comme agence organisatrice. C\'est une obligation, et c\'est ce qui donne sa valeur à la garantie pour vos participants.'},
      {question: 'Puis-je commencer par un seul départ ?', answer: 'C\'est même ce qu\'on recommande. Beaucoup de partenariats démarrent par un premier départ. Si le concept fonctionne, on construit ensuite un programme récurrent, avec des conditions revues à mesure que le projet gagne en autonomie.'},
    ]),
  },
  contact: {
    eyebrow: 'On en parle',
    title: 'Vous avez une idée de voyage ?',
    lead: 'Quelques lignes suffisent pour qu\'on vous dise si c\'est un portage simple ou une construction complète, et à quel coût. On garde le reste pour l\'appel.',
    bullets: [
      'Réponse sous 48 h ouvrées',
      'Un appel de 30 minutes, sans engagement',
      'On vous dit franchement si votre projet n\'est pas mûr',
    ],
    formTitle: 'Décrivez votre projet',
    formSubtitle: 'Six champs. Le reste, on le verra ensemble.',
    fields: {
      concept: {label: 'Votre concept de voyage', placeholder: 'Ex. : une retraite yoga de 7 jours pour ma communauté, avec deux séances par jour et des randonnées.'},
      destination: {label: 'Destination envisagée', placeholder: 'Une idée, une région, ou « à définir »'},
      communaute: {label: 'Votre communauté', placeholder: 'Ex. : 800 élèves à mon studio, ou 4 000 abonnés newsletter'},
      participants: {label: 'Nombre de participants envisagé', placeholder: 'Ex. : une dizaine, ou 12 à 15'},
      besoin: {label: 'Ce que vous aimeriez déléguer', placeholder: ''},
      email: {label: 'Votre email', placeholder: 'vous@exemple.com'},
    },
    besoinOptions: [
      'Le cadre et les encaissements',
      'Le cadre, les réservations et la construction du séjour',
      'Je ne sais pas encore',
    ],
    submitText: 'Envoyer mon projet',
    legal: 'Vos informations restent confidentielles et ne servent qu\'à préparer l\'échange.',
    successTitle: 'Merci, c\'est bien reçu.',
    successText: 'Nous revenons vers vous sous 48 h ouvrées avec un premier avis sur le modèle le plus adapté.',
    errorText: 'L\'envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement.',
  },
}

const existing = await client.fetch('*[_id in ["page_partenariat", "drafts.page_partenariat"]]._id')
if (existing.length) {
  log(`Rien à faire : ${existing.join(', ')} existe déjà.`)
  process.exit(0)
}
await client.create(doc)
log('Brouillon drafts.page_partenariat créé. À relire et publier dans le Studio.')
