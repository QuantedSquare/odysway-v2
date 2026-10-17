-- Lecture des profils voyageurs par l'équipe (Ulysse) : chaque consultation
-- d'un profil dont le numéro de pièce est déchiffré est journalisée, comme les
-- lectures de copies de pièces. Seule la liste des actions change.
ALTER TABLE public.traveler_file_access DROP CONSTRAINT IF EXISTS traveler_file_access_action_check;
ALTER TABLE public.traveler_file_access ADD CONSTRAINT traveler_file_access_action_check
  CHECK (action IN ('depot', 'lecture', 'suppression', 'purge', 'consultation'));
