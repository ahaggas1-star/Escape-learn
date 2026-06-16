import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { GoalTemplateForm } from "../../GoalTemplateForm";
import { updateGoalTemplate } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditGoalTemplatePage({ params }: { params: { id: string } }) {
  const { email } = await requireStaff();
  const supabase = createClient();

  const [{ data: tpl }, { data: values }, { data: subs }, { data: stages }] = await Promise.all([
    supabase.from("goal_templates").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
    supabase.from("sub_values").select("id, label_ar").order("sort_order"),
    supabase.from("age_stages").select("id, label_ar").order("sort_order"),
  ]);
  if (!tpl) notFound();

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🎯" title="تعديل هدف جاهز" backHref="/admin/goals" />
        <GoalTemplateForm
          values={values ?? []}
          subValues={subs ?? []}
          ageStages={stages ?? []}
          action={updateGoalTemplate}
          initial={tpl}
          submitLabel="حفظ التعديل"
        />
      </main>
    </>
  );
}
