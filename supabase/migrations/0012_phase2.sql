-- =============================================================================
-- منصة قِيَم — المرحلة 2: ترتيب الأطفال + مشاركة الإنجاز + الإنجازات الجماعية
-- Migration 0012_phase2
-- =============================================================================

-- رمز مشاركة لكل طفل (لبطاقة الإنجاز العامة)
alter table children add column if not exists share_token text;
create unique index if not exists children_share_token_key on children(share_token) where share_token is not null;
update children set share_token = encode(gen_random_bytes(9),'hex') where share_token is null;

-- ترتيب الأطفال عبر العوائل (بالهوية التي يختارها ولي الأمر لكل طفل)
create or replace function children_leaderboard(p_limit int default 20)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
    select c.id as child_id,
      case c.public_name_mode
        when 'full_name' then c.display_name
        when 'first_name' then split_part(c.display_name, ' ', 1)
        else coalesce(nullif(btrim(c.nickname),''), 'مشارِك') end as name,
      coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0)::int as total_xp,
      rank() over (order by coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0) desc) as rank
    from children c where c.auth_user_id is not null
    order by total_xp desc limit p_limit
  ) r;
$$;
grant execute on function children_leaderboard(int) to authenticated;

-- بطاقة إنجاز عامة (بدون تسجيل دخول) عبر رمز المشاركة
create or replace function public_child_card(p_token text)
returns json language sql stable security definer set search_path = public as $$
  select case when c.id is null then null else json_build_object(
    'name', case c.public_name_mode when 'full_name' then c.display_name
        when 'first_name' then split_part(c.display_name,' ',1)
        else coalesce(nullif(btrim(c.nickname),''),'مشارِك') end,
    'total_xp', coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0),
    'level', (select l.label_ar from levels l
              where l.min_xp <= coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0)
              order by l.min_xp desc limit 1),
    'badges', coalesce((select json_agg(b.label_ar order by cb.awarded_at)
              from child_badges cb join badges b on b.id=cb.badge_id where cb.child_id=c.id), '[]'::json),
    'achievements', coalesce((select json_agg(a.label_ar order by ca.achieved_at)
              from child_achievements ca join achievements a on a.id=ca.achievement_id where ca.child_id=c.id), '[]'::json)
  ) end
  from (select * from children where share_token = p_token limit 1) c;
$$;
grant execute on function public_child_card(text) to anon, authenticated;

-- =============================================================================
-- الإنجازات الجماعية (طبقتان: رسمية من الإدارة + عائلية من ولي الأمر) + سقوف
-- =============================================================================
create table if not exists collective_achievements (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('official','family')),
  family_id uuid references families(id) on delete cascade,
  title_ar text not null, description_ar text, icon text not null default '🎯',
  core_value_id uuid references core_values(id) on delete set null,
  target int not null check (target > 0),
  per_child_cap int not null default 10 check (per_child_cap > 0),
  reward_xp int not null default 50,
  start_date date, end_date date,
  is_published boolean not null default false,
  counts_in_ranking boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists collective_claims (
  id uuid primary key default gen_random_uuid(),
  collective_id uuid not null references collective_achievements(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  unique (collective_id, family_id)
);
alter table collective_achievements enable row level security;
alter table collective_claims enable row level security;

create policy coll_read on collective_achievements for select to authenticated using (
  (scope='official' and is_published)
  or (scope='family' and family_id = coalesce(
        (select family_id from children where auth_user_id=auth.uid() limit 1),
        (select id from families where owner_id=auth.uid() limit 1))));
create policy coll_family_write on collective_achievements for all to authenticated
  using (scope='family' and ghars_owns_family(family_id)) with check (scope='family' and ghars_owns_family(family_id));
create policy coll_staff_official on collective_achievements for all to authenticated
  using (scope='official' and ghars_is_staff()) with check (scope='official' and ghars_is_staff());
create policy claims_owner on collective_claims for all to authenticated
  using (ghars_owns_family(family_id)) with check (ghars_owns_family(family_id));
create policy claims_child_read on collective_claims for select to authenticated
  using (family_id = (select family_id from children where auth_user_id=auth.uid() limit 1));

-- التقدّم: مهام معتمدة فقط + سقف لكل طفل (مكافحة التلاعب)
create or replace function collective_current(p_collective_id uuid, p_family_id uuid)
returns int language sql stable security definer set search_path = public as $$
  with ca as (select * from collective_achievements where id=p_collective_id),
  parts as (
    select least((select per_child_cap from ca), count(at.id)) as capped
    from children c
    left join assigned_tasks at on at.child_id=c.id and at.status='approved'
      and exists (select 1 from tasks t where t.id=at.task_id
                  and ((select core_value_id from ca) is null or t.core_value_id=(select core_value_id from ca)))
      and ((select start_date from ca) is null or at.updated_at::date >= (select start_date from ca))
      and ((select end_date   from ca) is null or at.updated_at::date <= (select end_date   from ca))
    where c.family_id = p_family_id group by c.id
  )
  select least((select target from ca), coalesce(sum(capped),0))::int from parts;
$$;
grant execute on function collective_current(uuid, uuid) to authenticated;

create or replace function family_collectives()
returns json language sql stable security definer set search_path = public as $$
  with fam as (select coalesce(
     (select family_id from children where auth_user_id=auth.uid() limit 1),
     (select id from families where owner_id=auth.uid() limit 1)) as fid)
  select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
    select ca.id, ca.scope, ca.title_ar, ca.description_ar, ca.icon, ca.target, ca.reward_xp,
      collective_current(ca.id, (select fid from fam)) as current,
      exists(select 1 from collective_claims cc where cc.collective_id=ca.id and cc.family_id=(select fid from fam)) as claimed,
      ca.created_at
    from collective_achievements ca, fam
    where (ca.scope='official' and ca.is_published) or (ca.scope='family' and ca.family_id=(select fid from fam))
    order by ca.scope, ca.created_at desc
  ) r;
$$;
grant execute on function family_collectives() to authenticated;

create or replace function claim_collective(p_collective_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_fid uuid; v_target int; v_reward int; v_current int; v_scope text; v_pub boolean; v_cfam uuid;
begin
  select id into v_fid from families where owner_id=auth.uid() limit 1;
  if v_fid is null then raise exception 'not allowed'; end if;
  select target, reward_xp, scope, is_published, family_id into v_target, v_reward, v_scope, v_pub, v_cfam
    from collective_achievements where id=p_collective_id;
  if v_target is null then raise exception 'not found'; end if;
  if not ((v_scope='official' and v_pub) or (v_scope='family' and v_cfam=v_fid)) then raise exception 'not allowed'; end if;
  if exists(select 1 from collective_claims where collective_id=p_collective_id and family_id=v_fid) then raise exception 'already claimed'; end if;
  v_current := collective_current(p_collective_id, v_fid);
  if v_current < v_target then raise exception 'not complete'; end if;
  insert into collective_claims(collective_id, family_id) values (p_collective_id, v_fid);
  insert into xp_events(child_id, amount, reason_key, source_table, source_id)
    select c.id, v_reward, 'collective', 'collective_achievements', p_collective_id from children c where c.family_id=v_fid;
  return 'claimed';
end $$;
grant execute on function claim_collective(uuid) to authenticated;
