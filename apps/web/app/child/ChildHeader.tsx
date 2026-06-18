import { childSignOut } from "./actions";

export function ChildHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-ghars-100 bg-white/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <span className="font-display text-lg font-extrabold text-ghars-700">أهلًا {name}</span>
        </span>
        <form action={childSignOut}>
          <button type="submit" className="btn-ghost text-xs">خروج</button>
        </form>
      </div>
    </header>
  );
}
