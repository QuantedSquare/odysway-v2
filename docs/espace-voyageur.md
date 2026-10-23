# Espace Voyageur — définition et passation

État au 16/10/2026. Maquette de référence : « Odysway - Espace Voyageur (maquette).html »
(fournie par Odysway, hors dépôt). Branche du socle : `claude/odysway-client-space-integration-813b7d`.

## 1. La fonctionnalité complète

Un espace personnel sur `odysway.com/mon-espace` où chaque client retrouve, sans
avoir créé de compte, tout ce qui concerne ses voyages :

| Bloc de la maquette | Contenu cible | État |
|---|---|---|
| Connexion | Code à 6 chiffres par email, Google, **puis mot de passe facultatif** | fait (§4.2) |
| Tableau de bord | Salutation, alertes (solde, option, document manquant), prochain départ, check-list « Avant le départ », documents récents | fait, sauf documents et passeport dans la check-list |
| Mes voyages | À venir / en cours / passés, fiche par dossier | fait |
| Paiement | Prix, déjà réglé, reste, échéance, historique, « Payer le solde » | fait (historique = paiements en ligne Stripe/Alma) |
| Voyageurs | Voyageurs du dossier, invitation par email, compagnons du départ (consentement) | fait |
| Mon profil | Identité, passeport (+ scan), régime alimentaire, allergies, contact d'urgence, champ libre | fait (§4.3), lu dans Ulysse (fiche départ) |
| Mes documents | Fiche voyage, carnet de séjour, billets, assurance, CGV, factures | fait (§4.4), déposés depuis Ulysse |
| Relances | Les rappels de solde (J-90, J-75, J-65) renvoient vers l'espace, jamais vers un lien de paiement | à faire (§4.5) |
| Avis | Étoiles et avis sur les voyages passés | hors périmètre pour l'instant |

### Décisions prises (ne pas rediscuter sans Odysway)

- **Même instance Supabase qu'Ulysse** (BackOffice-PROD, `ufyskkwszklmrgcifanb`).
  Ulysse refuse déjà tout compte absent de `ulysse.members` : aucun rôle « staff » à ajouter.
- **Code à 6 chiffres plutôt que lien magique** (les liens sont consommés par les
  antivirus de messagerie, et ne marchent pas d'un appareil à l'autre).
- **Aucune migration de comptes.** Le compte naît à la première connexion ; l'email
  ne sert qu'à amorcer le lien vers les contacts AC (`client_account_links`, N-N) ;
  ensuite `ac_contact` fait foi (un email corrigé dans AC ne fait rien perdre).
- **Un email inconnu obtient quand même un compte** (état vide + « Retrouver un
  dossier ») : refuser révélerait quelles adresses sont clientes.
- **Co-voyageurs inclus** : les voyageurs du deal (champs AC « Voyageur 1..15 »,
  sans email → rattachement par invitation du titulaire) et les autres voyageurs
  du même départ de groupe, en « Prénom I. », **seulement s'ils y ont consenti**
  (`visible_groupe`, faux par défaut). Les autres sont seulement comptés.
- **Fichiers dans des buckets Supabase privés**, servis par le serveur uniquement.
- **Échéance du solde : J-60** (« soit 60 jours avant le départ » dans la maquette).
  Hypothèse, aucune règle n'existait : `ECHEANCE_SOLDE_JOURS` dans `server/utils/espaceVoyageur.js`.

## 2. Architecture du socle (livré)

```
Navigateur (/mon-espace, rendu client seul, no-store, noindex)
  └─ useEspace.js : supabase-js (clé publiable), session dans localStorage « odysway-espace »
       └─ $fetch /api/v1/espace/**  avec  Authorization: Bearer <access_token>
Nitro
  ├─ espaceAuth.js      jeton revérifié par supabase.auth.getUser (service_role)
  ├─ espaceDossiers.js  rattachement par email, dossiers du compte, voyageurs, compagnons
  ├─ espaceVoyageur.js  règles PURES (testées) : parsing voyageurs, paiement, visibilité
  ├─ espaceCodes.js     codes de rattachement (HMAC, 15 min, 5 essais) — PUR
  ├─ espaceEmails.js    HTML des emails Brevo (échappé) — PUR
  └─ paiementsLecture.js  Stripe + Alma, partagé avec le Docteur d'Ulysse
Supabase (BackOffice-PROD) — RLS sans policy, droits retirés à anon/authenticated
  ├─ client_account_links   compte ↔ contact AC
  ├─ deal_travelers         voyageurs d'un deal + invitation + consentement
  └─ client_link_codes      codes de rattachement hachés
```

