/* ==========================================================================
   نجومي — محرّك التطبيق
   حالة محفوظة محليًا (localStorage) + أدوات واجهة مشتركة لكل الصفحات.
   ========================================================================== */
(function () {
'use strict';

/* ----------------------------- 1. المخزن ----------------------------- */
const KEY = 'nujoomi.v1';

const DEFAULTS = {
  name:'لُجين', avatar:'🐻',
  xp:0, coins:0,
  days:[],                 // تواريخ الأيام النشطة (ISO)
  acts:[],                 // تاريخ كل نشاط مُنجز (لمهمّة اليوم)
  lessons:{},              // { 'math:m1': true }
  correct:{},              // { math: 12 }
  answered:0, wrongTotal:0,
  wordsBuilt:0,
  gamesTried:{},           // { quiz:true, count:true, ... }
  badges:[],               // معرّفات الأوسمة المفتوحة
  bestQuiz:0, bestCount:0, bestMemory:null,
  giftDay:null,            // آخر يوم فُتحت فيه الهدية
  arabicDigits:true, sound:true, theme:null,
  seen:false
};

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    return raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
  }catch(e){ return Object.assign({}, DEFAULTS); }
}
let state = load();
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
}

const S = {
  get:()=>state,
  set(patch){ Object.assign(state, patch); save(); return state; },
  reset(){ state = Object.assign({}, DEFAULTS); save(); }
};

/* ------------------------- 2. أدوات التاريخ ------------------------- */
const iso = d => new Date(d).toISOString().slice(0,10);
const today = () => iso(Date.now());
const dayBefore = n => iso(Date.now() - n*86400000);

/** تُستدعى عند أي نشاط: تحدّث الأيام النشطة والسلسلة */
function touchDay(){
  const t = today();
  if(!state.days.includes(t)){
    state.days.push(t);
    state.days = state.days.slice(-90);
    save();
  }
}
/** يسجّل نشاطًا منجزًا (درس أو لعبة) لعدّاد مهمّة اليوم */
function logActivity(){
  state.acts.push(today());
  state.acts = state.acts.slice(-300);
  touchDay(); save();
}
const todayActs = () => state.acts.filter(d => d === today()).length;
const DAILY_GOAL = 3;

/** طول السلسلة المتتالية المنتهية اليوم أو أمس */
function streak(){
  const set = new Set(state.days);
  let n = 0, i = set.has(today()) ? 0 : (set.has(dayBefore(1)) ? 1 : -1);
  if(i < 0) return 0;
  while(set.has(dayBefore(i))){ n++; i++; }
  return n;
}
const WEEK_LABELS = ['س','ح','ن','ث','ر','خ','ج']; // السبت → الجمعة

/** حالة أيام الأسبوع الحالي (السبت → الجمعة) */
function week(){
  const set = new Set(state.days);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 1) % 7)); // السبت
  return Array.from({length:7}, (_,k)=>{
    const d = new Date(start); d.setDate(start.getDate()+k);
    return { label:WEEK_LABELS[k], date:iso(d), on:set.has(iso(d)), today:iso(d)===today(), future:d>now };
  });
}

/* ------------------------- 3. المستوى والدوري ------------------------- */
const XP_PER_LEVEL = 200;
const level  = () => Math.floor(state.xp / XP_PER_LEVEL) + 1;
const levelXp = () => state.xp % XP_PER_LEVEL;
const league = () => state.xp >= 1500 ? {name:'ماسي', emoji:'💎', tone:'sky'}
                  : state.xp >= 800  ? {name:'ذهبي', emoji:'🥇', tone:'sun'}
                  : state.xp >= 300  ? {name:'فضّي', emoji:'🥈', tone:'violet'}
                  :                    {name:'برونزي', emoji:'🥉', tone:'coral'};

/* --------------------------- 4. الأرقام --------------------------- */
const AR = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
/** يحوّل الأرقام للعرض حسب تفضيل المستخدم */
function num(v){
  const s = String(v);
  return state.arabicDigits ? s.replace(/[0-9]/g, d => AR[+d]) : s.replace(/[٠-٩]/g, d => AR.indexOf(d));
}

/** يوحّد شكل الأرقام في النصوص الثابتة داخل الصفحة حسب الإعداد */
function localizeDigits(root){
  const scope = root || document.body;
  if(!scope) return;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  for(let n = walker.nextNode(); n; n = walker.nextNode()){
    const tag = n.parentElement && n.parentElement.tagName;
    if(tag === 'SCRIPT' || tag === 'STYLE') continue;
    if(/[0-9\u0660-\u0669]/.test(n.nodeValue)) nodes.push(n);
  }
  nodes.forEach(n => { n.nodeValue = num(n.nodeValue); });
}

/* --------------------------- 5. النقاط --------------------------- */
/** يضيف نقاط خبرة ويعرض تنبيهًا ويفحص الأوسمة */
function addXp(amount, silent){
  if(amount <= 0) return;
  const before = level();
  state.xp += amount;
  state.coins += Math.max(1, Math.round(amount/10));
  touchDay(); save();
  if(!silent) toast(`+${num(amount)} نقطة خبرة`, '⭐');
  if(level() > before){
    setTimeout(()=>{ confetti(); toast(`ترقّيت إلى المستوى ${num(level())}!`, '🚀'); }, 900);
  }
  checkBadges();
}

