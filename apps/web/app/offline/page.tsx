import { Logo } from "@/components/ui/Logo";

export const metadata = { title: "غير متصل — قِيَم" };

export default function OfflinePage() {
  return (
    <main className="container-app flex min-h-screen max-w-md flex-col items-center justify-center text-center">
      <div className="mb-3"><Logo size={48} showText={false} /></div>
      <h1 className="font-display text-2xl font-extrabold text-ghars-700">لا يوجد اتصال</h1>
      <p className="mt-2 text-sm text-ghars-500">
        يبدو أنك غير متصل بالإنترنت. تحقّق من الاتصال ثم أعد المحاولة.
      </p>
    </main>
  );
}
