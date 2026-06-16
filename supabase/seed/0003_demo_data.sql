-- =============================================================================
-- منصة غرس (Ghars) — بيانات تجريبية حيّة للعرض الاستثماري
-- أسر متنافسة (مُعلّمة بـ "(تجريبية)") لإظهار الترتيب والمؤشرات مملوءة.
-- idempotent: لا تُزرع مجددًا إذا وُجدت أسر تجريبية.
-- =============================================================================

do $$
declare
  d record;
  v_uid uuid; v_fid uuid; v_cid uuid; v_gid uuid; v_tid uuid;
  v_commit uuid; v_org uuid; v_stage uuid; i int;
begin
  if exists (select 1 from families where name like '%(تجريبية)%') then
    raise notice 'demo already seeded'; return;
  end if;
  select id into v_commit from core_values where key = 'commitment';
  select id into v_org from sub_values where key = 'organization';
  select id into v_stage from age_stages where key = 'late_childhood';

  for d in select * from (values
      ('أسرة الأمل (تجريبية)','سالم',12),
      ('أسرة النور (تجريبية)','ريم',9),
      ('أسرة السكينة (تجريبية)','فهد',7),
      ('أسرة الوفاء (تجريبية)','نورة',15),
      ('أسرة العزم (تجريبية)','يوسف',5),
      ('أسرة البيان (تجريبية)','لمى',10)
    ) as t(fname, cname, approved) loop
    v_uid := gen_random_uuid();
    insert into users(id, role, full_name) values (v_uid, 'guardian', d.fname);
    insert into families(owner_id, name) values (v_uid, d.fname) returning id into v_fid;
    insert into family_members(family_id, user_id, role) values (v_fid, v_uid, 'owner');
    insert into children(family_id, display_name, age, age_stage_id)
      values (v_fid, d.cname, 11, v_stage) returning id into v_cid;
    insert into goals(family_id, child_id, core_value_id, sub_value_id, source, title_ar, measure_ar, status, created_by)
      values (v_fid, v_cid, v_commit, v_org, 'template', 'تنظيم المهام اليومية', '5 مراجعات أسبوعيًا', 'active', v_uid)
      returning id into v_gid;
    for i in 1..d.approved loop
      insert into tasks(goal_id, core_value_id, sub_value_id, title_ar, base_xp, created_by)
        values (v_gid, v_commit, v_org, 'مهمة تنظيم ' || i, 20, v_uid) returning id into v_tid;
      insert into assigned_tasks(task_id, child_id, assigned_by, status) values (v_tid, v_cid, v_uid, 'approved');
      insert into xp_events(child_id, amount, reason_key, source_table) values (v_cid, 20, 'task_completed', 'assigned_tasks');
    end loop;
  end loop;
end $$;
