# قاعدة البيانات — Supabase

## الملفات

- `migrations/0001_init.sql` — المخطط (جداول، أنواع) في سكيمة `public`.
- `migrations/0002_rls.sql` — سياسات Row Level Security.
- `seed/0001_seed.sql` — القيم الأربع، الفروع، المراحل، المستويات، الشارات، الإنجازات.
- `seed/0002_demo_templates.sql` — قوالب تجريبية لسيناريو العرض (الالتزام/تنظيم المهام).

## سيناريو (أ): مشروع Supabase مخصّص (موصى به للإنتاج)

ملفات المايقريشن مكتوبة لسكيمة `public`. طبّقها كما هي:

```bash
supabase db push          # أو نفّذ ملفات migrations ثم seed يدويًا
```

ثم في `apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_DB_SCHEMA=public
```

## سيناريو (ب): مشاركة مشروع Supabase قائم (عزل في سكيمة ghars)

عند استخدام مشروع فيه تطبيقات أخرى (لتفادي الاصطدام مع جداول مثل `users`)، تُعزل
غرس في سكيمة مستقلة اسمها `ghars`:

1. تُطبَّق نفس DDL/RLS/Seed لكن داخل سكيمة `ghars` (مع `set search_path = ghars, public`).
2. تُكشَف السكيمة لـ PostgREST:
   ```sql
   alter role authenticator set pgrst.db_schemas = 'public, graphql_public, ghars';
   notify pgrst, 'reload config';
   ```
3. في `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_DB_SCHEMA=ghars
   ```

> **حالة بيئة العرض الحالية:** مطبّقة وفق السيناريو (ب) داخل مشروع Supabase العام
> الحالي، في سكيمة `ghars` معزولة (لا تمسّ أي جدول قائم). القيم والقوالب التجريبية محمّلة.

## ملاحظة على المصادقة

افتراضيًا يطلب Supabase تأكيد البريد عند التسجيل. لتجربة أسرع أثناء التطوير يمكن
تعطيل "Confirm email" من لوحة Supabase: Authentication → Providers → Email.
