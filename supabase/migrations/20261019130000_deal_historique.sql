-- Historique des mouvements des deals.
--
-- activecampaign_deals ne garde que l'état courant : un deal passé par
-- « A posé une option » puis payé n'en garde aucune trace (constat du
-- 19/10/2026, analyse des options pour Linda). Cette table garde chaque
-- changement de pipeline, d'étape, de statut, d'étape du tunnel, de commercial,
-- de montant payé et de suppression.
--
-- Alimentée par un trigger sur activecampaign_deals : tout écrivain du miroir
-- est couvert (webhook dealUpdate, resynchronisation, corrections d'Ulysse,
-- soft delete) sans toucher au code. Une ligne par écriture qui change au
-- moins un champ suivi ; une réécriture identique n'écrit rien.
--
-- LIMITE : le miroir relit l'état AC au moment du traitement, et les webhooks
-- d'une rafale sont fusionnés (ac_deal_sync_queue). Deux étapes franchies en
-- quelques secondes peuvent n'en laisser qu'une. Les mouvements qui durent
-- (étape du commercial, option posée, paiement) sont bien là.
--
-- L'historique commence à cette migration : rien n'est reconstitué avant.
--
-- Le trigger ne doit jamais bloquer le miroir : une erreur d'écriture ici est
-- avalée (WARNING dans les logs Postgres).
--
-- ORDRE : jouer d'abord supabase/dashboard/08_deal_historique.sql sur le projet
-- DASHBOARD, déployer mirror-sync (clé id), puis après cette migration créer le
-- webhook « mirror-deal_historique » sur public.deal_historique (Insert
-- seulement suffit), même configuration que les autres (05_webhooks_setup.sql).
--
-- Additive, idempotente.

create table if not exists public.deal_historique (
  id              bigserial primary key,
  deal_id         bigint not null,
  contact         bigint,
  -- Moment où le miroir a enregistré le changement.
  survenu_le      timestamptz not null default clock_timestamp(),
  -- mdate AC de l'état enregistré (date de modification côté CRM).
  ac_mdate        timestamptz,
  -- 'creation' : première écriture du deal dans le miroir (pas forcément sa
  -- création dans AC : un vieux deal resynchronisé apparaît ainsi) ;
  -- 'mouvement' : au moins un champ suivi a changé.
  evenement       text not null check (evenement in ('creation', 'mouvement')),
  -- Champs suivis qui ont changé (vide pour une création).
  changements     text[] not null default '{}',
  -- État APRÈS le changement.
  pipeline_id     smallint,
  pipeline_title  text,
  stage_id        text,
  stage           text,
  status          text,
  current_step    text,
  owner_id        text,
  seller          text,
  total_paid      numeric,
  deleted         boolean,
  -- Valeurs AVANT, pour les seuls champs changés (null pour une création).
  avant           jsonb
);

create index if not exists deal_historique_deal_idx on public.deal_historique (deal_id, survenu_le);
create index if not exists deal_historique_survenu_idx on public.deal_historique (survenu_le);
create index if not exists deal_historique_current_step_idx on public.deal_historique (current_step, survenu_le);

-- Écrite par le trigger seulement ; lue par le serveur (service_role).
alter table public.deal_historique enable row level security;

comment on table public.deal_historique is
  'Historique des mouvements des deals AC (pipeline, étape, statut, étape du tunnel, commercial, montant payé, suppression), écrit par trigger sur activecampaign_deals depuis le 19/10/2026.';

create or replace function public.deal_historique_enregistrer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  champs text[] := '{}';
  v_avant jsonb := '{}'::jsonb;
begin
  if tg_op = 'UPDATE' then
    if new.pipeline_id is distinct from old.pipeline_id then
      champs := champs || 'pipeline_id'::text;
      v_avant := v_avant || jsonb_build_object('pipeline_id', old.pipeline_id, 'pipeline_title', old.pipeline_title);
    end if;
    if new.stage_id is distinct from old.stage_id then
      champs := champs || 'stage_id'::text;
      v_avant := v_avant || jsonb_build_object('stage_id', old.stage_id, 'stage', old.stage);
    end if;
    if new.status is distinct from old.status then
      champs := champs || 'status'::text;
      v_avant := v_avant || jsonb_build_object('status', old.status);
    end if;
    if new.current_step is distinct from old.current_step then
      champs := champs || 'current_step'::text;
      v_avant := v_avant || jsonb_build_object('current_step', old.current_step);
    end if;
    if new.owner_id is distinct from old.owner_id then
      champs := champs || 'owner_id'::text;
      v_avant := v_avant || jsonb_build_object('owner_id', old.owner_id, 'seller', old.seller);
    end if;
    if new.total_paid is distinct from old.total_paid then
      champs := champs || 'total_paid'::text;
      v_avant := v_avant || jsonb_build_object('total_paid', old.total_paid);
    end if;
    if new.deleted is distinct from old.deleted then
      champs := champs || 'deleted'::text;
      v_avant := v_avant || jsonb_build_object('deleted', old.deleted);
    end if;
    if cardinality(champs) = 0 then
      return null;
    end if;
  end if;

  begin
    insert into public.deal_historique (
      deal_id, contact, ac_mdate, evenement, changements,
      pipeline_id, pipeline_title, stage_id, stage, status, current_step,
      owner_id, seller, total_paid, deleted, avant
    ) values (
      new.id, new.contact, new.mdate,
      case when tg_op = 'INSERT' then 'creation' else 'mouvement' end,
      champs,
      new.pipeline_id, new.pipeline_title, new.stage_id, new.stage, new.status, new.current_step,
      new.owner_id, new.seller, new.total_paid, new.deleted,
      case when tg_op = 'INSERT' then null else v_avant end
    );
  exception when others then
    raise warning 'deal_historique : deal % non historisé (%)', new.id, sqlerrm;
  end;
  return null;
end;
$$;

revoke all on function public.deal_historique_enregistrer() from public, anon, authenticated;

drop trigger if exists deal_historique_trg on public.activecampaign_deals;
create trigger deal_historique_trg
  after insert or update on public.activecampaign_deals
  for each row execute function public.deal_historique_enregistrer();
