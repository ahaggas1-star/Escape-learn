// شعار قِيَم: الأيقونة + الاسم.
export function Logo({ size = 36, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="قِيَم" width={size} height={size} className="rounded-xl" />
      {showText ? (
        <span className="font-display text-xl font-extrabold text-ghars-700">قِيَم</span>
      ) : null}
    </span>
  );
}
