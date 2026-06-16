import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReviewCard } from "./ReviewCard";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

type TaskInfo = { title_ar: string; base_xp: number };
type Row = {
  id: string;
  note_ar: string | null;
  submitted_at: string;
  children: { display_name: string } | { display_name: string }[] | null;
  assigned_tasks:
    | { tasks: TaskInfo | TaskInfo[] }
    | { tasks: TaskInfo | TaskInfo[] }[]
    | null;
};

export default async function ReviewPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  const supabase = createClient();
  const { data } = await supabase
    .from("task_completions")
    .select(
      "id, note_ar, submitted_at, children(display_name), assigned_tasks!inner(status, tasks(title_ar, base_xp))"
    )
    .eq("assigned_tasks.status", "submitted")
    .order("submitted_at", { ascending: true });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="✅"
          title="المراجعة والاعتماد"
          subtitle="اعتمد إنجازات الأبناء أو اطلب الإعادة."
          backHref="/dashboard"
        />

        {rows.length === 0 ? (
          <div className="card text-sm text-ghars-500">
            لا توجد مهام بانتظار الاعتماد حاليًا.
          </div>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => {
              const child = Array.isArray(r.children) ? r.children[0] : r.children;
              const at = Array.isArray(r.assigned_tasks)
                ? r.assigned_tasks[0]
                : r.assigned_tasks;
              const task = at ? (Array.isArray(at.tasks) ? at.tasks[0] : at.tasks) : null;
              return (
                <ReviewCard
                  key={r.id}
                  completionId={r.id}
                  childName={child?.display_name ?? "—"}
                  taskTitle={task?.title_ar ?? "مهمة"}
                  baseXp={task?.base_xp ?? 0}
                  note={r.note_ar}
                />
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
