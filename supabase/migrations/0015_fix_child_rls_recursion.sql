-- =============================================================================
-- منصة قِيَم — إصلاح تكرار لا نهائي في سياسات RLS الخاصة بدخول الطفل
-- Migration 0015_fix_child_rls_recursion
--
-- المشكلة: سياسات الطفل (0011/0012/0013) كانت تستعلم من جدول children مباشرةً
-- داخل سياسة على children نفسه → "infinite recursion detected in policy for
-- relation children". وهذا يُفشل أي إدراج في families مع RETURNING (إنشاء أسرة).
--
-- الحل: دالة SECURITY DEFINER تُرجع family_id للطفل الحالي (تتجاوز RLS)،
-- ونعيد كتابة كل السياسات التي كانت تستعلم children مباشرةً لتستخدمها.
-- =============================================================================

create or replace function ghars_child_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from children where auth_user_id = auth.uid() limit 1;
$$;
grant execute on function ghars_child_family_id() to authenticated;

-- children: قراءة الطفل لإخوته في نفس الأسرة (كانت ذاتية المرجع → تكرار)
drop policy if exists child_family_select on children;
create policy child_family_select on children for select to authenticated
  using (family_id = ghars_child_family_id());

-- families: قراءة الطفل لأسرته
drop policy if exists child_fam_select on families;
create policy child_fam_select on families for select to authenticated
  using (id = ghars_child_family_id());

-- reward_boxes: صناديق أسرة الطفل (أو العامة)
drop policy if exists child_rb_select on reward_boxes;
create policy child_rb_select on reward_boxes for select to authenticated
  using (family_id is null or family_id = ghars_child_family_id());

-- reward_box_items: عناصر صناديق أسرة الطفل
drop policy if exists child_rbi_select on reward_box_items;
create policy child_rbi_select on reward_box_items for select to authenticated
  using (exists (select 1 from reward_boxes rb where rb.id = reward_box_id
    and (rb.family_id is null or rb.family_id = ghars_child_family_id())));

-- collective_achievements: قراءة الإنجازات الرسمية + إنجازات أسرة الطفل/المالك
drop policy if exists coll_read on collective_achievements;
create policy coll_read on collective_achievements for select to authenticated using (
  (scope='official' and is_published)
  or (scope='family' and family_id = coalesce(
        ghars_child_family_id(),
        (select id from families where owner_id=auth.uid() limit 1))));

-- collective_claims: قراءة الطفل لمطالبات أسرته
drop policy if exists claims_child_read on collective_claims;
create policy claims_child_read on collective_claims for select to authenticated
  using (family_id = ghars_child_family_id());