function markCorrect(subject){
  state.correct[subject] = (state.correct[subject]||0) + 1;
  state.answered++; save();
}
function markWrong(){ state.wrongTotal++; save(); }

function completeLesson(subject, lessonId){
  state.lessons[subject+':'+lessonId] = true;
  touchDay(); save(); checkBadges();
}
const lessonDone = (subject, id) => !!state.lessons[subject+':'+id];
const lessonsCount = () => Object.keys(state.lessons).length;
function subjectProgress(subject){
  const all = (LESSONS[subject]||[]).length || 1;
  const done = (LESSONS[subject]||[]).filter(l=>lessonDone(subject,l.id)).length;
  return { done, all, pct: Math.round(done/all*100) };
}
function tryGame(id){ state.gamesTried[id] = true; save(); checkBadges(); }

/* --------------------------- 6. الأوسمة --------------------------- */
function badgeEarned(id){
  const c = state.correct, g = state.gamesTried;
  switch(id){
    case 'first':     return state.answered > 0 || lessonsCount() > 0;
    case 'starter':   return state.xp >= 100;
    case 'reader':    return lessonsCount() >= 3;
    case 'fire':      return streak() >= 3;
    case 'mathpro':   return (c.math||0) >= 20;
    case 'perfect':   return state.bestQuiz >= 10;
    case 'memory':    return state.bestMemory !== null && state.bestMemory < 4;
    case 'wordsmith': return state.wordsBuilt >= 10;
    case 'explorer':  return !!(g.quiz && g.count && g.memory && g.word);
    case 'level5':    return level() >= 5;
    case 'scholar':   return lessonsCount() >= 12;
    case 'century':   return state.answered >= 100;
    case 'weekly':    return streak() >= 7;
    case 'master':    return SUBJECTS.some(s => { const p = subjectProgress(s.id); return p.all > 0 && p.done === p.all; });
    default:          return false;
  }
}
/** يفحص كل الأوسمة ويحتفل بالجديد منها */
function checkBadges(){
  const fresh = BADGES.filter(b => !state.badges.includes(b.id) && badgeEarned(b.id));
  if(!fresh.length) return [];
  state.badges.push(...fresh.map(b=>b.id)); save();
  fresh.forEach((b,i)=> setTimeout(()=>{ confetti(); toast(`وسام جديد: ${b.name}`, b.emoji); }, 1400 + i*1600));
  return fresh;
}
const hasBadge = id => state.badges.includes(id);

/* --------------------------- 7. الصوت --------------------------- */
let actx = null;
function beep(freqs, dur){
  if(!state.sound) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state === 'suspended') actx.resume();
    freqs.forEach((f,i)=>{
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t0 = actx.currentTime + i*(dur*0.7);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0+0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t0); o.stop(t0+dur+0.02);
    });
  }catch(e){}
}
const sfx = {
  right: ()=> beep([660, 880], .16),
  wrong: ()=> beep([250, 180], .2),
  win:   ()=> beep([523, 659, 784, 1046], .18),
  tap:   ()=> beep([520], .05),
  flip:  ()=> beep([440], .05)
};

/* --------------------------- 8. الواجهة --------------------------- */
let toastTimer;
function toast(msg, emoji){
  let host = document.getElementById('toast');
  if(!host){ host = document.createElement('div'); host.id='toast'; document.body.appendChild(host); }
  host.innerHTML = `<div class="t"><span>${emoji||'✨'}</span><span>${msg}</span></div>`;
  requestAnimationFrame(()=> host.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> host.classList.remove('show'), 2400);
}

