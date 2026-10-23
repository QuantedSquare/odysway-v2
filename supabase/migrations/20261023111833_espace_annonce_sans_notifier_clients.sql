-- Espace Voyageur : l'annonce des documents devient un geste explicite de
-- l'équipe (bouton « Prévenir les clients… » de la fiche départ d'Ulysse).
-- Publier n'envoie plus rien : la case « prévenir les clients » disparaît.
--
-- DESTRUCTIVE mais sans perte : trip_documents.notifier_clients n'est plus lue
-- ni écrite par odysway depuis l'annonce manuelle (ni par dev, ni par main,
-- ni par Ulysse au moment de l'application). notifie_le et
-- trip_document_notifications restent : ils disent ce qui a été annoncé.
--
-- Appliquée en prod le 23/10/2026 (version 20261023111833).

ALTER TABLE public.trip_documents DROP COLUMN IF EXISTS notifier_clients;
