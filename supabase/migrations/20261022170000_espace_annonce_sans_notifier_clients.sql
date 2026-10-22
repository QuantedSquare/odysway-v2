-- Espace Voyageur : l'annonce des documents devient un geste explicite de
-- l'équipe (bouton « Prévenir les clients… » de la fiche départ d'Ulysse).
-- Publier n'envoie plus rien : la case « prévenir les clients » disparaît.
--
-- DESTRUCTIVE mais sans perte : trip_documents.notifier_clients n'est plus lue
-- ni écrite par odysway depuis l'annonce manuelle. À appliquer APRÈS le
-- déploiement de ce code (dev partage la base de prod). notifie_le et
-- trip_document_notifications restent : ils disent ce qui a été annoncé.
--
-- Version provisoire : le fichier prend la version enregistrée en prod une
-- fois la migration appliquée.

ALTER TABLE public.trip_documents DROP COLUMN IF EXISTS notifier_clients;
