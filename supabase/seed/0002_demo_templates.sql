-- =============================================================================
-- منصة غرس (Ghars) — قوالب تجريبية للعرض الاستثماري
-- يدعم سيناريو: الالتزام → تنظيم المهام اليومية (انظر docs/INVESTOR_DEMO.md)
-- بيانات تجريبية قابلة للتعديل.
-- =============================================================================

-- هدف جاهز: تنظيم المهام اليومية (قيمة الالتزام / فرعية التنظيم)
insert into goal_templates
  (core_value_id, sub_value_id, age_stage_id, title_ar, description_ar,
   difficulty, suggested_duration_days, success_criteria_ar, is_published)
select
  cv.id, sv.id, ast.id,
  'تنظيم المهام اليومية',
  'يتعلّم الابن ترتيب مهامه اليومية ومراجعتها بانتظام لبناء عادة التنظيم.',
  'easy', 7,
  'إكمال 5 مراجعات لقائمة المهام خلال أسبوع.',
  true
from core_values cv
join sub_values sv on sv.core_value_id = cv.id and sv.key = 'organization'
join age_stages ast on ast.key = 'middle_childhood'
where cv.key = 'commitment';

-- مهام جاهزة مرتبطة بنفس القيمة/الفرعية
insert into task_templates
  (core_value_id, sub_value_id, age_stage_id, title_ar, description_ar,
   difficulty, repeat_type, proof, needs_guardian_approval, base_xp,
   child_instructions_ar, guardian_guidelines_ar, success_criteria_ar, is_published)
select
  cv.id, sv.id, ast.id, t.title_ar, t.description_ar,
  t.difficulty::difficulty, t.repeat_type::task_repeat, t.proof::proof_type,
  t.needs_approval, t.base_xp,
  t.child_instructions_ar, t.guardian_guidelines_ar, t.success_criteria_ar, true
from core_values cv
join sub_values sv on sv.core_value_id = cv.id and sv.key = 'organization'
join age_stages ast on ast.key = 'middle_childhood'
join (values
  ('راجع قائمة مهامك قبل النوم',
   'قبل النوم، راجع مهام اليوم وحدّد ما أنجزته وما تبقّى.',
   'easy', 'daily', 'self_confirm', true, 20,
   'افتح قائمة مهامك وعلّم المكتمل منها.',
   'تأكد أن الابن راجع القائمة فعليًا قبل الاعتماد.',
   'مراجعة القائمة 5 أيام خلال أسبوع.'),
  ('رتّب أدواتك المدرسية مساءً',
   'تجهيز الحقيبة والأدوات لليوم التالي.',
   'easy', 'daily', 'guardian_direct', true, 15,
   'جهّز حقيبتك وأدواتك قبل النوم.',
   'اعتمد المهمة عند رؤية الأدوات مجهّزة.',
   'تجهيز الأدوات 5 أيام خلال أسبوع.'),
  ('اكتب خطة يومك الصباحية',
   'كتابة 3 مهام رئيسية لليوم في الصباح.',
   'medium', 'daily', 'note', true, 25,
   'اكتب أهم 3 مهام تريد إنجازها اليوم.',
   'راجع الخطة وشجّع الابن على الالتزام بها.',
   'كتابة خطة لـ 5 أيام خلال أسبوع.')
) as t(title_ar, description_ar, difficulty, repeat_type, proof, needs_approval,
       base_xp, child_instructions_ar, guardian_guidelines_ar, success_criteria_ar)
  on true
where cv.key = 'commitment';
