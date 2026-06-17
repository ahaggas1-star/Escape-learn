import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/ui/Logo";

export function Header({ email }: { email?: string | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="hidden text-xs text-slate-400 sm:inline">منصة القيم الأسرية</span>
        </Link>
        {email ? (
          <form action={signOut} className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:inline">{email}</span>
            <button type="submit" className="btn-ghost text-xs">
              تسجيل الخروج
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
