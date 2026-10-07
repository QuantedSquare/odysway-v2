-- File d'attente des webhooks AC « deal mis à jour ».
--
-- Constat du 07/10/2026 : AC envoie 4 à 5 webhooks dealUpdate pour un même
-- deal en quelques secondes ; chacun refaisait ~8 appels AC, au-delà de la
-- limite de 5 requêtes/s, pendant qu'AC répondait des 590 « internal error ».
-- Un webhook en échec était perdu (500, alerte Slack, miroir non réécrit).
--
-- Une ligne par deal (clé deal_id) : les webhooks d'une rafale se fusionnent
-- sur la même ligne, la dernière charge reçue l'emporte. Le traitement prend la
-- ligne sous bail (locked_until) ; s'il a été redemandé pendant le traitement
-- (requested_at a changé), il repasse une fois. Un échec laisse la ligne en
-- file avec un prochain essai différé ; le cron `ac-deal-sync` la reprend.
--
-- Écrite uniquement côté serveur (service_role), par server/utils/fileDeals.js.
-- RLS activée sans policy. Additive, idempotente.

create table if not exists public.ac_deal_sync_queue (
  deal_id bigint primary key,
  contact_id bigint not null,
  body jsonb not null default '{}'::jsonb,
  event_time text,
  requested_at timestamptz not null default clock_timestamp(),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default clock_timestamp(),
  locked_until timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists ac_deal_sync_queue_next_attempt_idx on public.ac_deal_sync_queue (next_attempt_at);

alter table public.ac_deal_sync_queue enable row level security;

-- Enfile (ou fusionne) un événement. Un deal déjà en attente d'un nouvel essai
-- garde son délai : une rafale de webhooks pendant une panne AC ne doit pas
-- relancer aussitôt les appels.
create or replace function public.ac_deal_sync_enfiler(p_deal_id bigint, p_contact_id bigint, p_body jsonb, p_event_time text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.ac_deal_sync_queue as q (deal_id, contact_id, body, event_time)
  values (p_deal_id, p_contact_id, coalesce(p_body, '{}'::jsonb), p_event_time)
  on conflict (deal_id) do update
    set contact_id = excluded.contact_id,
        body = excluded.body,
        event_time = excluded.event_time,
        requested_at = clock_timestamp();
$$;

-- Prend sous bail jusqu'à p_limite lignes dues et libres (p_deal_id : une seule).
create or replace function public.ac_deal_sync_prendre(p_deal_id bigint, p_limite int, p_bail_secondes int)
returns setof public.ac_deal_sync_queue
language sql
security definer
set search_path = public
as $$
  update public.ac_deal_sync_queue q
     set locked_until = clock_timestamp() + make_interval(secs => p_bail_secondes)
   where q.deal_id in (
     select deal_id from public.ac_deal_sync_queue
      where (p_deal_id is null or deal_id = p_deal_id)
        and next_attempt_at <= clock_timestamp()
        and (locked_until is null or locked_until < clock_timestamp())
      order by next_attempt_at
      limit p_limite
      for update skip locked
   )
  returning q.*;
$$;

-- Succès. Rend true si la ligne est retirée ; false si le deal a été redemandé
-- pendant le traitement : la ligne est alors libérée, due tout de suite.
create or replace function public.ac_deal_sync_terminer(p_deal_id bigint, p_requested_at timestamptz)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.ac_deal_sync_queue where deal_id = p_deal_id and requested_at = p_requested_at;
  if found then
    return true;
  end if;
  update public.ac_deal_sync_queue
     set locked_until = null, attempts = 0, last_error = null, next_attempt_at = clock_timestamp()
   where deal_id = p_deal_id;
  return false;
end;
$$;

-- Échec passager : prochain essai dans p_delai_secondes. Rend le nombre d'essais.
create or replace function public.ac_deal_sync_echec(p_deal_id bigint, p_erreur text, p_delai_secondes int)
returns int
language sql
security definer
set search_path = public
as $$
  update public.ac_deal_sync_queue
     set attempts = attempts + 1,
         last_error = left(p_erreur, 1000),
         next_attempt_at = clock_timestamp() + make_interval(secs => p_delai_secondes),
         locked_until = null
   where deal_id = p_deal_id
  returning attempts;
$$;

revoke all on function public.ac_deal_sync_enfiler(bigint, bigint, jsonb, text) from public, anon, authenticated;
revoke all on function public.ac_deal_sync_prendre(bigint, int, int) from public, anon, authenticated;
revoke all on function public.ac_deal_sync_terminer(bigint, timestamptz) from public, anon, authenticated;
revoke all on function public.ac_deal_sync_echec(bigint, text, int) from public, anon, authenticated;
grant execute on function public.ac_deal_sync_enfiler(bigint, bigint, jsonb, text) to service_role;
grant execute on function public.ac_deal_sync_prendre(bigint, int, int) to service_role;
grant execute on function public.ac_deal_sync_terminer(bigint, timestamptz) to service_role;
grant execute on function public.ac_deal_sync_echec(bigint, text, int) to service_role;
