-- =============================================================================
-- منصة قِيَم — دخول الطفل وتجربته (Phase 1)
-- Migration 0011_child_auth
--
-- ولي الأمر ينشئ/يعدّل دخول الطفل (اسم مستخدم + كلمة مرور) عبر دالة آمنة.
-- الطفل يحصل على حساب مصادقة حقيقي بنطاق محجوز @kids.qiyam.local، ويقرأ بياناته
-- فقط (لا كتابة حرة على XP/الشارات). كل كتابة عبر دوال SECURITY DEFINER محمية.
-- =============================================================================

alter table children add column if not exists auth_user_id uuid;
alter table children add column if not exists username text;
alter table children add column if not exists nickname text;
alter table children add column if not exists public_name_mode text not null default 'nickname'
  check (public_name_mode in ('nickname','first_name','full_name'));
create unique index if not exists children_username_key on children(username) where username is not null;
create unique index if not exists children_auth_user_key on children(auth_user_id) where auth_user_id is not null;

create or replace function ghars_child_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from children where auth_user_id = auth.uid() limit 1;
$$;
grant execute on function ghars_child_id() to authenticated;

-- إنشاء/تعديل بيانات دخول الطفل (ولي الأمر فقط)
create or replace function set_child_login(p_child_id uuid, p_username text, p_password text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid; v_email text; v_user text;
begin
  if not exists (select 1 from children c join families f on f.id=c.family_id
                 where c.id=p_child_id and f.owner_id=auth.uid()) then
    raise exception 'not allowed';
  end if;
  v_user := lower(btrim(p_username));
  if v_user !~ '^[a-z0-9_]{3,30}$' then raise exception 'invalid_username'; end if;
  if length(coalesce(p_password,'')) < 4 then raise exception 'weak_password'; end if;
  v_email := v_user || '@kids.qiyam.local';

  select auth_user_id into v_uid from children where id=p_child_id;
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
      created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,
      email_change_token_new,email_change)
    values ('00000000-0000-0000-0000-000000000000',v_uid,'authenticated','authenticated',v_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),now(),now(),now(),
      '{"provider":"email","providers":["email"],"role":"child"}','{"role":"child"}','','','','');
    insert into auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
    values (gen_random_uuid(),v_uid,jsonb_build_object('sub',v_uid::text,'email',v_email),'email',v_email,now(),now(),now());
    update children set auth_user_id=v_uid, username=v_user where id=p_child_id;
  else
    update auth.users set email=v_email,
      encrypted_password=extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at=now() where id=v_uid;
    update auth.identities set identity_data=jsonb_build_object('sub',v_uid::text,'email',v_email),
      provider_id=v_email, updated_at=now() where user_id=v_uid and provider='email';
    update children set username=v_user where id=p_child_id;
  end if;
exception when unique_violation then raise exception 'username_taken';
end $$;
grant execute on function set_child_login(uuid, text, text) to authenticated;

-- صلاحيات قراءة للطفل
create policy child_self_select on children for select to authenticated using (auth_user_id = auth.uid());
create policy child_family_select on children for select to authenticated
  using (family_id = (select c.family_id from children c where c.auth_user_id = auth.uid()));
create policy child_fam_select on families for select to authenticated
  using (id = (select c.family_id from children c where c.auth_user_id = auth.uid()));
create policy child_goals_select on goals for select to authenticated using (child_id = ghars_child_id());
create policy child_tasks_select on tasks for select to authenticated
  using (exists (select 1 from assigned_tasks at where at.task_id = tasks.id and at.child_id = ghars_child_id()));
create policy child_at_select on assigned_tasks for select to authenticated using (child_id = ghars_child_id());
create policy child_tc_select on task_completions for select to authenticated using (child_id = ghars_child_id());
create policy child_xp_select on xp_events for select to authenticated using (child_id = ghars_child_id());
create policy child_cb_select on child_badges for select to authenticated using (child_id = ghars_child_id());
create policy child_ca_select on child_achievements for select to authenticated using (child_id = ghars_child_id());
create policy child_rb_select on reward_boxes for select to authenticated
  using (family_id is null or family_id = (select c.family_id from children c where c.auth_user_id = auth.uid()));
