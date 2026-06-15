-- =============================================================================
-- منصة غرس (Ghars) — المخطط الأولي لقاعدة البيانات
-- Migration 0001_init
--
-- ملاحظة: مخطط أولي قابل للتعديل (انظر docs/DATA_MODEL.md).
-- النموذج: القيمة → الهدف → المهمة → التنفيذ → الاعتماد → القياس → التلعيب → التقارير
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- ENUMs
-- -----------------------------------------------------------------------------
create type user_role        as enum ('guardian', 'content_manager', 'system_admin');
create type family_member_role as enum ('owner', 'co_guardian');
create type difficulty        as enum ('easy', 'medium', 'hard');
create type task_repeat       as enum ('daily', 'weekly', 'one_time', 'family_challenge', 'reflection', 'behavioral');
create type proof_type        as enum ('self_confirm', 'note', 'choice_list', 'guardian_direct', 'photo', 'auto_check');
create type assigned_status   as enum ('assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'redo_requested');
create type review_action     as enum ('approved', 'rejected', 'redo', 'bonus_xp', 'encouragement');
create type goal_type         as enum ('template', 'custom');
create type goal_status       as enum ('active', 'completed', 'archived');
create type reward_box_status as enum ('locked', 'available', 'opened');
create type report_kind       as enum ('child', 'family', 'admin');
create type consent_kind      as enum ('privacy_policy', 'photo_upload', 'gamification', 'data_processing');

-- =============================================================================
-- 1) الهوية والأسرة
-- =============================================================================

