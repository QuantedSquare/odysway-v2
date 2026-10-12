# Tracking des sources d'acquisition et conversions serveur

## Vue d'ensemble

| Étape | Où | Ce qui se passe |
|---|---|---|
| Arrivée sur le site | `useLeadSource` → `POST /api/v1/tracking/touch` | UTM, gclid / fbclid, référent et page d'arrivée rangés dans les cookies first-party `ody_ft` (première visite) et `ody_lt` (dernière visite non directe), posés par le serveur pour 13 mois. |
| Email laissé (création du deal) | `POST /ac/deals`, `kickstart` | Ligne `deal_attribution` (canal, source, campagne, click ids, `ga_client_id`, consentement). Puis événement `generate_lead` envoyé à Stape. |
| Premier paiement | webhooks Stripe et Alma | Événement `purchase` envoyé à Stape (prix total du voyage, comme le `purchase` du navigateur). |

Règles de classement : `server/utils/attribution.js`. Construction des événements : `server/utils/conversions.js`.

## Consentement

Les événements serveur ne partent que si le visiteur a cliqué « Accepter » sur la bannière (cookie `ody_consent=granted`, figé dans `deal_attribution.consent_ads` au moment du lead). L'attribution interne (`deal_attribution`) est enregistrée dans tous les cas : elle ne quitte pas notre base.

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

## Vérifier

- Logs Vercel : `[attribution] deal …` puis `[conversions] generate_lead deal … envoyé`.
- Stape : onglet Logs du container, ou GTM server en mode Preview.
- Supabase : `select * from deal_attribution order by created_at desc limit 20;`