Règles d'accès (toutes côté serveur, à partir du compte, jamais d'un id fourni seul) :

- **titulaire** = le contact AC du deal est rattaché au compte → tout voir, payer, inviter ;
- **voyageur** = une ligne `deal_travelers` du deal porte le compte → voyage + groupe, **aucun montant** ;
- tout autre dossier → **404** (jamais 403).

Deals visibles : pipeline 2 hors Perdu/Supprimé/supprimés ; pipeline 1 seulement
avec une réservation active ; jamais 3 ni 4.

Voyageurs : relus depuis AC par le webhook `dealUpdate` (sans appel AC de plus,
jamais bloquant) et par l'espace si la dernière lecture a plus de 6 h.

Endpoints : `GET moi`, `GET dossiers/:dealId`,
`POST dossiers/:dealId/voyageurs/:slot/invitation` (`{ email }` ou `{ email: null }`),
`POST dossiers/:dealId/voyageurs/:slot/visibilite` (`{ visible }`),
`POST rattachement/code`, `POST rattachement/verifier`.

Pages : `connexion`, `index` (tableau de bord), `voyages`, `voyages/[dealId]`, `rattacher`.
Layout `espace` (menu latéral, rangée défilante sur mobile). Tout en composants
Vuetify, **thème inchangé** (les couleurs de la maquette existent déjà dans le thème :
`sky`, `soft-blush`, `yellow-light-2`, `surface-panel`, `cream`). Les boutons de l'espace
sont en casse normale via un `v-defaults-provider` local.

Liés : correctif Ulysse `claude/members-email-exact` (dépôt `ulysse`, commit `2e8f392`) —
la recherche de membre par `ilike` laissait `_` et `%` jouer les jokers ; **à mettre en
production avant d'ouvrir l'espace**.

## 3. Avant d'ouvrir l'espace aux clients

1. **Ulysse** : pousser et déployer `claude/members-email-exact`.
2. **Supabase Auth (BackOffice-PROD)**, tableau de bord :
   - Email Templates « Magic Link » **et** « Confirm signup » : afficher `{{ .Token }}`
     (sinon le client reçoit un lien, pas un code). Longueur du code : 6.
   - SMTP personnalisé : Brevo (expéditeur Odysway), sinon plafond de quelques emails/heure.
   - URL Configuration : ajouter `https://odysway.com/mon-espace/connexion`,
     l'URL de preview et `http://localhost:3000/mon-espace/connexion`.
   - Google : déjà actif pour Ulysse. L'écran de consentement affiche le domaine
     `ufyskkwszklmrgcifanb.supabase.co` ; un domaine personnalisé Supabase
     (`auth.odysway.com`, option payante) le remplacerait par Odysway.
3. **Vercel** : `NUXT_PUBLIC_ESPACE_SUPABASE_KEY` (clé publiable `sb_publishable_…`),
   `NUXT_PUBLIC_ESPACE_SUPABASE_URL` (facultatif, défaut BackOffice-PROD),
   puis `NUXT_PUBLIC_ESPACE_LIEN_VISIBLE=true` le jour de l'ouverture (seul interrupteur).
4. **Recette de bout en bout sur la preview** (jamais faite : aucun compte de test n'a
   été créé en production) : code, Google, client à plusieurs dossiers, email inconnu,
   rattachement d'une 2e adresse, invitation puis connexion de l'invité, consentement
   groupe, paiement du solde jusqu'à Stripe.

## 4. Reste à faire

