import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Goal, TaskTemplate } from "@/lib/types";
import { AddTaskButton } from "./AddTaskButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  assigned: "مُسندة",
  in_progress: "قيد التنفيذ",
  submitted: "بانتظار الاعتماد",
  approved: "معتمدة",
  rejected: "مرفوضة",
  redo_requested: "إعادة تنفيذ",
};

type TaskRow = {
  id: string;
  title_ar: string;
  base_xp: number;
  needs_guardian_approval: boolean;
  assigned_tasks: { status: string }[];
};

export default async function GoalPage({
  params,
}: {
  params: { goalId: string };
}) {
  const { email, family, children } = await getGuardianContext();
  const supabase = createClient();

  const { data: goalData } = await supabase
    .from("goals")
    .select("*")
    .eq("id", params.goalId)
    .maybeSingle();
  if (!goalData || (family && goalData.family_id !== family.id)) notFound();
  const goal = goalData as Goal;

  const child = children.find((c) => c.id === goal.child_id) ?? null;

  // قوالب المهام المقترحة: تُصفّى حسب مرحلة الابن العمرية (أو العامة بلا مرحلة).
  let tplQuery = supabase
    .from("task_templates")
    .select("*")
    .eq("core_value_id", goal.core_value_id)
    .eq("is_published", true);
  if (child?.age_stage_id) {
    tplQuery = tplQuery.or(`age_stage_id.is.null,age_stage_id.eq.${child.age_stage_id}`);
  }

  const [{ data: taskData }, { data: tplData }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title_ar, base_xp, needs_guardian_approval, assigned_tasks(status)")
      .eq("goal_id", goal.id)
      .order("created_at", { ascending: true }),
    tplQuery.order("created_at", { ascending: true }),
  ]);

  const tasks = (taskData ?? []) as TaskRow[];
  const templates = (tplData ?? []) as TaskTemplate[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ghars-700">{goal.title_ar}</h1>
            <p className="text-sm text-ghars-500">
              {child ? `للابن: ${child.display_name}` : "غير مرتبط بابن"}
              {goal.source === "custom" ? " · هدف خاص" : " · هدف جاهز"}
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost text-xs">لوحة التحكم</Link>
        </div>

        {goal.measure_ar ? (
          <div className="card text-sm">
            <span className="font-semibold text-ghars-700">طريقة القياس: </span>
            <span className="text-ghars-600">{goal.measure_ar}</span>
          </div>
        ) : null}

        <section className="card">
          <h2 className="mb-3 font-bold text-ghars-700">المهام المسندة</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مهام بعد. أضف مهمة من القائمة أدناه.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => {
                const status = t.assigned_tasks?.[0]?.status ?? "assigned";
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-semibold text-ghars-700">{t.title_ar}</p>
                      <p className="text-xs text-ghars-500">{t.base_xp}+ XP</p>
                    </div>
                    <span className="rounded-full bg-ghars-100 px-3 py-1 text-xs font-medium text-ghars-700">
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-ghars-700">إضافة مهام مقترحة</h2>
          {templates.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مهام جاهزة لهذه القيمة بعد.</p>
          ) : (
            <div className="grid gap-2">
              {templates.map((t) => (
                <AddTaskButton key={t.id} template={t} goalId={goal.id} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
