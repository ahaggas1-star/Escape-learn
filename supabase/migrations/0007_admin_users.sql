-- =============================================================================
-- منصة قِيَم — إدارة الأدوار لمدير النظام
-- Migration 0007_admin_users
-- مدير النظام (system_admin) يقرأ ويعدّل أدوار المستخدمين من لوحة الإدارة.
-- =============================================================================

create or replace function ghars_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from users u where u.id = auth.uid() and u.role = 'system_admin');
$$;

create policy admin_select_users on users for select to authenticated using (ghars_is_admin());
create policy admin_update_users on users for update to authenticated using (ghars_is_admin()) with check (ghars_is_admin());
