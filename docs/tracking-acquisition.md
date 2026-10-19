# Tracking des sources d'acquisition et conversions serveur

## Vue d'ensemble

| Étape | Où | Ce qui se passe |
|---|---|---|
| Arrivée sur le site | `useLeadSource` → `POST /api/v1/tracking/touch` | UTM, gclid / fbclid, référent et page d'arrivée rangés dans les cookies first-party `ody_ft` (première visite) et `ody_lt` (dernière visite non directe), posés par le serveur pour 13 mois. |
| Email laissé (création du deal) | `POST /ac/deals`, `kickstart` | Ligne `deal_attribution` (canal, source, campagne, click ids, `ga_client_id`, IP et navigateur). Puis événement `generate_lead` envoyé à Stape. |
| RDV Cal.com réservé | `useCalEmbed` → `POST /api/v1/tracking/rdv` | Le deal naît chez ActiveCampaign (intégration Cal.com), sans passer par nous : la ligne d'attribution est calculée à la réservation, mise en attente dans `rdv_attribution_attente`, puis écrite dans `deal_attribution` (formulaire `RDV`) quand le deal arrive. Pas d'événement serveur : le `generate_lead` du RDV reste celui du navigateur. |
| Premier paiement | webhooks Stripe et Alma | Événement `purchase` envoyé à Stape (prix total du voyage, comme le `purchase` du navigateur). |

Règles de classement : `server/utils/attribution.js`. Construction des événements : `server/utils/conversions.js`.

## Consentement

**Il n'y a pas de bannière cookies : tout visiteur est traité comme consentant.** Décision du 14/10/2026, prise en connaissance du risque. La CNIL (art. 82 de la loi Informatique et Libertés) exige un consentement préalable pour les traceurs publicitaires, GA4 et Hotjar. Les conditions de Google (politique de consentement UE) et de Meta l'exigent aussi.

- **Serveur** : `generate_lead` et `purchase` partent pour chaque deal (sauf adresses de test), y compris les deals créés hors du site, qui n'ont pas de ligne `deal_attribution` et partent donc sans identifiants publicitaires. L'IP et le navigateur du visiteur sont gardés pour chaque lead.
- **Container web GTM-NP63ZR5** : « GCM - Default » et « GCM - Update » déclarent tout à `granted` (version 38) ; les hits GA4 portent `gcs=G111`. Rien à changer.
- **Container serveur** : les balises Meta alimentées par les hits GA4 tournent pour tout le monde.
- `deal_attribution.consent_ads` n'est plus écrit.

Pour revenir à un consentement réel, la PR #298 (commit `4a6bd2a2`) contient une bannière et la configuration Consent Mode correspondante.

## Variables d'environnement (Vercel, Production uniquement)

- `STAPE_SERVER_URL` : `https://sst.odysway.com`. Sans elle, aucun événement n'est envoyé (les logs disent « STAPE_SERVER_URL absente »).
- `STAPE_DATA_PATH` : chemin du Data Client, `/data` par défaut.
- `STAPE_SECRET` : longue chaîne aléatoire (`openssl rand -hex 32`), envoyée dans l'en-tête `x-ody-secret`. Les déclencheurs du container l'exigent : `/data` est public, seul odysway.com doit pouvoir y déclarer un lead ou un achat.

## Configuration du container server-side (Stape / GTM server)

1. **Client** : ajouter le client « Data Client » (galerie de templates Stape), chemin accepté `/data`. Il transforme le JSON reçu en données d'événement.
2. **Déclencheurs** : `Client Name` = le Data Client, ET `Event Name` = `generate_lead` (resp. `purchase`), ET une variable **En-tête de requête** `x-ody-secret` égale à la valeur de `STAPE_SECRET` (une variable constante du container, jamais en clair dans une capture).
   Le Data Client prend l'IP et le user agent de l'expéditeur quand l'événement n'en porte pas : le code envoie ceux du visiteur (`ip_override`, `user_agent`) pour le lead, et pour l'achat ceux gardés au lead (`deal_attribution.client_ip`, `client_user_agent`). Les mapper dans la balise Meta (User data : Client IP address, Client user agent).
