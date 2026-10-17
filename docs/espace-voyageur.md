# Espace Voyageur — définition et passation

État au 16/10/2026. Maquette de référence : « Odysway - Espace Voyageur (maquette).html »
(fournie par Odysway, hors dépôt). Branche du socle : `claude/odysway-client-space-integration-813b7d`.

## 1. La fonctionnalité complète

Un espace personnel sur `odysway.com/mon-espace` où chaque client retrouve, sans
avoir créé de compte, tout ce qui concerne ses voyages :

| Bloc de la maquette | Contenu cible | État |
|---|---|---|
| Connexion | Code à 6 chiffres par email, Google, **puis mot de passe facultatif** | code + Google faits ; mot de passe à faire (§4.2) |
| Tableau de bord | Salutation, alertes (solde, option, document manquant), prochain départ, check-list « Avant le départ », documents récents | fait, sauf documents et passeport dans la check-list |
| Mes voyages | À venir / en cours / passés, fiche par dossier | fait |
| Paiement | Prix, déjà réglé, reste, échéance, historique, « Payer le solde » | fait (historique = paiements en ligne Stripe/Alma) |
| Voyageurs | Voyageurs du dossier, invitation par email, compagnons du départ (consentement) | fait |
| Mon profil | Identité, passeport (+ scan), régime alimentaire, allergies, contact d'urgence, champ libre | à faire (§4.3) |
| Mes documents | Fiche voyage, carnet de séjour, billets, assurance, CGV, factures | à faire (§4.4) ; liens provisoires sur la fiche dossier |
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

### 4.2 Connexion par mot de passe (demandée le 16/10/2026)

**But** : après une première connexion par code ou Google, le client peut définir un
mot de passe dans son espace et s'en servir ensuite, sans passer par sa boîte mail.
Le code reste toujours disponible (il sert aussi de « mot de passe oublié »).

**Conception proposée**

- *Définir / changer* : `POST /api/v1/espace/mot-de-passe { motDePasse }` plutôt qu'un
  `updateUser` direct depuis le navigateur, pour imposer côté serveur :
  - session **récente** (connexion de moins de 10 min, lue dans `iat` /
    `last_sign_in_at`), sinon le front redemande un code (`reauthenticate`) — un
    ordinateur resté ouvert ne doit pas permettre de poser un mot de passe ;
  - **refus pour les membres d'Ulysse** (`ulysse.members`, actifs ou non) : leur compte
    est un compte de travail Google, un mot de passe y ajouterait une porte d'entrée ;
  - force minimale (12 caractères), et « Leaked password protection » activée dans
    Supabase Auth (l'advisor la signale aujourd'hui désactivée) ;
  - écriture par `supabase.auth.admin.updateUserById(id, { password, app_metadata: { mot_de_passe: true } })`.
    `app_metadata.mot_de_passe` permet d'afficher « Modifier » plutôt que « Définir ».
- *Connexion* : onglet « Mot de passe » sur `/mon-espace/connexion`
  (`signInWithPassword`). Message d'échec unique (« email ou mot de passe incorrect »),
  lien « Recevoir un code à la place ».
- *Mot de passe oublié* : pas de flux de réinitialisation à part. Le client se connecte
  par code, puis redéfinit son mot de passe (la session est alors récente).
- *Supprimer le mot de passe* : facultatif, même endpoint avec `null` (Supabase ne
  supprime pas un mot de passe : en poser un aléatoire et retirer le drapeau).
- *Page* : nouvelle entrée « Sécurité » (ou bloc dans « Mon profil ») : définir,
  modifier, et liste des moyens de connexion (code, Google si identité liée).
- *Anti-force brute* : limites natives de Supabase sur `/token` ; ajouter Cloudflare
  Turnstile (pris en charge par Supabase Auth) si des tentatives apparaissent.
- *Tests* : règle de fraîcheur et refus des membres d'Ulysse en fonctions pures.

### 4.3 Mon profil voyageur

- Table `traveler_profiles` liée à `deal_travelers.id`, pré-remplie depuis le profil
  du voyage précédent de la même personne (`user_id`) : n° de passeport (**chiffré
  côté application**, AES-GCM, clé `ESPACE_CHIFFREMENT_KEY`), expiration, nationalité,
  régime (puces de la maquette), allergies, contact d'urgence, champ libre.
- Qui édite : la personne si elle a un compte, sinon le titulaire pour elle.
- Scan du passeport : bucket privé `traveler-files`, dépôt via Nitro uniquement
  (type réel vérifié par les octets : PDF/JPEG/PNG/HEIC ; 10 Mo ; chemin
  `{deal_traveler_id}/{uuid}`), lecture par URL signée de 60 s, journal des
  téléchargements, suppression automatique N jours après le retour (cron).
- Écrire `passport_received` / `diet_received` (champs AC 110 et 111) quand c'est
  complet ; ajouter « Passeport » à la check-list et aux alertes du tableau de bord.
- Lecture dans Ulysse (fiche du départ) : endpoint `/api/v1/ulysse/...` en lecture seule.
- Modifier nom / date de naissance d'un voyageur : réécrire le champ AC
  « Voyageur N » **au même format** (Chapka le lit), puis resynchroniser.

### 4.4 Documents

- Bucket privé `trip-documents` + table `trip_documents` (`travel_date_id` ou
  `deal_id`, type, titre, `storage_path`, `visible_client`, `published_at`).
  Dépôt depuis Ulysse ; badge « Nouveau » (suivi « vu » par compte) ; « Bientôt »
  pour les documents datés (carnet à J-30).
- Contrat d'assurance Chapka, billets (après réception du passeport), factures :
  sources à décider. Date d'acceptation des CGV : non stockée aujourd'hui.

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
