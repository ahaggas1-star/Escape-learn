-- =============================================================================
-- منصة قِيَم — نظام العملات + صناديق المكافآت بأنواعها
-- Migration 0013_rewards_coins
--
-- العملات (Coins): يكسبها الطفل تلقائيًا عند كسب نقاط خبرة من إنجاز حقيقي،
-- ويصرفها على فتح صناديق ينشئها ولي الأمر بثلاثة أنواع وتكلفة محدّدة.
-- =============================================================================

create table if not exists coin_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  amount int not null,
  reason_key text not null,            -- earned | spend
  source_table text, source_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists coin_events_child_idx on coin_events(child_id);
alter table coin_events enable row level security;
create policy coin_owner_read on coin_events for select to authenticated using (ghars_owns_child(child_id));
create policy coin_child_read on coin_events for select to authenticated using (child_id = ghars_child_id());

-- كسب العملات تلقائيًا من نقاط الخبرة (لا من فتح الصناديق)
create or replace function earn_coins_from_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.reason_key in ('task_completed','guardian_bonus','collective','family_challenge','streak_3') then
    insert into coin_events(child_id, amount, reason_key, source_table, source_id)
    values (new.child_id, greatest(1, ceil(new.amount/5.0)::int), 'earned', new.source_table, new.source_id);
  end if;
  return new;
end $$;
drop trigger if exists trg_earn_coins on xp_events;
create trigger trg_earn_coins after insert on xp_events for each row execute function earn_coins_from_xp();

-- أنواع الصناديق وتكلفتها
alter table reward_boxes add column if not exists box_type text not null default 'normal'
  check (box_type in ('normal','special','awesome'));
alter table reward_boxes add column if not exists cost_coins int not null default 0;
alter table reward_boxes add column if not exists is_active boolean not null default true;

-- ولي الأمر يدير عناصر صناديق أسرته
drop policy if exists rbi_owner_write on reward_box_items;
create policy rbi_owner_write on reward_box_items for all to authenticated
  using (exists (select 1 from reward_boxes rb where rb.id=reward_box_id and rb.family_id is not null and ghars_owns_family(rb.family_id)))
  with check (exists (select 1 from reward_boxes rb where rb.id=reward_box_id and rb.family_id is not null and ghars_owns_family(rb.family_id)));

create or replace function child_coins(p_child_id uuid)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount),0)::int from coin_events where child_id=p_child_id;
$$;
grant execute on function child_coins(uuid) to authenticated;

-- الطفل يفتح صندوقًا بصرف العملات (محمي)
create or replace function open_box(p_box_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_fam uuid; v_cost int; v_active boolean; v_boxfam uuid; v_bal int; v_total int; v_opened int; v_item reward_box_items%rowtype;
begin
  v_child := ghars_child_id();
  if v_child is null then raise exception 'not allowed'; end if;
  select family_id into v_fam from children where id=v_child;
  select cost_coins, is_active, family_id into v_cost, v_active, v_boxfam from reward_boxes where id=p_box_id;
  if v_cost is null then raise exception 'not found'; end if;
  if not v_active then raise exception 'inactive'; end if;
  if not (v_boxfam is null or v_boxfam = v_fam) then raise exception 'not allowed'; end if;
  if v_cost > 0 then
    v_bal := child_coins(v_child);
    if v_bal < v_cost then raise exception 'insufficient_coins'; end if;
    insert into coin_events(child_id, amount, reason_key, source_table, source_id)
    values (v_child, -v_cost, 'spend', 'reward_boxes', p_box_id);
  end if;
  select count(*) into v_total from reward_box_items where reward_box_id=p_box_id;
  if v_total = 0 then raise exception 'empty'; end if;
  select count(*) into v_opened from reward_box_openings where child_id=v_child;
  select * into v_item from reward_box_items where reward_box_id=p_box_id order by sort_order offset (v_opened % v_total) limit 1;
  insert into reward_box_openings(reward_box_id, child_id, item_id, status, opened_at)
  values (p_box_id, v_child, v_item.id, 'opened', now());
  if v_item.kind='xp' and (v_item.payload->>'xp') is not null then
    insert into xp_events(child_id, amount, reason_key, source_table, source_id)
    values (v_child, (v_item.payload->>'xp')::int, 'reward_box', 'reward_box_openings', p_box_id);
  end if;
  return json_build_object('kind', v_item.kind, 'label', v_item.label_ar);
end $$;
grant execute on function open_box(uuid) to authenticated;
