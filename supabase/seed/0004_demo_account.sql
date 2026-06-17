-- =============================================================================
-- منصة قِيَم — حساب تجريبي حيّ (ولي أمر + طفل + بيانات) — للعرض
-- ولي الأمر: demo@qiyam.app / Qiyam@1234 (مدير نظام)
-- الطفل:    abdullah / Child@123
-- idempotent: لا يُعاد إذا وُجد الحساب.
-- =============================================================================

do $$
declare
  uid uuid := gen_random_uuid();
  child_uid uuid := gen_random_uuid();
  fid uuid; cid uuid; gid uuid; tid uuid; rbid uuid;
  commit_id uuid; org_id uuid; stage uuid; i int;
begin
  if exists (select 1 from auth.users where email = 'demo@qiyam.app') then
    raise notice 'demo account exists'; return;
  end if;

  -- ولي الأمر (حساب مصادقة مؤكَّد)
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,
    raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','demo@qiyam.app',
    extensions.crypt('Qiyam@1234', extensions.gen_salt('bf')),now(),now(),now(),
    '{"provider":"email","providers":["email"]}','{}','','','','');
  insert into auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  values (gen_random_uuid(),uid,jsonb_build_object('sub',uid::text,'email','demo@qiyam.app'),'email','demo@qiyam.app',now(),now(),now());

  insert into users(id,role,full_name,email) values (uid,'system_admin','حساب تجريبي','demo@qiyam.app');
  insert into families(owner_id,name) values (uid,'أسرتي') returning id into fid;
  insert into family_members(family_id,user_id,role) values (fid,uid,'owner');

  select id into commit_id from core_values where key='commitment';
  select id into org_id from sub_values where key='organization';
  select id into stage from age_stages where key='middle_childhood';

  insert into children(family_id,display_name,age,age_stage_id,nickname) values (fid,'عبدالله',10,stage,'عبودي') returning id into cid;
  insert into goals(family_id,child_id,core_value_id,sub_value_id,source,title_ar,measure_ar,status,created_by)
    values (fid,cid,commit_id,org_id,'template','تنظيم المهام اليومية','5 مراجعات أسبوعيًا','active',uid) returning id into gid;

  for i in 1..6 loop
    insert into tasks(goal_id,core_value_id,sub_value_id,title_ar,base_xp,created_by)
      values (gid,commit_id,org_id,'مهمة تنظيم '||i,20,uid) returning id into tid;
    insert into assigned_tasks(task_id,child_id,assigned_by,status) values (tid,cid,uid,'approved');
    insert into xp_events(child_id,amount,reason_key,source_table) values (cid,20,'task_completed','assigned_tasks');
  end loop;

  -- مهمة إثبات بالصورة (قيد التنفيذ)
  insert into tasks(goal_id,core_value_id,sub_value_id,title_ar,description_ar,proof,needs_guardian_approval,base_xp,child_instructions_ar,created_by)
    values (gid,commit_id,org_id,'صوّر مكتبك بعد ترتيبه','أرفق صورة كإثبات.','photo',true,30,'رتّب مكتبك وصوّره.',uid) returning id into tid;
  insert into assigned_tasks(task_id,child_id,assigned_by,status) values (tid,cid,uid,'assigned');

  -- شارات وإنجاز
  insert into child_badges(child_id,badge_id) select cid,id from badges where key in ('commitment_badge','organization_badge');
  insert into child_achievements(child_id,achievement_id) select cid,id from achievements where key='first_task';

  -- دخول الطفل (abdullah / Child@123)
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,
    raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change_token_new,email_change)
  values ('00000000-0000-0000-0000-000000000000',child_uid,'authenticated','authenticated','abdullah@kids.qiyam.local',
    extensions.crypt('Child@123', extensions.gen_salt('bf')),now(),now(),now(),
    '{"provider":"email","providers":["email"],"role":"child"}','{"role":"child"}','','','','');
  insert into auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  values (gen_random_uuid(),child_uid,jsonb_build_object('sub',child_uid::text,'email','abdullah@kids.qiyam.local'),'email','abdullah@kids.qiyam.local',now(),now(),now());
  update children set auth_user_id=child_uid, username='abdullah' where id=cid;

  -- صناديق المكافآت (3 أنواع)
  insert into reward_boxes(family_id,box_type,cost_coins,title_ar,unlock_condition_ar,created_by)
    values (fid,'normal',0,'الصندوق العادي','مجاني',uid) returning id into rbid;
  insert into reward_box_items(reward_box_id,kind,label_ar,payload,sort_order) values
    (rbid,'message','رسالة تشجيع: أحسنت! استمر 🌱',null,1),
    (rbid,'xp','+10 نقطة خبرة','{"xp":10}'::jsonb,2),
    (rbid,'appreciation','بطاقة تقدير',null,3);

  insert into reward_boxes(family_id,box_type,cost_coins,title_ar,unlock_condition_ar,created_by)
    values (fid,'special',15,'الصندوق المميز','يُفتح بـ 15 عملة',uid) returning id into rbid;
  insert into reward_box_items(reward_box_id,kind,label_ar,payload,sort_order) values
    (rbid,'message','رسالة من ولي الأمر: فخور بك يا بطل! 🌟',null,1),
    (rbid,'xp','+20 نقطة خبرة','{"xp":20}'::jsonb,2),
    (rbid,'appreciation','بطاقة تقدير مميزة',null,3);

  insert into reward_boxes(family_id,box_type,cost_coins,title_ar,unlock_condition_ar,created_by)
    values (fid,'awesome',30,'الصندوق الرهيب','يُفتح بـ 30 عملة',uid) returning id into rbid;
  insert into reward_box_items(reward_box_id,kind,label_ar,payload,sort_order) values
    (rbid,'message','أسطوري! اختر نشاطك المفضّل 🎉',null,1),
    (rbid,'xp','+40 نقطة خبرة','{"xp":40}'::jsonb,2),
    (rbid,'privilege','امتياز عائلي خاص',null,3);

  -- إنجازات جماعية (رسمي + عائلي)
  insert into collective_achievements(scope,title_ar,description_ar,icon,core_value_id,target,per_child_cap,reward_xp,is_published,counts_in_ranking)
    values ('official','تحدي الالتزام الشهري','أكملوا كأسرة مهام الالتزام المعتمدة لتفتحوا المكافأة الجماعية!','⏰',commit_id,10,6,80,true,true);
  insert into collective_achievements(scope,family_id,title_ar,description_ar,icon,target,per_child_cap,reward_xp,created_by)
    values ('family',fid,'محيط العائلة','هدفنا الجماعي: نكمل 8 مهام معتمدة معًا 💪','🤝',8,5,40,uid);
end $$;