create policy child_rbi_select on reward_box_items for select to authenticated
  using (exists (select 1 from reward_boxes rb where rb.id = reward_box_id
    and (rb.family_id is null or rb.family_id = (select c.family_id from children c where c.auth_user_id = auth.uid()))));
create policy child_rbo_select on reward_box_openings for select to authenticated using (child_id = ghars_child_id());

-- الطفل يُكمل مهمة (محمية)
create or replace function child_complete_task(p_assigned_task_id uuid, p_note text default null, p_photo_path text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_cid uuid; v_needs boolean; v_xp int; v_proof proof_type;
begin
  v_child := ghars_child_id();
  select at.child_id, t.needs_guardian_approval, t.base_xp, t.proof into v_cid, v_needs, v_xp, v_proof
  from assigned_tasks at join tasks t on t.id = at.task_id where at.id = p_assigned_task_id;
  if v_cid is null or v_cid <> v_child then raise exception 'not allowed'; end if;
  insert into task_completions(assigned_task_id, child_id, proof_kind, note_ar, photo_path)
  values (p_assigned_task_id, v_cid, coalesce(v_proof,'self_confirm'), p_note, p_photo_path);
  if v_needs then
    update assigned_tasks set status='submitted', updated_at=now() where id=p_assigned_task_id;
    return 'submitted';
  else
    update assigned_tasks set status='approved', updated_at=now() where id=p_assigned_task_id;
    if v_xp > 0 then
      insert into xp_events(child_id, amount, reason_key, source_table, source_id)
      values (v_cid, v_xp, 'task_completed', 'assigned_tasks', p_assigned_task_id);
    end if;
    return 'approved';
  end if;
end $$;
grant execute on function child_complete_task(uuid, text, text) to authenticated;

-- فتح صندوق مكافأة (طفل أو ولي أمر)
create or replace function open_reward_box(p_opening_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_box uuid; v_cid uuid; v_status text; v_opened int; v_total int; v_item reward_box_items%rowtype;
begin
  select reward_box_id, child_id, status into v_box, v_cid, v_status from reward_box_openings where id=p_opening_id;
  if v_status is null or v_status <> 'available' then raise exception 'not available'; end if;
  if not (v_cid = ghars_child_id() or exists (select 1 from children c join families f on f.id=c.family_id
          where c.id=v_cid and f.owner_id=auth.uid())) then raise exception 'not allowed'; end if;
  select count(*) into v_total from reward_box_items where reward_box_id=v_box;
  if v_total = 0 then raise exception 'empty'; end if;
  select count(*) into v_opened from reward_box_openings where child_id=v_cid and status='opened';
  select * into v_item from reward_box_items where reward_box_id=v_box order by sort_order offset (v_opened % v_total) limit 1;
  update reward_box_openings set item_id=v_item.id, status='opened', opened_at=now() where id=p_opening_id;
  if v_item.kind='xp' and (v_item.payload->>'xp') is not null then
    insert into xp_events(child_id, amount, reason_key, source_table, source_id)
    values (v_cid, (v_item.payload->>'xp')::int, 'reward_box', 'reward_box_openings', p_opening_id);
  end if;
  return v_item.label_ar;
end $$;
grant execute on function open_reward_box(uuid) to authenticated;

-- ترتيب أفراد الأسرة (طفل أو ولي أمر)
create or replace function family_members_ranked()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
    select c.id as child_id, c.display_name as name,
      coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0)::int as total_xp,
      rank() over (order by coalesce((select sum(x.amount) from xp_events x where x.child_id=c.id),0) desc) as rank
    from children c
    where c.family_id = coalesce(
      (select family_id from children where auth_user_id=auth.uid() limit 1),
      (select id from families where owner_id=auth.uid() limit 1))
    order by total_xp desc
  ) r;
$$;
grant execute on function family_members_ranked() to authenticated;

-- ولي الأمر يقرأ صور أبنائه (المسار يبدأ بمعرّف الطفل)
drop policy if exists "qiyam_proofs_select_own" on storage.objects;
create policy "qiyam_proofs_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'qiyam-proofs' and (
    owner = auth.uid()
    or (split_part(name,'/',1))::uuid in (
      select c.id from children c join families f on f.id=c.family_id where f.owner_id = auth.uid())
  ));
