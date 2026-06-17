import Link from "next/link";
import { AuthForm } from "./AuthForm";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/SetupNotice";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="container-app flex min-h-screen max-w-md flex-col justify-center">
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <Logo size={52} showText={false} />
        </div>
        <h1 className="font-display text-3xl font-bold text-ghars-900">قِيَم</h1>
        <p className="mt-1 text-sm text-slate-500">منصة القيم الأسرية</p>
      </div>
      {isSupabaseConfigured ? <AuthForm /> : <SetupNotice />}
      <p className="mt-4 text-center text-xs text-slate-500">
        طفل؟{" "}
        <Link href="/child/login" className="font-semibold text-ghars-600">دخول الطفل من هنا</Link>
      </p>
    </main>
  );
}