### 4.1 Points d'attention du socle

- Le titulaire est reconnu dans les voyageurs par **nom + prénom** du contact AC ;
  s'ils diffèrent (nom d'usage, faute), il n'a pas de ligne « (vous) » et choisit sa
  visibilité via la place sans compte. Accepter, ou ajouter un choix manuel.
- L'historique de paiement ne montre que Stripe et Alma ; les règlements hors ligne
  (chèque, virement saisi dans Ulysse) n'apparaissent que dans « Déjà réglé ».
  Les lire depuis `ulysse.encaissements` compléterait la liste.
- Cache « voyageurs relus » en stockage mémoire Nitro : par instance Vercel, donc
  quelques lectures AC en plus, sans conséquence.
- Pas de référence de dossier type « ODY-26-0473 » : on affiche le n° de deal.

### 4.2 Connexion par mot de passe — FAIT (branche `claude/espace-mot-de-passe`)

Après une première connexion par code ou Google, le client définit un mot de passe
dans « Connexion et sécurité » (`/mon-espace/securite`) et choisit « Mot de passe »
sur la page de connexion. Le code reste toujours disponible et sert de « mot de
passe oublié » : on se connecte par code, puis on redéfinit son mot de passe.

- **Appel direct à Supabase Auth** (`updateUser({ password })`), pas d'endpoint Nitro :
  le navigateur détient le jeton et peut de toute façon appeler Supabase lui-même,
  une garde serveur serait contournable. Les vrais contrôles sont donc :
  - les réglages de Supabase Auth (longueur minimale, mots de passe ayant fuité,
    « Secure password change ») — à régler, voir §3 ;
  - **Ulysse n'accepte que les sessions Google** (`amr` du jeton, branche Ulysse
    `claude/members-email-exact`) : un membre qui poserait un mot de passe depuis
    son espace client n'ouvre pas Ulysse avec.
- **Connexion récente exigée** : si la dernière authentification (`amr` du jeton,
  qui survit aux rafraîchissements) date de plus de 10 minutes, l'espace redemande
  un code avant d'afficher le formulaire. Confort et garde-fou face à un ordinateur
  resté ouvert, pas une frontière de sécurité (voir ci-dessus).
- Règles affichées et vérifiées avant envoi (`app/utils/espaceMotDePasse.js`, testé) :
  12 caractères, 72 octets au plus (limite bcrypt), 5 caractères différents, pas
  l'identifiant de l'email, pas d'espace en bordure. Erreurs Supabase traduites
  (`weak_password` / `pwned`, `invalid_credentials`, limites de débit…).
- `user_metadata.mot_de_passe = true`, posé dans le même appel, ne sert qu'à
  l'affichage (« Définir » ou « Modifier ») : Supabase n'expose pas l'existence d'un
  mot de passe.
- Échec de connexion : un message unique, que l'email existe ou non.
- Tableau de bord : suggestion « Connectez-vous plus vite », masquable, tant
  qu'aucun mot de passe n'est défini.

