-- =============================================================================
-- منصة قِيَم — تخزين إثباتات الصور
-- Migration 0008_storage_proofs
--
-- قرار #5: السماح برفع صور كإثبات (بموافقة ولي الأمر). صندوق خاص (غير عام)
-- يحترم خصوصية الطفل؛ المستخدم يرفع ويقرأ/يحذف ما يملكه فقط، وتُعرض عبر روابط موقّعة.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('qiyam-proofs', 'qiyam-proofs', false)
on conflict (id) do nothing;

create policy "qiyam_proofs_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'qiyam-proofs');

create policy "qiyam_proofs_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'qiyam-proofs' and owner = auth.uid());

create policy "qiyam_proofs_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'qiyam-proofs' and owner = auth.uid());
