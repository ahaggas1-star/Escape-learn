// شعار المستوى: لكل مستوى رمز نباتي يعبّر عن النمو.
const LEVEL_EMOJI: Record<string, string> = {
  seed: "🌰",
  seedling: "🌱",
  sprout: "🪴",
  tree: "🌳",
  fruitful: "🍎",
  role_model: "🌟",
};

export function levelEmoji(key?: string | null): string {
  return (key && LEVEL_EMOJI[key]) || "🌱";
}

export function LevelBadge({
  levelKey,
  label,
  size = "md",
}: {
  levelKey?: string | null;
  label?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16 text-3xl" : size === "sm" ? "h-9 w-9 text-lg" : "h-12 w-12 text-2xl";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${dim} items-center justify-center rounded-2xl bg-ghars-50 shadow-card`}>
        <span>{levelEmoji(levelKey)}</span>
      </div>
      {label ? <span className="font-display text-lg font-bold text-ghars-700">{label}</span> : null}
    </div>
  );
}
