-- =============================================================================
-- منصة قِيَم — تأكيد تلقائي للحسابات الجديدة
-- Migration 0009_auto_confirm
--
-- راحة للتسجيل دون انتظار تأكيد البريد (بديل لتعطيل "Confirm email" من اللوحة).
-- قابل للإلغاء بحذف المشغّل. للإنتاج يُفضّل إعداد تأكيد بريد حقيقي.
-- =============================================================================

create or replace function auto_confirm_user()
returns trigger language plpgsql security definer as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists ghars_auto_confirm on auth.users;
create trigger ghars_auto_confirm before insert on auth.users
  for each row execute function auto_confirm_user();