**Réglages Supabase Auth à faire en plus de §3** : Password → longueur minimale 12,
« Leaked password protection » activée (l'advisor la signale désactivée), « Secure
password change » activé ; Rate Limits → garder la limite sur `/token`.

**Mode démo local** : `NUXT_PUBLIC_ESPACE_DEMO=true` dans `.env` puis `npm run dev`.
Données de la maquette, aucun appel à Supabase ni à l'API ; code `123456`.
Uniquement sous `import.meta.dev` : le module `app/dev/espaceDemo.js` n'entre dans
aucun build. « Continuer avec Google » y ouvre une session vieille de 2 h, pour voir
la reconfirmation par code.

### 4.3 Mon profil voyageur — FAIT (branche `claude/espace-profil-voyageur`)

Une fiche par **place** de dossier (`traveler_profiles.deal_traveler_id`), page
`/mon-espace/voyages/:dealId/voyageurs/:slot` ; « Mon profil » (`/mon-espace/profil`)
liste toutes les places que le compte peut remplir sur ses voyages à venir.

- **Qui** : la personne si elle a un compte ; sinon le titulaire pour elle (enfant,
  proche non invité, et sa propre place). Un adulte invité garde ses données pour lui :
  le titulaire ne voit que « complet / à compléter ». Tout autre cas → 404.
- **Pièce d'identité** : passeport ou carte d'identité, numéro, expiration, pays.
  - Numéro **chiffré par l'application** (AES-256-GCM, `server/utils/espaceChiffrement.js`,
    clé `ESPACE_CHIFFREMENT_KEY`) ; seuls les 4 derniers caractères restent en clair.
    **Le navigateur ne reçoit jamais le numéro** ; le modifier = le ressaisir.
  - Avertissement si la pièce expire moins de 6 mois après le retour.
  - Copie (page photo) : bucket privé `traveler-files`, type vérifié sur les octets
    (PDF, JPEG, PNG, HEIC), 10 Mo, nom tiré au hasard ; lecture par lien de 60 s ;
    dépôt / lecture / suppression / purge journalisés (`traveler_file_access`).
  - **Purge** des copies 30 jours après le retour : `POST /api/v1/webhooks/espace/purge-pieces`
    avec `x-cron-secret` (même secret que le cronjob des options). **À planifier**
    (une fois par jour, là où le cronjob des options l'est déjà).
- **Régime** (puces de la maquette, « Je mange de tout » exclusif), allergies,
  **contact d'urgence** (nom, lien, téléphone), champ libre.
- **Reprise** : si la personne a rempli un profil pour un voyage précédent, l'espace
  propose de le reprendre (tout sauf la copie de la pièce).
- **AC** : « Passeport reçu » (110) et « Régime alimentaire reçu » (111) passent à
  `||Oui||` quand **tous** les voyageurs du dossier sont renseignés. Jamais décochés.
- Tableau de bord : ligne « Profils voyageurs » dans la check-list, alerte si une
  pièce expire trop tôt ; fiche dossier : statut et bouton par voyageur.

**Avant la mise en ligne**
- `ESPACE_CHIFFREMENT_KEY` (32 octets en base64, `openssl rand -base64 32`) sur
  Vercel, **la même clé pour dev, preview et production** : la base est partagée,
  un numéro chiffré depuis la recette doit rester lisible en prod. Garder une copie
  de la clé dans le coffre de mots de passe : la perdre rend tous les numéros illisibles.
- Planifier la purge (ci-dessus).

**Reste à faire sur le profil**
- ~~Lecture côté Ulysse~~ — FAIT (odysway-v2 #305, Ulysse #90) : onglet « Voyageurs »
  de la fiche départ, droit **restreint** `profils-voyageurs` (Alex seul par migration,
  les autres depuis Admin › Droits). `GET /api/v1/ulysse/dates/:dateId/profils` déchiffre
  les numéros ; chaque profil lu et chaque copie ouverte sont journalisés des deux côtés.
  Numéros masqués par défaut, « Copier pour les billets » (TSV pour tableur).
- Modifier nom / date de naissance d'un voyageur : réécrire le champ AC « Voyageur N »
  au même format (Chapka le lit), puis resynchroniser.

### 4.4 Documents — FAIT (branche `claude/espace-documents`, Ulysse `claude/documents-voyage`)

- **Dépôt par l'équipe dans Ulysse** (fiche départ, onglet « Voyageurs ») : type
  (fiche voyage, carnet, billets, assurance, facture, autre), titre, portée **tout le
  départ** ou **un dossier**, « réservé au titulaire » (coché d'office pour une facture),
  « disponible le » (affiché « Bientôt » avant). Le fichier part directement dans le
  bucket privé `trip-documents` par URL signée ; le document reste **brouillon** jusqu'à
  sa publication, qui vérifie que le fichier est bien arrivé.
- **Côté client** : page « Mes documents », bloc de la fiche dossier, carte « Mes
  documents de voyage » du tableau de bord (4 premiers). Badge « Nouveau » jusqu'à la
  première ouverture (`trip_document_views`), « Bientôt » + date pour les documents
  datés. Téléchargement par lien de 60 s, nom de fichier tiré du titre.
- Liens permanents gardés : programme sur odysway.com, CGV, carnet en ligne (`travel_book`).

**Annonce aux clients — FAIT (branche `claude/espace-notification-documents`, Ulysse `claude/documents-voyage`)**
- **Publier n'envoie rien** (décision d'Alex). Sur la fiche départ d'Ulysse, les documents
  publiés, disponibles et pas encore annoncés portent la mention « à annoncer ». Le bouton
  « 📧 Prévenir les clients… » ouvre un aperçu : documents concernés, destinataires et ce
  que chacun recevra, mode d'envoi. Après confirmation, **un seul email récapitulatif
  par client** (`nouveauxDocuments`), lien vers `/mon-espace/documents`, sans jeton.
- Destinataires : **titulaires des dossiers actifs** du départ (ou du seul dossier visé)
  et, sauf document réservé au titulaire, les **voyageurs invités** ; une adresse une fois.
- `GET /api/v1/ulysse/dates/:dateId/annonce` (aperçu, n'écrit rien) ;
  `POST …/annonce` `{ documentIds }` : n'envoie que les documents vus dans l'aperçu
  (un document publié entre-temps attend le clic suivant). Journal par couple
  (document, adresse) dans `trip_document_notifications` : rejouer l'appel n'envoie rien
  de plus, un échec Brevo est reproposé. `notifie_le` posé quand plus aucune adresse du
  document n'est en échec. Logique pure : `espaceNotification.regrouperAnnonce`.
- « Disponible le » futur : le document n'est proposé qu'à partir de cette date. Plus de
  tâche planifiée ni d'envoi automatique.
- **Garde-fou** : `ESPACE_NOTIFICATIONS`, jamais déduit de l'environnement (dev partage
  la base de prod, donc les vrais clients) :
  - absente → l'aperçu s'affiche, l'envoi répond 409, rien n'est écrit ;
  - `redirection:<email>` → tout part vers cette adresse, sujet préfixé
    `[Recette → client@…]` ; journalisé `redirige`, ce qui **ne compte pas** en
    production (le document reste à annoncer, `notifie_le` n'est pas posé) ;
  - `actif` → les clients sont prévenus. **À ne poser qu'en production.**
- Migration `20261023111833_espace_annonce_sans_notifier_clients.sql` : supprime
  `trip_documents.notifier_clients` (plus utilisée). **Appliquée en prod le 23/10/2026.**

**Reste à faire**
- Contrat d'assurance Chapka et factures clients : pas de génération automatique ;
  déposés à la main. Date d'acceptation des CGV : non stockée.
- Écarter un document de l'annonce pour de bon (correction d'un document déjà connu) :
  aujourd'hui il reste « à annoncer » tant qu'on ne l'envoie pas.

### 4.5 Activation et relances

- Lien « Mon espace » dans les emails transactionnels (confirmation, relances).
- Relances de solde J-90 / J-75 / J-65 pointant vers `/mon-espace/voyages/:dealId#paiement`.
- Campagne Brevo d'ouverture : voyageurs à départ futur d'abord (~250), puis les
  autres. Le lien ne porte ni jeton ni adresse (un email transféré n'ouvre rien).

### 4.6 Compte

- Suppression du compte (RGPD) : `auth.admin.deleteUser` → liens et codes partent en
  cascade, places de voyageur gardées sans `user_id`.
- Changement d'email du compte (Supabase `updateUser({ email })`, double confirmation).

## 5. Vérifier son travail

- `npm run test:unit` (règles pures `tests/unit/espace*.test.mjs`).
- `npx nuxt prepare` puis `npx eslint <fichiers>` (sans `prepare`, les auto-imports
  Nitro sortent en `no-undef`).
- `npx nuxt build` : seul moyen de voir les pièges d'auto-import du build Vercel.
- Sans compte réel, l'interface se vérifie en injectant une session factice dans
  `localStorage['odysway-espace']` et en interceptant `fetch` vers `/api/v1/espace/*`.
