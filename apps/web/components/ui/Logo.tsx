// شعار «قِيَم» بهوية سمو: رمز شجرة سمو + اسم المنصة.
export function Logo({ size = 36, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/somou-mark.svg" alt="قِيَم — مبادرة سمو" width={size} height={size} />
      {showText ? (
        <span className="font-display text-lg font-bold text-ghars-800">قِيَم</span>
      ) : null}
    </span>
  );
}
