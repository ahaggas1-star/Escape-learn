import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { AddChildForm } from "./AddChildForm";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  return (
    <>
      <Header email={email} />
      <main className="container-app max-w-xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-ghars-700">إضافة ابن</h1>
          <Link href="/dashboard" className="btn-ghost text-xs">رجوع</Link>
        </div>
        <AddChildForm />
      </main>
    </>
  );
}