const CONF_COLORS = ['#7C5CFF','#4ED6A8','#FFB547','#FF7A8A','#49B8FF','#FFE066','#FF8FC5'];
function confetti(count){
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const n = count || 44;
  for(let i=0;i<n;i++){
    const p = document.createElement('i');
    p.className = 'conf';
    p.style.left = Math.random()*100 + '%';
    p.style.background = CONF_COLORS[i % CONF_COLORS.length];
    p.style.animationDuration = (1.5 + Math.random()*1.4) + 's';
    p.style.animationDelay = (Math.random()*0.35) + 's';
    p.style.transform = `scale(${.6+Math.random()*.8})`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(()=> box.remove(), 3400);
}

/** يعدّ رقمًا تصاعديًا داخل عنصر */
function countUp(el, to, ms){
  if(!el) return;
  const dur = ms || 900, t0 = performance.now();
  (function step(t){
    const k = Math.min(1, (t-t0)/dur);
    el.textContent = num(Math.round(to * (1 - Math.pow(1-k, 3))));
    if(k < 1) requestAnimationFrame(step);
  })(t0);
}

/* النوافذ السفلية */
function openSheet(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSheet(id){
  const el = id ? document.getElementById(id) : document.querySelector('.sheet-bg.open');
  if(!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e=>{
  const open = e.target.closest('[data-sheet]');
  if(open){ sfx.tap(); openSheet(open.dataset.sheet); return; }
  if(e.target.closest('[data-close]')){ closeSheet(); return; }
  if(e.target.classList && e.target.classList.contains('sheet-bg')) closeSheet();
});
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeSheet(); });

/* الوضع الليلي */
function applyTheme(t){
  const dark = t === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', dark ? '#0F0B22' : '#FFF8F1');
  document.querySelectorAll('[data-theme-toggle]').forEach(b => b.textContent = dark ? '☀️' : '🌙');
}
function toggleTheme(){
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  S.set({theme:next}); applyTheme(next); sfx.tap();
}
function initTheme(){
  const t = state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(t);
}

/* شريط التبويب */
const TABS = [
  { href:'index.html',      ico:'🏠', label:'الرئيسية' },
  { href:'learn.html',      ico:'📚', label:'تعلّم' },
  { href:'rewards.html',    ico:'🎁', label:'الجوائز' },
  { href:'leaderboard.html',ico:'🏆', label:'الترتيب' },
  { href:'profile.html',    ico:'👤', label:'ملفّي' }
];
function tabbar(active){
  return `<nav class="tabbar" aria-label="التنقّل الرئيسي"><div class="tabbar-in">${
    TABS.map(t=>`<a class="tab${t.href===active?' on':''}" href="${t.href}"${t.href===active?' aria-current="page"':''}>
      <span class="ti">${t.ico}</span>${t.label}</a>`).join('')
  }</div></nav>`;
}
function mountTabbar(active){
  const holder = document.getElementById('tabbar');
  if(holder) holder.outerHTML = tabbar(active);
}

/* شريط علوي بسيط للصفحات الداخلية */
function mountSubbar(title, sub, backHref){
  const el = document.getElementById('subbar');
  if(!el) return;
  el.className = 'subbar safe-top';
  el.innerHTML = `
    <button class="back-btn" id="goBack" aria-label="رجوع">→</button>
    <div class="grow">
      ${sub ? `<p class="tiny muted bold">${sub}</p>` : ''}
      <h1 class="disp t-lg">${title}</h1>
    </div>
    <button class="icon-btn" data-theme-toggle aria-label="تبديل الوضع الليلي">🌙</button>`;
  el.querySelector('#goBack').onclick = ()=>{
    sfx.tap();
    if(history.length > 1) history.back(); else location.href = backHref || 'index.html';
  };
  applyTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

/* أدوات عامة */
const qs  = (s,r)=> (r||document).querySelector(s);
const qsa = (s,r)=> Array.from((r||document).querySelectorAll(s));
const param = k => new URLSearchParams(location.search).get(k);
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
const pick = (arr, n) => shuffle(arr).slice(0, n);
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* أسئلة الاختبار: تُخلط الخيارات مع تتبّع الإجابة الصحيحة */
function buildQuestion(raw){
  const order = shuffle(raw.o.map((text,i)=>({text, ok:i===raw.a})));
  return { q:raw.q, options:order, answer:order.findIndex(o=>o.ok), hint:raw.h||'' };
}
/** يسحب أسئلة عشوائية من مادة (أو من كل المواد) */
function drawQuestions(subject, n){
  let pool = [];
  if(subject && LESSONS[subject]){
    const banks = [...new Set(LESSONS[subject].map(l=>l.bank))];
    banks.forEach(b => pool.push(...(QUESTIONS[b]||[])));
  }
  if(!pool.length) pool = Object.values(QUESTIONS).flat();
  return pick(pool, Math.min(n, pool.length)).map(buildQuestion);
}

/* عناصر واجهة قابلة لإعادة الاستخدام */
function tone(t){ return 't-'+t; }
function tileCard(s){
  const p = subjectProgress(s.id);
  return `<a class="tile ${tone(s.tone)} rail-w" href="subject.html?s=${s.id}">
    <span class="chip chip-on-tile">${p.done ? num(p.done)+' / '+num(p.all) : num(p.all)} دروس</span>
    <h3 class="mt2">${s.name}</h3>
    <p class="tiny mt1 clamp2" style="opacity:.8;padding-inline-end:34px">${s.desc}</p>
    <span class="emo">${s.emoji}</span>
  </a>`;
}

/* ------------------------- 9. التصدير ------------------------- */
window.App = {
  S, save, num, addXp, markCorrect, markWrong, completeLesson, lessonDone, lessonsCount,
  subjectProgress, tryGame, checkBadges, hasBadge, badgeEarned, touchDay,
  logActivity, todayActs, DAILY_GOAL,
  streak, week, WEEK_LABELS, level, levelXp, league, XP_PER_LEVEL,
  toast, confetti, countUp, sfx, openSheet, closeSheet,
  applyTheme, toggleTheme, initTheme, mountTabbar, mountSubbar, tabbar,
  qs, qsa, param, shuffle, pick, escapeHtml, buildQuestion, drawQuestions, tone, tileCard,
  localizeDigits,
  today, iso
};

/* تهيئة فورية */
initTheme();
document.addEventListener('click', e=>{
  if(e.target.closest('[data-theme-toggle]')) toggleTheme();
});
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  localizeDigits();
});

})();
