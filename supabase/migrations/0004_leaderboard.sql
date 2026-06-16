-- =============================================================================
-- منصة غرس (Ghars) — ترتيب الأسر (Leaderboard) الآمن
-- Migration 0004_leaderboard
--
-- قرار جوهري: التنافس بين الأسر معتمد من صاحب المشروع (OWNER_DECISIONS #7).
-- التصميم الآمن: ترتيب على مستوى الأسر فقط، مجهول الهوية —
--   لا أسماء أطفال ولا أسماء أسر. يُعاد معرّف الأسرة فقط لتمييز "أسرتكم".
-- =============================================================================

create or replace function family_leaderboard()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(row_to_json(r)), '[]'::json)
  from (
    select family_id, total_xp, approved_tasks,
      rank() over (order by total_xp desc, approved_tasks desc) as rank
    from (
      select f.id as family_id,
        coalesce((select sum(x.amount) from xp_events x
                  join children c on c.id = x.child_id where c.family_id = f.id), 0)::bigint as total_xp,
        coalesce((select count(*) from assigned_tasks at
                  join children c on c.id = at.child_id
                  where c.family_id = f.id and at.status = 'approved'), 0)::bigint as approved_tasks
      from families f
    ) agg
    order by total_xp desc, approved_tasks desc
  ) r;
$$;

grant execute on function family_leaderboard() to authenticated, anon;
