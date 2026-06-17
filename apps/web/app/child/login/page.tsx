import Link from "next/link";
import { ChildLoginForm } from "./LoginForm";
import { Mascot } from "@/components/ui/Mascot";

export const dynamic = "force-dynamic";

export default function ChildLoginPage() {
  return (
    <main className="container-app flex min-h-screen max-w-sm flex-col justify-center">
      <div className="mb-6 text-center">
        <div className="mb-2 flex justify-center"><Mascot size={72} /></div>
        <h1 className="font-display text-3xl font-extrabold text-ghars-700">مرحبًا بك! 🌟</h1>
        <p className="mt-1 text-sm text-ghars-500">سجّل دخولك لتشوف مهامك وإنجازاتك</p>
      </div>
      <ChildLoginForm />
      <p className="mt-4 text-center text-xs text-ghars-400">
        دخول ولي الأمر؟{" "}
        <Link href="/login" className="font-semibold text-ghars-600">من هنا</Link>
      </p>
    </main>
  );
}
