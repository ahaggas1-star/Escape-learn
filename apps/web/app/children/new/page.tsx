import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { AddChildForm } from "./AddChildForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  return (
    <>
      <Header email={email} />
      <main className="container-app max-w-xl space-y-5">
        <PageHeader icon="🧒" title="إضافة ابن" backHref="/dashboard" />
        <AddChildForm />
      </main>
    </>
  );
}
