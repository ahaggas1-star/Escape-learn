-- =============================================================================
-- منصة غرس (Ghars) — مؤشرات التقارير العامة
-- Migration 0003_reports
--
-- مؤشرات عامة مجهولة الهوية للمنصة (تجميع فقط — لا تُخرج بيانات أطفال فردية).
-- SECURITY DEFINER ليتجاوز RLS مع إخراج أرقام مجمّعة فقط (الخصوصية أولًا).
-- ملاحظة: تقارير الابن والأسرة تُبنى من استعلامات مقيّدة بـ RLS في طبقة التطبيق.
-- =============================================================================

create or replace function platform_metrics()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'families',        (select count(*) from families),
    'children',        (select count(*) from children),
    'goals',           (select count(*) from goals),
    'goals_custom',    (select count(*) from goals where source = 'custom'),
    'tasks_assigned',  (select count(*) from assigned_tasks),
    'tasks_completed', (select count(*) from assigned_tasks where status = 'approved'),
    'reward_opens',    (select count(*) from reward_box_openings where status = 'opened'),
    'badges_awarded',  (select count(*) from child_badges),
    'completion_rate', (select case when count(*) = 0 then 0
                          else round(100.0 * count(*) filter (where status = 'approved') / count(*)) end
                        from assigned_tasks),
    'top_values',      (select coalesce(json_agg(t), '[]'::json) from (
                          select cv.label_ar as value, count(g.id) as goals
                          from core_values cv
                          left join goals g on g.core_value_id = cv.id
                          group by cv.id, cv.label_ar order by goals desc
                        ) t)
  );
$$;

grant execute on function platform_metrics() to authenticated, anon;
