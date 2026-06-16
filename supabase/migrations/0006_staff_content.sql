-- =============================================================================
-- منصة قِيَم — صلاحيات طاقم المحتوى (لوحة التحكم)
-- Migration 0006_staff_content
--
-- قرار #15: مكتبة الأهداف/المهام يديرها دور content_manager (وأيضًا system_admin).
-- تُضاف سياسات إدارة كاملة فوق سياسات القراءة العامة في 0002_rls.
-- =============================================================================

create or replace function ghars_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from users u
    where u.id = auth.uid() and u.role in ('content_manager', 'system_admin')
  );
$$;

create policy staff_core_values    on core_values    for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_sub_values     on sub_values     for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_age_stages     on age_stages     for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_goal_templates on goal_templates for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_task_templates on task_templates for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_badges         on badges         for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_levels         on levels         for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
create policy staff_achievements   on achievements   for all to authenticated using (ghars_is_staff()) with check (ghars_is_staff());