-- ملف المستخدم. مرتبط بـ auth.users في Supabase.
-- الابن لا يملك سطرًا هنا (دخول تابع لولي الأمر).
create table users (
  id          uuid primary key,                 -- = auth.users.id
  role        user_role   not null default 'guardian',
  full_name   text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table families (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references users(id) on delete cascade,
  name        text,                              -- اسم/لقب اختياري
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table family_members (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        family_member_role not null default 'owner',
  created_at  timestamptz not null default now(),
  unique (family_id, user_id)
);

-- المراحل العمرية قابلة للتهيئة (بدل أعمار Hard-coded). TODO: قرار النطاق النهائي.
create table age_stages (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,              -- e.g. 'early_childhood'
  label_ar    text not null,
  min_age     int  not null,
  max_age     int  not null,
  sort_order  int  not null default 0,
  is_draft    boolean not null default true,     -- مسودة حتى الاعتماد النهائي
  created_at  timestamptz not null default now()
);

-- ملف الابن/الابنة. لا حساب مصادقة. بيانات مُقللة (خصوصية).
create table children (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  display_name  text not null,                   -- اسم/لقب/اسم مختصر
  age           int,
  age_stage_id  uuid references age_stages(id) on delete set null,
  gender        text,                            -- اختياري؛ فقط إذا لزم للتخصيص
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- 2) القيم والأهداف والمهام
-- =============================================================================

-- القيم الرئيسية الأربع (الجدول قابل للتوسعة؛ الواجهة تعرض الأربع فقط في MVP).
create table core_values (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,              -- respect | cooperation | care | commitment
  label_ar    text not null,
  description_ar text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

create table sub_values (
  id            uuid primary key default gen_random_uuid(),
  core_value_id uuid not null references core_values(id) on delete cascade,
  key           text not null,
  label_ar      text not null,
  sort_order    int not null default 0,
  unique (core_value_id, key)
);

-- مكتبة الأهداف الجاهزة (يديرها مدير المحتوى).
create table goal_templates (
  id            uuid primary key default gen_random_uuid(),
  core_value_id uuid not null references core_values(id) on delete restrict,
  sub_value_id  uuid references sub_values(id) on delete set null,
  age_stage_id  uuid references age_stages(id) on delete set null,
  title_ar      text not null,
  description_ar text,
  difficulty    difficulty not null default 'easy',
  suggested_duration_days int,
  success_criteria_ar text,
  is_published  boolean not null default false,  -- مسار اعتماد المحتوى
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- الأهداف الفعلية (جاهزة معتمدة أو خاصة) المرتبطة بأسرة/ابن.
create table goals (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references families(id) on delete cascade,
  child_id        uuid references children(id) on delete cascade,  -- قد يرتبط بأكثر من ابن عبر assigned_tasks
  core_value_id   uuid not null references core_values(id) on delete restrict,
  sub_value_id    uuid references sub_values(id) on delete set null,
  source          goal_type not null default 'custom',
  template_id     uuid references goal_templates(id) on delete set null,
  title_ar        text not null,
  description_ar  text,
  measure_ar      text,                          -- طريقة قياس مبسطة
  start_date      date,
  end_date        date,
  status          goal_status not null default 'active',
  created_by      uuid references users(id) on delete set null,
  created_at      timestamptz not null default now(),
  -- شرط جودة: يجب وجود قيمة + عنوان واضح (قابلية المتابعة تُفرض في طبقة التطبيق).
  constraint goals_title_not_blank check (length(btrim(title_ar)) > 0)
);

-- مكتبة المهام الجاهزة.
create table task_templates (
  id            uuid primary key default gen_random_uuid(),
  core_value_id uuid not null references core_values(id) on delete restrict,
  sub_value_id  uuid references sub_values(id) on delete set null,
  age_stage_id  uuid references age_stages(id) on delete set null,
  title_ar      text not null,
  description_ar text,
  difficulty    difficulty not null default 'easy',
  repeat_type   task_repeat not null default 'daily',
  proof         proof_type  not null default 'self_confirm',
  needs_guardian_approval boolean not null default true,
  base_xp       int not null default 10,
  child_instructions_ar  text,
  guardian_guidelines_ar text,
  success_criteria_ar    text,
  is_published  boolean not null default false,
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- تعريف المهمة الفعلية المرتبطة بهدف.
create table tasks (
  id            uuid primary key default gen_random_uuid(),
  goal_id       uuid not null references goals(id) on delete cascade,
  template_id   uuid references task_templates(id) on delete set null,
  core_value_id uuid not null references core_values(id) on delete restrict,
  sub_value_id  uuid references sub_values(id) on delete set null,
  title_ar      text not null,
  description_ar text,
  difficulty    difficulty not null default 'easy',
  repeat_type   task_repeat not null default 'daily',
  proof         proof_type  not null default 'self_confirm',
  needs_guardian_approval boolean not null default true,
  base_xp       int not null default 10,
  child_instructions_ar  text,
  guardian_guidelines_ar text,
  success_criteria_ar    text,
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- إسناد مهمة لابن محدد.
create table assigned_tasks (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references tasks(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  assigned_by   uuid references users(id) on delete set null,
  status        assigned_status not null default 'assigned',
  start_date    date,
  end_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- 3) التنفيذ والاعتماد
-- =============================================================================

create table task_completions (
  id                uuid primary key default gen_random_uuid(),
  assigned_task_id  uuid not null references assigned_tasks(id) on delete cascade,
  child_id          uuid not null references children(id) on delete cascade,
  proof_kind        proof_type not null default 'self_confirm',
  note_ar           text,                        -- ملاحظة/انعكاس قصير
  photo_path        text,                        -- يُستخدم فقط إذا اعتُمد رفع الصور
  submitted_at      timestamptz not null default now()
);

create table guardian_reviews (
  id                  uuid primary key default gen_random_uuid(),
  task_completion_id  uuid not null references task_completions(id) on delete cascade,
  reviewer_id         uuid references users(id) on delete set null,
  action              review_action not null,
  bonus_xp            int not null default 0,
  comment_ar          text,
  created_at          timestamptz not null default now()
);

-- =============================================================================
-- 4) التلعيب
-- =============================================================================

-- XP كسجل أحداث (وليس رقمًا إجماليًا). كل حدث له سبب واضح.
create table xp_events (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  amount      int  not null,                     -- موجب عادة
  reason_key  text not null,                     -- task_completed | guardian_approved | streak_3 | challenge | weekly_goal
  source_table text,                             -- مرجع اختياري (assigned_tasks, ...)
  source_id   uuid,
  created_at  timestamptz not null default now()
);

create index xp_events_child_idx on xp_events(child_id);

create table levels (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,              -- seed | seedling | sprout | tree | fruitful | role_model
  label_ar    text not null,                     -- بذرة | غرسة | نبتة | شجرة | مثمر | قدوة (مؤقت — TODO اعتماد)
  min_xp      int not null,
  sort_order  int not null default 0
);

create table badges (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  label_ar    text not null,
  description_ar text,
  core_value_id uuid references core_values(id) on delete set null,
  condition_ar  text not null,                   -- شرط واضح لكل شارة
  created_at  timestamptz not null default now()
);

create table child_badges (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  badge_id    uuid not null references badges(id) on delete cascade,
  awarded_at  timestamptz not null default now(),
  unique (child_id, badge_id)
);

-- صناديق المكافآت (ليست Loot Boxes: لا عشوائية ضارة، لا دفع، إنجاز حقيقي فقط).
create table reward_boxes (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid references families(id) on delete cascade,  -- null = قالب عام
  title_ar      text not null,
  unlock_condition_ar text not null,             -- شرط الفتح معروف لولي الأمر
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table reward_box_items (
  id            uuid primary key default gen_random_uuid(),
  reward_box_id uuid not null references reward_boxes(id) on delete cascade,
  kind          text not null,                   -- message | xp | badge | family_privilege | activity_choice | appreciation | custom
  label_ar      text not null,
  payload       jsonb,                           -- e.g. {"xp": 20} أو {"badge_key": "organization"}
  sort_order    int not null default 0
);

create table reward_box_openings (
  id            uuid primary key default gen_random_uuid(),
  reward_box_id uuid not null references reward_boxes(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  item_id       uuid references reward_box_items(id) on delete set null,
  status        reward_box_status not null default 'opened',
  opened_at     timestamptz not null default now()
);

create table achievements (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  label_ar    text not null,
  description_ar text,
  created_at  timestamptz not null default now()
);

create table child_achievements (
  id              uuid primary key default gen_random_uuid(),
  child_id        uuid not null references children(id) on delete cascade,
  achievement_id  uuid not null references achievements(id) on delete cascade,
  achieved_at     timestamptz not null default now(),
  unique (child_id, achievement_id)
);

create table family_challenges (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  title_ar      text not null,
  description_ar text,
  core_value_id uuid references core_values(id) on delete set null,
  start_date    date,
  end_date      date,
  reward_xp     int not null default 50,
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- 5) التقارير والحوكمة
-- =============================================================================

create table reports (
  id          uuid primary key default gen_random_uuid(),
  kind        report_kind not null,
  family_id   uuid references families(id) on delete cascade,
  child_id    uuid references children(id) on delete cascade,
  period_start date,
  period_end   date,
  payload     jsonb,                             -- لقطة مؤشرات مجمّعة
  created_at  timestamptz not null default now()
);

-- سجل الموافقات (خصوصية، صور، تلعيب).
create table consent_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  family_id   uuid references families(id) on delete cascade,
  kind        consent_kind not null,
  granted     boolean not null,
  version     text,                              -- نسخة السياسة
  created_at  timestamptz not null default now()
);

-- سجل العمليات الحساسة (حذف بيانات، تغييرات صلاحيات).
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references users(id) on delete set null,
  action      text not null,
  entity      text,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- ملاحظات Row Level Security (RLS)
-- =============================================================================
-- يجب تفعيل RLS على جداول بيانات الأسرة/الأطفال قبل أي إطلاق:
--   - ولي الأمر يصل فقط لبيانات أسرته (عبر family_members / families.owner_id).
--   - children/goals/tasks/assigned_tasks/... تُقيَّد بانتماء الأسرة.
--   - مدير المحتوى يصل لمكتبة القوالب فقط، لا لبيانات الأطفال الفردية.
--   - التقارير العامة تُبنى من Aggregations/Views مجهولة الهوية.
-- سيُضاف ذلك في migration 0003_rls.sql بعد استقرار المخطط. (TODO)
