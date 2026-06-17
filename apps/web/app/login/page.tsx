import Link from "next/link";
import { AuthForm } from "./AuthForm";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/SetupNotice";
import { Mascot } from "@/components/ui/Mascot";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="container-app flex min-h-screen max-w-md flex-col justify-center">
      <div className="mb-6 text-center">
        <div className="mb-2 flex justify-center">
          <Mascot size={72} />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-ghars-700">قِيَم</h1>
        <p className="mt-1 text-sm text-ghars-500">
          نغرس القيم في أبنائنا… خطوة بخطوة 🌱
        </p>
      </div>
      {isSupabaseConfigured ? <AuthForm /> : <SetupNotice />}
      <p className="mt-4 text-center text-xs text-ghars-500">
        طفل؟{" "}
        <Link href="/child/login" className="font-semibold text-ghars-600">دخول الطفل من هنا</Link>
      </p>
      <p className="mt-2 text-center text-xs text-ghars-400">
        منصة أسرية آمنة — القيمة قبل النقاط
      </p>
    </main>
  );
}
