import { requireChild } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChildProgress } from "@/lib/gamification";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { ChildHeader } from "./ChildHeader";
import { ChildTaskCard } from "./ChildTaskCard";
import { ChildRewardCard } from "./ChildRewardCard";

export const dynamic = "force-dynamic";

type AssignedRow = {
  id: string;
  status: string;
  tasks:
    | { title_ar: string; description_ar: string | null; base_xp: number; proof: string }
    | { title_ar: string; description_ar: string | null; base_xp: number; proof: string }[]
    | null;
};
type Member = { child_id: string; name: string; total_xp: number; rank: number };

const ACTIVE = ["assigned", "in_progress", "redo_requested"];

export default async function ChildHome() {
  const child = await requireChild();
  const supabase = createClient();

  const [progress, { data: atData }, { data: badgeData }, { data: achData }, { data: boxData }, { data: board }] =
    await Promise.all([
      getChildProgress(child.id),
      supabase
        .from("assigned_tasks")
        .select("id, status, tasks(title_ar, description_ar, base_xp, proof)")
        .eq("child_id", child.id)
        .order("created_at", { ascending: true }),
      supabase.from("child_badges").select("badges(label_ar)").eq("child_id", child.id),
      supabase.from("child_achievements").select("achievements(label_ar)").eq("child_id", child.id),
      supabase
        .from("reward_box_openings")
        .select("id, status, reward_box_items(label_ar)")
        .eq("child_id", child.id)
        .order("opened_at", { ascending: false, nullsFirst: true }),
      supabase.rpc("family_members_ranked"),
    ]);

  const rows = (atData ?? []) as AssignedRow[];
  const task = (r: AssignedRow) => (Array.isArray(r.tasks) ? r.tasks[0] : r.tasks);
  const active = rows.filter((r) => ACTIVE.includes(r.status));
  const waiting = rows.filter((r) => r.status === "submitted");
  const done = rows.filter((r) => r.status === "approved");
  const badges = (badgeData ?? []) as { badges: { label_ar: string } | { label_ar: string }[] }[];
  const achievements = (achData ?? []) as { achievements: { label_ar: string } | { label_ar: string }[] }[];
  type BoxRow = { id: string; status: string };
  const boxes = (boxData ?? []) as BoxRow[];
  const availableBoxes = boxes.filter((b) => b.status === "available");
  const members = (board ?? []) as Member[];
  const medal = (r: number) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`);

  return (
    <>
      <ChildHeader name={child.nickname || child.display_name} />
      <main className="container-app space-y-5">
        {/* المستوى والتقدم */}
        <section className="card bg-gradient-to-br from-white to-ghars-50">
          <div className="mb-3 flex items-center justify-between">
            <LevelBadge levelKey={progress.level?.key} label={progress.level?.label_ar} size="lg" />
            <div className="text-left">
              <p className="stat-value text-joy-500">{progress.totalXp}</p>
              <p className="stat-label">نقاطي</p>
            </div>
          </div>
          <ProgressBar value={progress.progressPct} />
          {progress.nextLevel ? (
            <p className="mt-1.5 text-xs text-ghars-500">
              نحو «{progress.nextLevel.label_ar}» — باقي {Math.max(0, (progress.xpForNextLevel ?? 0) - progress.xpIntoLevel)} نقطة 💪
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-ghars-500">وصلت أعلى مستوى 🎉</p>
          )}
        </section>

        {/* صناديق المكافآت */}
        {availableBoxes.length > 0 ? (
          <section className="grid gap-2 sm:grid-cols-3">
            {availableBoxes.map((b) => <ChildRewardCard key={b.id} openingId={b.id} />)}
          </section>
        ) : null}

        {/* مهامي */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-ghars-700">مهامي 📋</h2>
          {active.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مهام حالية. أحسنت! 🎉</p>
          ) : (
            <div className="grid gap-2">
              {active.map((r) => {
                const t = task(r);
                if (!t) return null;
                return (
                  <ChildTaskCard key={r.id} assignedTaskId={r.id} title={t.title_ar}
                    description={t.description_ar} baseXp={t.base_xp} proof={t.proof} />
                );
              })}
            </div>
          )}
        </section>

        {waiting.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-display font-bold text-ghars-700">بانتظار موافقة ولي الأمر ⏳</h2>
            <ul className="space-y-1.5">
              {waiting.map((r) => (
                <li key={r.id} className="text-sm text-ghars-600">• {task(r)?.title_ar}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* الشارات والإنجازات */}
        {(badges.length > 0 || achievements.length > 0) ? (
          <section className="card">
            <h2 className="mb-2 font-display font-bold text-ghars-700">إنجازاتي 🏅</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => {
                const x = Array.isArray(b.badges) ? b.badges[0] : b.badges;
                return <Chip key={`b${i}`} tone="ghars">🏅 {x?.label_ar}</Chip>;
              })}
              {achievements.map((a, i) => {
                const x = Array.isArray(a.achievements) ? a.achievements[0] : a.achievements;
                return <Chip key={`a${i}`} tone="joy">⭐ {x?.label_ar}</Chip>;
              })}
            </div>
          </section>
        ) : null}

        {/* ترتيب الأسرة */}
        {members.length > 1 ? (
          <section className="card">
            <h2 className="mb-2 font-display font-bold text-ghars-700">ترتيب عائلتي 🏆</h2>
            <ul className="space-y-1.5">
              {members.map((m) => {
                const isMe = m.child_id === child.id;
                return (
                  <li key={m.child_id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${isMe ? "border-ghars-500 bg-ghars-50" : "border-ghars-100"}`}>
                    <span className="flex items-center gap-2">
                      <span className="w-7 text-center">{medal(m.rank)}</span>
                      <span className={isMe ? "font-bold text-ghars-700" : "text-ghars-600"}>
                        {isMe ? "أنا" : m.name}
                      </span>
                    </span>
                    <span className="text-xs text-ghars-500">{m.total_xp} نقطة</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {done.length > 0 ? (
          <p className="text-center text-xs text-ghars-400">أكملت {done.length} مهمة 🌟</p>
        ) : null}
      </main>
    </>
  );
}
