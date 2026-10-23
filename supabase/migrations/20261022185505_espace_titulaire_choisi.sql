-- Espace Voyageur : le titulaire désigne lui-même sa place (« C'est moi »).
--
-- `is_holder` est recalculé à chaque synchro AC en comparant prénom + nom du
-- contact à ceux des voyageurs. Un nom d'usage ou une faute de frappe laisse le
-- titulaire sans place. `holder_manuel` garde son choix : tant qu'une place du
-- deal le porte, la synchro (espaceDossiers.synchroniserVoyageurs) la tient
-- pour celle du titulaire au lieu de chercher par le nom.
--
-- PUREMENT ADDITIF. Une seule place choisie par deal (index unique partiel).

ALTER TABLE public.deal_travelers
  ADD COLUMN IF NOT EXISTS holder_manuel boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS deal_travelers_holder_manuel_idx
  ON public.deal_travelers (deal_id) WHERE holder_manuel;
