import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { email, family } = await getGuardianContext();
  if (family) redirect("/dashboard");

  return (
    <>
      <Header email={email} />
      <main className="container-app max-w-xl space-y-5">
        <PageHeader
          icon="🏡"
          title="إعداد الأسرة"
          subtitle="خطوة واحدة: أنشئ ملف أسرتك وأضف أول ابن، ثم ابدأ باختيار القيم."
        />
        <OnboardingForm />
      </main>
    </>
  );
}
