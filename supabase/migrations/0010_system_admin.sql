-- =============================================================================
-- منصة قِيَم — لوحة مدير النظام + تسجيل العمليات + حق الحذف
-- Migration 0010_system_admin
--
-- الدور 7.4 (مدير النظام) ومتطلبات الخصوصية: تسجيل العمليات الحساسة،
-- وقراءة سجلات الموافقات/العمليات لمدير النظام.
-- =============================================================================

-- تسجيل عملية حساسة (حذف بيانات...) في audit_logs بأمان.
create or replace function log_audit(p_action text, p_entity text, p_entity_id uuid, p_metadata jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_metadata);
end $$;

grant execute on function log_audit(text, text, uuid, jsonb) to authenticated;

-- مدير النظام يقرأ سجلات الموافقات والعمليات (لا يكتبها المستخدمون مباشرة).
create policy admin_read_consent on consent_logs for select to authenticated using (ghars_is_admin());
create policy admin_read_audit   on audit_logs   for select to authenticated using (ghars_is_admin());
