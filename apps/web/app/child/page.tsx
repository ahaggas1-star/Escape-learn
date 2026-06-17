import Link from "next/link";
import { requireChild } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChildProgress } from "@/lib/gamification";
import { getFamilyCollectives, cheer } from "@/lib/collectives";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { ShareButton } from "@/components/ShareButton";
import { ChildHeader } from "./ChildHeader";
import { ChildTaskCard } from "./ChildTaskCard";
import { BoxShopCard } from "./BoxShopCard";

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

  const [progress, { data: atData }, { data: badgeData }, { data: achData }, { data: boxData }, { data: board }, collectives, { data: coinsData }] =
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
        .from("reward_boxes")
        .select("id, title_ar, box_type, cost_coins, reward_box_items(count)")
        .or(`family_id.eq.${child.family_id},family_id.is.null`)
        .eq("is_active", true)
        .order("cost_coins", { ascending: true }),
      supabase.rpc("family_members_ranked"),
      getFamilyCollectives(),
      supabase.rpc("child_coins", { p_child_id: child.id }),
    ]);

  const rows = (atData ?? []) as AssignedRow[];
  const task = (r: AssignedRow) => (Array.isArray(r.tasks) ? r.tasks[0] : r.tasks);
  const active = rows.filter((r) => ACTIVE.includes(r.status));
  const waiting = rows.filter((r) => r.status === "submitted");
  const done = rows.filter((r) => r.status === "approved");
  const badges = (badgeData ?? []) as { badges: { label_ar: string } | { label_ar: string }[] }[];
  const achievements = (achData ?? []) as { achievements: { label_ar: string } | { label_ar: string }[] }[];
  type ShopBox = { id: string; title_ar: string; box_type: string; cost_coins: number; reward_box_items: { count: number }[] };
  const shopBoxes = (boxData ?? []) as ShopBox[];
  const coins = (coinsData as number) ?? 0;
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
            <div className="flex gap-3 text-center">
              <div>
                <p className="stat-value text-joy-500">{progress.totalXp}</p>
                <p className="stat-label">نقطة خبرة</p>
              </div>
              <div>
                <p className="stat-value text-bloom-500">{coins} 🪙</p>
                <p className="stat-label">عملات</p>
              </div>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {child.share_token ? <ShareButton path={`/p/${child.share_token}`} /> : null}
            <Link href="/leaderboard/children" className="btn-ghost text-xs">🏆 أبطال قِيَم</Link>
          </div>
        </section>

        {/* متجر الصناديق (يُفتح بالعملات) */}
        {shopBoxes.length > 0 ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-ghars-700">متجر الصناديق 🛍️</h2>
              <span className="rounded-full bg-joy-100 px-3 py-1 text-sm font-bold text-joy-600">رصيدي: {coins} 🪙</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {shopBoxes.map((b) => (
                <BoxShopCard key={b.id} boxId={b.id} title={b.title_ar} boxType={b.box_type}
                  cost={b.cost_coins} canAfford={coins >= b.cost_coins} />
              ))}
            </div>
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

        {/* الإنجازات الجماعية */}
        {collectives.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-ghars-700">إنجازات جماعية 🤝</h2>
            <div className="grid gap-2">
              {collectives.map((c) => {
                const pct = c.target > 0 ? Math.min(100, Math.round((c.current / c.target) * 100)) : 0;
                return (
                  <div key={c.id} className="card">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-display font-bold text-ghars-700">{c.icon} {c.title_ar}</span>
                      <Chip tone={c.scope === "official" ? "grape" : "sky"}>{c.scope === "official" ? "رسمي" : "عائلي"}</Chip>
                    </div>
                    <ProgressBar value={pct} />
                    <p className="mt-1 text-xs font-semibold text-ghars-600">{c.current}/{c.target} · {cheer(pct)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {done.length > 0 ? (
          <p className="text-center text-xs text-ghars-400">أكملت {done.length} مهمة 🌟</p>
        ) : null}
      </main>
    </>
  );
}
