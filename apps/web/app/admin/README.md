# لوحة إدارة المحتوى — /admin

مدمجة في `apps/web` تحت المسار `/admin` (بدل تطبيق منفصل، لإعادة استخدام المصادقة
وعميل Supabase). فصلها كـ `apps/admin` مستقل مدرج في `docs/BACKLOG.md`.

## الصلاحية

محميّة بدور المستخدم في جدول `users`: `content_manager` أو `system_admin`.
غير الطاقم يُعاد توجيهه إلى `/dashboard`. الأمان مفروض أيضًا على مستوى قاعدة
البيانات عبر سياسات RLS (`ghars_is_staff()` في `0006_staff_content.sql`).

## ترقية مستخدم إلى طاقم المحتوى

بعد تسجيل المستخدم، يُحدَّث دوره (مؤقتًا عبر SQL حتى بناء واجهة الأدوار):

```sql
-- في سكيمة ghars (مشروع مشترك):
update ghars.users set role = 'content_manager' where email = 'EMAIL_HERE';
-- أو مدير نظام:
update ghars.users set role = 'system_admin' where email = 'EMAIL_HERE';
```

## المسارات

- `/admin` — لوحة بإحصاءات وروابط.
- `/admin/goals` — إنشاء/نشر الأهداف الجاهزة (`goal_templates`).
- `/admin/tasks` — إنشاء/نشر المهام الجاهزة (`task_templates`).
- `/admin/values` — عرض القيم/الفرعية + إضافة قيمة رئيسية (مع فئة عمرية) أو فرعية.

> النشر (`is_published`) هو مسار اعتماد المحتوى (قرار #10): القوالب غير المنشورة لا
> تظهر لأولياء الأمور.
