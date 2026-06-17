import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

type Card = {
  name: string;
  total_xp: number;
  level: string | null;
  badges: string[];
  achievements: string[];
};

export async function generateMetadata({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("public_child_card", { p_token: params.token });
  const card = data as Card | null;
  return {
    title: card ? `إنجازات ${card.name} — قِيَم` : "بطاقة إنجاز — قِيَم",
  };
}

export default async function PublicCardPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("public_child_card", { p_token: params.token });
  const card = data as Card | null;
  if (!card) notFound();

  return (
    <main className="container-app flex min-h-screen max-w-md flex-col justify-center">
      <div className="card overflow-hidden bg-gradient-to-br from-white to-ghars-50 text-center">
        <div className="mb-1 text-5xl">🌟</div>
        <h1 className="font-display text-2xl font-extrabold text-ghars-800">{card.name}</h1>
        <p className="mt-1 text-sm text-ghars-500">بطل في منصة قِيَم</p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-ghars-100 px-4 py-2">
            <p className="font-display text-xl font-extrabold text-ghars-700">{card.level ?? "—"}</p>
            <p className="text-[10px] text-ghars-500">المستوى</p>
          </div>
          <div className="rounded-2xl bg-joy-100 px-4 py-2">
            <p className="font-display text-xl font-extrabold text-joy-600">{card.total_xp}</p>
            <p className="text-[10px] text-ghars-500">نقطة خبرة</p>
          </div>
        </div>

        {card.badges.length > 0 ? (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold text-ghars-600">الشارات</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {card.badges.map((b, i) => (
                <span key={i} className="rounded-full bg-ghars-100 px-2.5 py-1 text-xs text-ghars-700">🏅 {b}</span>
              ))}
            </div>
          </div>
        ) : null}

        {card.achievements.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold text-ghars-600">الإنجازات</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {card.achievements.map((a, i) => (
                <span key={i} className="rounded-full bg-joy-100 px-2.5 py-1 text-xs text-joy-600">⭐ {a}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-ghars-500">
        <Logo size={24} />
        <Link href="/" className="font-semibold text-ghars-600">جرّب قِيَم لأسرتك</Link>
      </div>
    </main>
  );
}
