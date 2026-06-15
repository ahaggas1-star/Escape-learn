-- =============================================================================
-- منصة غرس (Ghars) — Row Level Security
-- Migration 0002_rls
--
-- المبدأ: ولي الأمر يصل فقط لبيانات أسرته. الابن بلا حساب مصادقة (دخول تابع).
-- البيانات المرجعية (القيم، القوالب المنشورة، المستويات...) قابلة للقراءة لأي مستخدم مسجّل.
-- ملاحظة: مدير المحتوى/النظام يُمنح لاحقًا عبر أدوار وسياسات إضافية (TODO).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- دوال مساعدة (SECURITY DEFINER لتفادي التكرار اللانهائي في السياسات)
-- -----------------------------------------------------------------------------
create or replace function ghars_owns_family(fid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from families f where f.id = fid and f.owner_id = auth.uid());
$$;

create or replace function ghars_owns_child(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from children c
    join families f on f.id = c.family_id
    where c.id = cid and f.owner_id = auth.uid()
  );
$$;

create or replace function ghars_owns_goal(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from goals g
    join families f on f.id = g.family_id
    where g.id = gid and f.owner_id = auth.uid()
  );
$$;

create or replace function ghars_owns_assigned_task(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from assigned_tasks at
    join children c on c.id = at.child_id
    join families f on f.id = c.family_id
    where at.id = aid and f.owner_id = auth.uid()
  );
$$;

-- =============================================================================
-- تفعيل RLS
-- =============================================================================
alter table users               enable row level security;
alter table families            enable row level security;
alter table family_members      enable row level security;
alter table children            enable row level security;
alter table age_stages          enable row level security;
alter table core_values         enable row level security;
alter table sub_values          enable row level security;
alter table goal_templates      enable row level security;
alter table goals               enable row level security;
alter table task_templates      enable row level security;
alter table tasks               enable row level security;
alter table assigned_tasks      enable row level security;
alter table task_completions    enable row level security;
alter table guardian_reviews    enable row level security;
alter table xp_events           enable row level security;
alter table levels              enable row level security;
alter table badges              enable row level security;
alter table child_badges        enable row level security;
alter table reward_boxes        enable row level security;
alter table reward_box_items    enable row level security;
alter table reward_box_openings enable row level security;
alter table achievements        enable row level security;
alter table child_achievements  enable row level security;
alter table family_challenges   enable row level security;
alter table reports             enable row level security;
alter table consent_logs        enable row level security;
alter table audit_logs          enable row level security;

-- =============================================================================
-- البيانات المرجعية: قراءة لأي مستخدم مسجّل
-- =============================================================================
create policy ref_read_age_stages   on age_stages  for select to authenticated using (true);
create policy ref_read_core_values  on core_values for select to authenticated using (true);
create policy ref_read_sub_values   on sub_values  for select to authenticated using (true);
create policy ref_read_levels       on levels      for select to authenticated using (true);
create policy ref_read_badges       on badges      for select to authenticated using (true);
create policy ref_read_achievements on achievements for select to authenticated using (true);
-- القوالب: تُقرأ المنشورة فقط
create policy ref_read_goal_tpl on goal_templates for select to authenticated using (is_published);
create policy ref_read_task_tpl on task_templates for select to authenticated using (is_published);

-- =============================================================================
-- users: كل مستخدم يدير سطره فقط
-- =============================================================================
create policy users_self_select on users for select to authenticated using (id = auth.uid());
create policy users_self_upsert on users for insert to authenticated with check (id = auth.uid());
create policy users_self_update on users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- =============================================================================
-- families: المالك فقط
-- =============================================================================
create policy fam_owner_all on families for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- family_members: أعضاء أسرة يملكها المستخدم
create policy fm_owner_all on family_members for all to authenticated
  using (ghars_owns_family(family_id)) with check (ghars_owns_family(family_id));

-- children: ضمن أسرة المالك
create policy child_owner_all on children for all to authenticated
  using (ghars_owns_family(family_id)) with check (ghars_owns_family(family_id));

-- goals: ضمن أسرة المالك
create policy goal_owner_all on goals for all to authenticated
  using (ghars_owns_family(family_id)) with check (ghars_owns_family(family_id));

-- tasks: عبر الهدف
create policy task_owner_all on tasks for all to authenticated
  using (ghars_owns_goal(goal_id)) with check (ghars_owns_goal(goal_id));

-- assigned_tasks: عبر الابن
create policy at_owner_all on assigned_tasks for all to authenticated
  using (ghars_owns_child(child_id)) with check (ghars_owns_child(child_id));

-- task_completions: عبر المهمة المسندة
create policy tc_owner_all on task_completions for all to authenticated
  using (ghars_owns_assigned_task(assigned_task_id))
  with check (ghars_owns_assigned_task(assigned_task_id));

-- guardian_reviews: عبر سجل الإكمال
create policy gr_owner_all on guardian_reviews for all to authenticated
  using (exists (
    select 1 from task_completions tc
    where tc.id = task_completion_id and ghars_owns_assigned_task(tc.assigned_task_id)
  ))
  with check (exists (
    select 1 from task_completions tc
    where tc.id = task_completion_id and ghars_owns_assigned_task(tc.assigned_task_id)
  ));

-- xp_events / child_badges / child_achievements / reward_box_openings: عبر الابن
create policy xp_owner_all  on xp_events          for all to authenticated
  using (ghars_owns_child(child_id)) with check (ghars_owns_child(child_id));
create policy cb_owner_all  on child_badges       for all to authenticated
  using (ghars_owns_child(child_id)) with check (ghars_owns_child(child_id));
create policy ca_owner_all  on child_achievements for all to authenticated
  using (ghars_owns_child(child_id)) with check (ghars_owns_child(child_id));
create policy rbo_owner_all on reward_box_openings for all to authenticated
  using (ghars_owns_child(child_id)) with check (ghars_owns_child(child_id));

-- reward_boxes: قوالب عامة (family_id IS NULL) للقراءة، وصناديق الأسرة للمالك
create policy rb_read_global on reward_boxes for select to authenticated
  using (family_id is null or ghars_owns_family(family_id));
create policy rb_owner_write on reward_boxes for all to authenticated
  using (family_id is not null and ghars_owns_family(family_id))
  with check (family_id is not null and ghars_owns_family(family_id));

-- reward_box_items: عبر الصندوق (عام أو مملوك)
create policy rbi_read on reward_box_items for select to authenticated
  using (exists (
    select 1 from reward_boxes rb
    where rb.id = reward_box_id and (rb.family_id is null or ghars_owns_family(rb.family_id))
  ));

-- family_challenges / reports / consent_logs: ضمن أسرة المالك
create policy fc_owner_all on family_challenges for all to authenticated
  using (ghars_owns_family(family_id)) with check (ghars_owns_family(family_id));
create policy rep_owner_all on reports for all to authenticated
  using (family_id is not null and ghars_owns_family(family_id))
  with check (family_id is not null and ghars_owns_family(family_id));
create policy consent_owner_all on consent_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_logs: لا قراءة/كتابة من المستخدمين العاديين (يُدار من الخادم/الأدمن لاحقًا).
-- (بلا سياسات = مرفوض افتراضيًا تحت RLS)
