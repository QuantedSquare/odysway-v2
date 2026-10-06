-- Le suivi des demandes de partenariat appartient à Ulysse.
--
-- `status` avait été posé à la création de la table, sans que rien ne l'écrive
-- ensuite. Ulysse tient le suivi (statut, responsable, note, archivage) dans
-- `ulysse.demandes_partenariat` : garder cette colonne en ferait une seconde
-- source de vérité, toujours à « nouveau ». odysway-v2 ne la lit ni ne l'écrit.
-- Rejouable.

alter table public.partnership_requests drop column if exists status;