3. **Tags** :
   - **Meta Conversions API** (tag Stape) sur `generate_lead` → événement `Lead`, sur `purchase` → `Purchase`. Event ID : `{{Event Data - event_id}}`. Le tag lit `user_data.*`, `x-fb-ck-fbc`, `x-fb-ck-fbp`, `ip_override`, `user_agent`.
   - **Google Ads** (conversion ou « offline conversion » Stape) sur `purchase` : `gclid` / `gbraid` / `wbraid`, `transaction_id` comme Order ID, `value`, `currency`, `user_data` pour les conversions améliorées.
   - **GA4** : à NE PAS déclencher sur le `purchase` serveur tant que le `purchase` du navigateur reste actif (GA4 ne déduplique pas sur `event_id`, les achats seraient comptés deux fois). Le `generate_lead` serveur peut alimenter GA4 si aucun événement navigateur n'y est mappé.

## Déduplication avec les événements du navigateur

Meta déduplique quand le navigateur et le serveur envoient le même `event_name` avec le même `event_id`. Les événements dataLayer portent désormais `event_id` ; dans le container **web**, renseigner l'Event ID des tags Meta avec une variable dataLayer `event_id` :

| Événement serveur | Événement dataLayer correspondant | `event_id` |
|---|---|---|
| `generate_lead` (tunnel) | `reservation_step1` (envoi des coordonnées) | `lead_<uuid>` (cookie `ody_leid`) |
| `generate_lead` (demande d'infos) | `devis_classic_confirmation` | idem |
| `generate_lead` (alerte départ) | `inscription_alerte` | idem |
| `purchase` | `purchase` | `purchase_<dealId>` |

Google Ads déduplique l'achat par `transaction_id` (Stripe : `pi_…` ; Alma : le dealId), identique des deux côtés.

**Pose d'option.** `reservation_pose_option` part toujours APRÈS `reservation_step1` : le lead est déjà compté, que l'option soit posée à l'étape Coordonnées (`position_option: 'debut_funnel'`) ou à l'étape Paiement (`'fin_funnel'`). Le mapper sur la conversion « Lead » principale compte deux leads pour un. À brancher en conversion secondaire (Google Ads : action « secondaire », Meta : événement personnalisé). En base, `booked_dates.option_origine` porte la même information.

## Vérifier

- Logs Vercel : `[attribution] deal …` puis `[conversions] generate_lead deal … envoyé`.
- Stape : onglet Logs du container, ou GTM server en mode Preview.
- Supabase : `select * from deal_attribution order by created_at desc limit 20;`
- RDV : logs `[attribution-rdv] capture …` puis `[attribution-rdv] deal … : attribue` ; en base, `select email, capture_le, deal_id, resultat from rdv_attribution_attente order by capture_le desc limit 20;`. Une capture sans `deal_id` attend son deal (24 h au plus) ; effacée au bout de 30 jours.

### Attribution des RDV : règles

- Capture : email du participant (en minuscules) et `uid` de la réservation, une capture par réservation, cinq par email et par jour au plus. Les salariés (`odysway_employee_optout`) ne sont pas capturés.
- Rattachement : le deal du contact dont l'email correspond, dans le stage « RDV Calendly Pris », pipelines 1, 2 ou 5, **né entre 2 h avant et 24 h après la réservation**. Un deal existant que Cal.com déplace en RDV garde son origine : il n'est pas une entrée par RDV.
- Deux moments, l'ordre n'étant pas garanti : à la capture si le deal est déjà dans le miroir, sinon au webhook dealUpdate qui le recopie.
- Première écriture gagnante : un deal déjà attribué (tunnel, devis) garde sa ligne ; la capture est marquée `deja_attribue`.
- `deal_attribution.created_at` = l'heure de la réservation.
