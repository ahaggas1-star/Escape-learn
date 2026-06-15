import { AuthForm } from "./AuthForm";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="container-app max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-ghars-700">غرس</h1>
        <p className="mt-1 text-sm text-ghars-500">
          ابدأ بغرس القيم في أبنائك خطوة بخطوة.
        </p>
      </div>
      {isSupabaseConfigured ? <AuthForm /> : <SetupNotice />}
    </main>
  );
}
