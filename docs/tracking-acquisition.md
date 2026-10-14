# Tracking des sources d'acquisition et conversions serveur

## Vue d'ensemble

| Étape | Où | Ce qui se passe |
|---|---|---|
| Arrivée sur le site | `useLeadSource` → `POST /api/v1/tracking/touch` | UTM, gclid / fbclid, référent et page d'arrivée rangés dans les cookies first-party `ody_ft` (première visite) et `ody_lt` (dernière visite non directe), posés par le serveur pour 13 mois. |
| Email laissé (création du deal) | `POST /ac/deals`, `kickstart` | Ligne `deal_attribution` (canal, source, campagne, click ids, `ga_client_id`, consentement). Puis événement `generate_lead` envoyé à Stape. |
| Premier paiement | webhooks Stripe et Alma | Événement `purchase` envoyé à Stape (prix total du voyage, comme le `purchase` du navigateur). |

Règles de classement : `server/utils/attribution.js`. Construction des événements : `server/utils/conversions.js`.

## Consentement

Bannière `CookiesSnackbar` (montée dans `app.vue`), logique dans `useConsentement`. Ne rien choisir vaut refus : la CNIL n'admet plus « en poursuivant votre navigation, vous acceptez ». Le lien « Cookies » du footer rouvre la bannière.

- **Cookie `ody_consent`** (`granted` / `denied`, 13 mois) : seule source du choix. Le serveur le fige dans `deal_attribution.consent_ads` au moment du lead, et les événements serveur ne partent que s'il vaut `granted`. L'attribution interne (`deal_attribution`) est enregistrée dans tous les cas : elle ne quitte pas notre base.
- **Événement dataLayer `ody_consent_update`** (`ody_consent: 'granted' | 'denied'`) : poussé au clic, il applique le choix dans GTM sans recharger la page. Le cookie, lui, est écrit au tick suivant par `useCookie` : au moment de l'événement, GTM doit lire la valeur du dataLayer, pas le cookie.
- **Hotjar** (chargé par `app.vue`) ne se charge qu'après « Accepter ».
- Le `localStorage.consent` de l'ancienne bannière (démontée d'avril à octobre 2026) n'est pas repris : on redemande.

### Container web GTM-NP63ZR5 (Consent Mode v2)

Variables :
- `DLV - ody_consent` : variable de couche de données, nom `ody_consent`.
- `Cookie - ody_consent` : cookie propriétaire, nom `ody_consent`.
- `Consentement` : JavaScript personnalisé, `granted` seulement si le visiteur a accepté :
  ```js
  function () {
    var choix = {{DLV - ody_consent}} || {{Cookie - ody_consent}};
    return choix === 'granted' ? 'granted' : 'denied';
  }
  ```

Balises (modèle « Consent Mode (Google + Microsoft tags) ») :
- **GCM - Default**, déclencheur Consent Initialization - All Pages : commande `default` ; `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `personalization_storage` = `{{Consentement}}` ; `functionality_storage`, `security_storage` = `granted` ; `wait_for_update` = 500 ; `ads_data_redaction` coché. Plus de balise de nettoyage.
- **GCM - Update**, déclencheur Événement personnalisé `ody_consent_update` : commande `update`, mêmes champs.

Les balises Google (GA4, Google Ads) appliquent Consent Mode d'elles-mêmes : sans consentement, elles envoient des pings sans cookies (mode avancé), que GA4 et Ads utilisent pour modéliser.

### Container serveur sst.odysway.com

Les hits GA4 du navigateur arrivent au container serveur avec l'état de consentement (`gcs` : `G111` tout accepté, `G100` tout refusé ; le 3ᵉ caractère est `ad_storage`). Les balises Meta déclenchées par le client GA4 doivent exiger `ad_storage` : réglage de consentement de la balise Stape, ou condition `x-ga-gcs` correspond à `^G11`. Les déclencheurs du Data Client (`generate_lead`, `purchase`) n'ont pas de `gcs` : le serveur ne les envoie déjà qu'avec `consent_ads = 'granted'`.

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
