// تميمة المنصة: غرسة مرحة تطفو بلطف.
export function Mascot({ size = 64 }: { size?: number }) {
  return (
    <div
      className="animate-float select-none"
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      🌱
    </div>
  );
}
