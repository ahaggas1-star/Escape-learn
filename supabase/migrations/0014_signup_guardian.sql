-- =============================================================================
-- منصة قِيَم — تسجيل ولي أمر جديد بشكل موثوق
-- Migration 0014_signup_guardian
--
-- ينشئ حساب ولي أمر مؤكَّدًا فورًا (يتجاوز أي إعداد تأكيد بريد/SMTP) مع رسائل
-- خطأ واضحة. ثم يسجّل التطبيق الدخول مباشرة بكلمة المرور.
-- =============================================================================

create or replace function signup_guardian(p_email text, p_password text)
returns text language plpgsql security definer set search_path = public as $$
declare v_uid uuid; v_email text;
begin
  v_email := lower(btrim(p_email));
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'invalid_email'; end if;
  if length(coalesce(p_password,'')) < 6 then raise exception 'weak_password'; end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then raise exception 'email_taken'; end if;

  v_uid := gen_random_uuid();
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change)
  values ('00000000-0000-0000-0000-000000000000',v_uid,'authenticated','authenticated',v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),now(),now(),now(),
    '{"provider":"email","providers":["email"]}','{}','','','','');
  insert into auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  values (gen_random_uuid(),v_uid,jsonb_build_object('sub',v_uid::text,'email',v_email),'email',v_email,now(),now(),now());
  return 'ok';
exception when unique_violation then raise exception 'email_taken';
end $$;

grant execute on function signup_guardian(text, text) to anon, authenticated;
