"use client";

// =============================================================================
// مؤثرات صفحة العرض: كونفيتي (Canvas) + أصوات مُولّدة (WebAudio) — بلا ملفات خارجية.
// =============================================================================

const COLORS = ["#f97316", "#06b6d4", "#22c55e", "#3f8fc4", "#ec4899", "#8b5cf6", "#fbbf24"];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
type P = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vrot: number; life: number; shape: number };
let particles: P[] = [];
let raf = 0;

function ensureCanvas() {
  if (typeof window === "undefined") return null;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

function loop() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.vy += 0.18; // جاذبية
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.rot += p.vrot;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
    ctx.fillStyle = p.color;
    if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (particles.length > 0) raf = requestAnimationFrame(loop);
  else {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

export function fireConfetti(opts?: { x?: number; y?: number; count?: number; power?: number; spread?: number }) {
  if (!ensureCanvas()) return;
  const cx = opts?.x ?? window.innerWidth / 2;
  const cy = opts?.y ?? window.innerHeight / 3;
  const count = opts?.count ?? 90;
  const power = opts?.power ?? 11;
  const spread = opts?.spread ?? Math.PI * 2;
  const base = spread === Math.PI * 2 ? 0 : -Math.PI / 2;
  for (let i = 0; i < count; i++) {
    const ang = base + (spread === Math.PI * 2 ? Math.random() * spread : (Math.random() - 0.5) * spread);
    const sp = power * (0.4 + Math.random() * 0.9);
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - (spread === Math.PI * 2 ? 0 : 3),
      size: 6 + Math.random() * 8,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 60 + Math.random() * 40,
      shape: Math.random() > 0.5 ? 0 : 1,
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

// كونفيتي من الجانبين (احتفال كبير)
export function celebrationBurst() {
  fireConfetti({ x: window.innerWidth * 0.1, y: window.innerHeight * 0.4, count: 70, power: 13, spread: Math.PI / 2.2 });
  fireConfetti({ x: window.innerWidth * 0.9, y: window.innerHeight * 0.4, count: 70, power: 13, spread: Math.PI / 2.2 });
  setTimeout(() => fireConfetti({ y: window.innerHeight * 0.25, count: 80 }), 250);
}

// ---------------------------------------------------------------------------
// الأصوات (WebAudio) — تعمل فقط بعد تفعيل المستخدم (سياسة المتصفح).
// ---------------------------------------------------------------------------
let actx: AudioContext | null = null;
let soundOn = false;
const listeners = new Set<(v: boolean) => void>();

function ctxResume() {
  if (typeof window === "undefined") return null;
  if (!actx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AC) actx = new AC();
  }
  if (actx && actx.state === "suspended") actx.resume();
  return actx;
}

export function setSoundOn(v: boolean) {
  soundOn = v;
  if (v) ctxResume();
  listeners.forEach((l) => l(v));
}
export function isSoundOn() {
  return soundOn;
}
export function onSoundChange(l: (v: boolean) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18) {
  if (!actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(actx.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function playSound(kind: "pop" | "win" | "fanfare" | "whoosh" | "coin") {
  if (!soundOn) return;
  const c = ctxResume();
  if (!c) return;
  const t = c.currentTime;
  if (kind === "pop") {
    tone(440, t, 0.12, "triangle", 0.2);
    tone(660, t + 0.04, 0.12, "triangle", 0.15);
  } else if (kind === "coin") {
    tone(988, t, 0.09, "square", 0.12);
    tone(1319, t + 0.07, 0.12, "square", 0.12);
  } else if (kind === "whoosh") {
    tone(200, t, 0.3, "sawtooth", 0.06);
    tone(120, t + 0.05, 0.3, "sawtooth", 0.05);
  } else if (kind === "win") {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.1, 0.25, "triangle", 0.18));
  } else if (kind === "fanfare") {
    [523, 659, 784].forEach((f) => tone(f, t, 0.4, "triangle", 0.14));
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + 0.25 + i * 0.12, 0.3, "triangle", 0.16));
  }
}
