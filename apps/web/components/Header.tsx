import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function Header({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-ghars-100 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <span className="bg-gradient-to-l from-ghars-600 to-joy-500 bg-clip-text text-lg font-extrabold text-transparent">
            قِيَم
          </span>
          <span className="text-xs text-ghars-500">منصة القيم الأسرية</span>
        </Link>
        {email ? (
          <form action={signOut} className="flex items-center gap-3">
            <span className="hidden text-xs text-ghars-500 sm:inline">{email}</span>
            <button type="submit" className="btn-ghost text-xs">
              تسجيل الخروج
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
