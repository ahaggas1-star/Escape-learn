import { AuthForm } from "./AuthForm";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="container-app max-w-md">
      <div className="mb-6 text-center">
        <div className="mb-1 text-4xl">🌟</div>
        <h1 className="bg-gradient-to-l from-ghars-600 to-joy-500 bg-clip-text text-3xl font-extrabold text-transparent">
          قِيَم
        </h1>
        <p className="mt-1 text-sm text-ghars-500">
          ابدأ بغرس القيم في أبنائك خطوة بخطوة.
        </p>
      </div>
      {isSupabaseConfigured ? <AuthForm /> : <SetupNotice />}
    </main>
  );
}
