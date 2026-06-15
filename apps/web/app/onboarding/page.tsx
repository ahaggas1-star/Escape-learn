import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { email, family } = await getGuardianContext();
  if (family) redirect("/dashboard");

  return (
    <>
      <Header email={email} />
      <main className="container-app max-w-xl space-y-5">
        <div>
          <h1 className="text-xl font-extrabold text-ghars-700">إعداد الأسرة</h1>
          <p className="text-sm text-ghars-500">
            خطوة واحدة: أنشئ ملف أسرتك وأضف أول ابن، ثم ابدأ باختيار القيم.
          </p>
        </div>
        <OnboardingForm />
      </main>
    </>
  );
}
