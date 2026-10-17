-- IP et navigateur du visiteur au moment du lead, pour la conversion d'achat.
--
-- L'achat part du webhook de paiement (Stripe, Alma), sans visiteur : le Data
-- Client du container server-side prenait alors l'IP et le user agent de
-- l'expéditeur — un serveur Vercel — et Meta les lisait comme ceux du client.
-- server/utils/conversions.js renvoie désormais ceux du lead.
--
-- Données personnelles : écrites seulement quand le visiteur a accepté les
-- cookies (consent_ads = 'granted'), seul cas où une conversion part vers les
-- régies. Ne pas répliquer vers le projet dashboard.
--
-- Additive, idempotente.

alter table public.deal_attribution
  add column if not exists client_ip         text,
  add column if not exists client_user_agent text;
