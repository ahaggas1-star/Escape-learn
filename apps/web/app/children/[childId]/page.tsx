import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChildProgress } from "@/lib/gamification";
import { CompleteTaskCard } from "./CompleteTaskCard";
import { RewardBoxCard } from "./RewardBoxCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareButton } from "@/components/ShareButton";
import { ChildLoginSettings } from "./ChildLoginSettings";

export const dynamic = "force-dynamic";

type AssignedRow = {
  id: string;
  status: string;
  tasks:
    | { title_ar: string; description_ar: string | null; base_xp: number; proof: string }
    | { title_ar: string; description_ar: string | null; base_xp: number; proof: string }[]
    | null;
};

const ACTIVE = ["assigned", "in_progress", "redo_requested"];

export default async function ChildPage({
  params,
}: {
  params: { childId: string };
}) {
  const { email, family, children } = await getGuardianContext();
  const child = children.find((c) => c.id === params.childId);
  if (!family || !child) notFound();

  const supabase = createClient();

  const [progress, { data: atData }, { data: badgeData }, { data: achData }, { data: boxData }] =
    await Promise.all([
      getChildProgress(child.id),
      supabase
        .from("assigned_tasks")
        .select("id, status, tasks(title_ar, description_ar, base_xp, proof)")
        .eq("child_id", child.id)
        .order("created_at", { ascending: true }),
      supabase.from("child_badges").select("badges(label_ar)").eq("child_id", child.id),
      supabase
        .from("child_achievements")
        .select("achievements(label_ar)")
        .eq("child_id", child.id),
      supabase
        .from("reward_box_openings")
        .select("id, status, reward_box_items(label_ar)")
        .eq("child_id", child.id)
        .order("opened_at", { ascending: false, nullsFirst: true }),
    ]);

  const rows = (atData ?? []) as AssignedRow[];
  const task = (r: AssignedRow) => (Array.isArray(r.tasks) ? r.tasks[0] : r.tasks);

  const active = rows.filter((r) => ACTIVE.includes(r.status));
  const waiting = rows.filter((r) => r.status === "submitted");
  const done = rows.filter((r) => r.status === "approved");
  const badges = (badgeData ?? []) as { badges: { label_ar: string } | { label_ar: string }[] }[];
  const achievements = (achData ?? []) as {
    achievements: { label_ar: string } | { label_ar: string }[];
  }[];
  type BoxRow = {
    id: string;
    status: string;
    reward_box_items: { label_ar: string } | { label_ar: string }[] | null;
  };
  const boxes = (boxData ?? []) as BoxRow[];
  const availableBoxes = boxes.filter((b) => b.status === "available");
  const openedBoxes = boxes.filter((b) => b.status === "opened");

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🧒" title={child.display_name} backHref="/dashboard" />

        <ChildLoginSettings
          childId={child.id}
          username={child.username ?? null}
          nickname={child.nickname ?? null}
          publicMode={child.public_name_mode ?? "nickname"}
        />

        {child.share_token ? (
          <div className="card flex items-center justify-between gap-2">
            <span className="text-sm text-ghars-600">🔗 بطاقة إنجاز {child.display_name} العامة</span>
            <ShareButton path={`/p/${child.share_token}`} title={`إنجازات ${child.display_name}`} />
          </div>
        ) : null}

        {/* التقدم والمستوى */}
        <section className="card bg-gradient-to-br from-white to-ghars-50">
          <div className="mb-3 flex items-center justify-between">
            <LevelBadge levelKey={progress.level?.key} label={progress.level?.label_ar} size="lg" />
            <div className="text-left">
              <p className="stat-value text-joy-500">{progress.totalXp}</p>
              <p className="stat-label">مجموع نقاط الخبرة</p>
            </div>
          </div>
          <ProgressBar value={progress.progressPct} />
          {progress.nextLevel ? (
            <p className="mt-1.5 text-xs text-ghars-500">
              نحو «{progress.nextLevel.label_ar}» — {progress.xpIntoLevel} من {progress.xpForNextLevel} نقطة خبرة
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-ghars-500">أعلى مستوى 🎉</p>
          )}
        </section>

        {/* الشارات */}
        {badges.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-display font-bold text-ghars-700">الشارات</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => {
                const badge = Array.isArray(b.badges) ? b.badges[0] : b.badges;
                return <Chip key={i} tone="ghars">🏅 {badge?.label_ar}</Chip>;
              })}
            </div>
          </section>
        ) : null}

        {/* صناديق المكافآت المتاحة */}
        {availableBoxes.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-bold text-ghars-700">صناديق المكافآت</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {availableBoxes.map((b) => (
                <RewardBoxCard key={b.id} openingId={b.id} childId={child.id} />
              ))}
            </div>
          </section>
        ) : null}

        {/* الإنجازات */}
        {achievements.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-bold text-ghars-700">الإنجازات</h2>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a, i) => {
                const ach = Array.isArray(a.achievements) ? a.achievements[0] : a.achievements;
                return <Chip key={i} tone="joy">⭐ {ach?.label_ar}</Chip>;
              })}
            </div>
          </section>
        ) : null}

        {/* مكافآت مفتوحة */}
        {openedBoxes.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-bold text-ghars-700">مكافآت حصلت عليها</h2>
            <ul className="space-y-1.5">
              {openedBoxes.map((b) => {
                const item = Array.isArray(b.reward_box_items)
                  ? b.reward_box_items[0]
                  : b.reward_box_items;
                return (
                  <li key={b.id} className="text-sm text-ghars-600">
                    🎁 {item?.label_ar ?? "مكافأة"}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* مهام للتنفيذ */}
        <section className="space-y-3">
          <h2 className="font-bold text-ghars-700">مهامي</h2>
          {active.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مهام حالية. اطلب من ولي الأمر إسناد مهمة.</p>
          ) : (
            <div className="grid gap-2">
              {active.map((r) => {
                const t = task(r);
                if (!t) return null;
                return (
                  <CompleteTaskCard
                    key={r.id}
                    assignedTaskId={r.id}
                    title={t.title_ar}
                    description={t.description_ar}
                    baseXp={t.base_xp}
                    proof={t.proof}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* بانتظار الاعتماد */}
        {waiting.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-bold text-ghars-700">بانتظار اعتماد ولي الأمر</h2>
            <ul className="space-y-1.5">
              {waiting.map((r) => {
                const t = task(r);
                return (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-ghars-700">{t?.title_ar}</span>
                    <span className="text-xs text-amber-600">قيد المراجعة</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* مكتملة */}
        {done.length > 0 ? (
          <section className="card">
            <h2 className="mb-2 font-bold text-ghars-700">مكتملة ✓</h2>
            <ul className="space-y-1.5">
              {done.map((r) => {
                const t = task(r);
                return (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-ghars-700">{t?.title_ar}</span>
                    <span className="text-xs text-ghars-500">{t?.base_xp} نقطة خبرة</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
