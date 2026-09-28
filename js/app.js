(() => {
'use strict';

/* =========================================================
   Helpers
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const D = ms => (REDUCED ? Math.min(ms, 40) : ms);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function announce(msg) { const el = document.getElementById('sr'); if (!el) return; el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 60); }
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = n => Math.floor(Math.random() * n);
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 's' + Math.random().toString(36).slice(2, 10);
const Ease = {
  outCubic: t => 1 - Math.pow(1 - t, 3),
  outQuart: t => 1 - Math.pow(1 - t, 4),
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBounce: t => { const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375; }
};
function anim(el, frames, opts) {
  const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
  return a.finished.then(() => {
    const last = frames[frames.length - 1];
    if (last.transform != null) el.style.transform = last.transform;
    if (last.opacity != null) el.style.opacity = last.opacity;
    a.cancel();
  }).catch(() => {});
}
const AV_COLORS = ['#e22840', '#2f5bea', '#169c55', '#8b3fd9', '#ff7a1a', '#0e9aa7', '#d6336c', '#c98a00'];
function avColor(name) { let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; }
function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(); }
function avatar(s, size) {
  const st = `--s:${size}px;--av:${avColor(s.name)}`;
  return s.photo ? `<span class="avatar" style="${st}"><img src="${s.photo}" alt=""></span>`
                 : `<span class="avatar" style="${st}">${esc(initials(s.name))}</span>`;
}
function readPhoto(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const S = 192, c = document.createElement('canvas'); c.width = c.height = S;
        const m = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

const ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-2.5h6L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  wheel: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/></svg>',
  cards: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="11" height="15" rx="2" transform="rotate(-10 8.5 13.5)"/><rect x="10" y="3" width="11" height="15" rx="2"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 12h5"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h3.5c4 0 7 12 11 12H21M3 18h3.5c1.6 0 3-1.9 4.3-4.3M13.2 10.3C14.5 7.9 15.9 6 17.5 6H21M18 3l3 3-3 3M18 15l3 3-3 3"/></svg>'
};

/* =========================================================
   Storage + state
   ========================================================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('rc2_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('rc2_' + k, JSON.stringify(v)); } catch (e) {} }
};
const SAMPLE = ['Valentina', 'Santiago', 'Camila', 'Mateo', 'Isabella', 'Samuel', 'Mariana', 'Sebastián'];
let roster = store.get('roster', null);
if (!roster) {
  let legacy = null;
  try { legacy = JSON.parse(localStorage.getItem('rc_roster') || 'null'); } catch (e) {}
  roster = (legacy && legacy.length)
    ? legacy.map(s => ({ id: s.id || uid(), name: s.name, photo: s.photo || null }))
    : SAMPLE.map(n => ({ id: uid(), name: n, photo: null, sample: true }));
}
const state = {
  roster,
  pool: store.get('pool', null) || roster.map(s => s.id),
  history: store.get('history', []),
  screen: 'roster',
  pickMode: store.get('pickMode', 'roulette'),
  current: null,
  mode: store.get('mode', 'light'),
  jpOdds: store.get('jpOdds', 0.25),
  rxVis: store.get('rxVis', 250),
  pickerAngle: 0,
  pkOrder: null,
  rl: null,
  slots: null
};
state.pool = state.pool.filter(id => state.roster.some(s => s.id === id));
function save() {
  store.set('roster', state.roster); store.set('pool', state.pool);
  store.set('history', state.history.slice(0, 80)); store.set('pickMode', state.pickMode);
}
const byId = id => state.roster.find(s => s.id === id);
const poolStudents = () => state.pool.map(byId).filter(Boolean);
function addStudent(name, photo) { const s = { id: uid(), name: name.slice(0, 40), photo: photo || null }; state.roster.push(s); state.pool.push(s.id); save(); }
function removeStudent(id) { state.roster = state.roster.filter(s => s.id !== id); state.pool = state.pool.filter(x => x !== id); if (state.current && state.current.id === id) state.current = null; save(); }

const V = {
  saveStay: 'Te salvas de esta ronda · Sigues en la ruleta',
  saveOut: 'Te salvas de esta ronda · Sales de la ruleta',
  lose: 'Te toca responder · Sales de la ruleta'
};

/* =========================================================
   Sound (Web Audio, generated)
   ========================================================= */
const Sound = (() => {
  let ctx = null, on = store.get('sound', true), lastTick = 0;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, d, type, vol, delay, slideTo) {
    if (!on) return; const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, vol, delay, hp) {
    if (!on) return; const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), len = Math.max(1, Math.floor(c.sampleRate * d));
    const buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 1200;
    const g = c.createGain(); g.gain.value = vol || 0.2;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  }
  return {
    get on() { return on; },
    toggle() { on = !on; store.set('sound', on); if (on) ac(); return on; },
    unlock() { if (on) ac(); },
    tick() { const n = performance.now(); if (n - lastTick < 28) return; lastTick = n; tone(2100, 0.025, 'square', 0.045); },
    clack() { noise(0.05, 0.3, 0, 2200); },
    swish() { noise(0.2, 0.12, 0, 900); },
    flip() { noise(0.08, 0.18, 0, 1500); tone(600, 0.1, 'triangle', 0.06, 0, 1000); },
    thunk() { tone(150, 0.14, 'sine', 0.35, 0, 70); noise(0.05, 0.12, 0, 300); },
    lever() { tone(240, 0.18, 'sawtooth', 0.07, 0, 110); noise(0.14, 0.14, 0, 600); },
    ding() { tone(1320, 0.35, 'triangle', 0.14); tone(1760, 0.45, 'triangle', 0.1, 0.08); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.18, i * 0.11)); tone(1319, 0.6, 'triangle', 0.16, 0.46); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'sawtooth', 0.07, i * 0.17)); },
    boom() { noise(0.7, 0.45, 0, 80); tone(95, 0.55, 'sine', 0.3, 0, 40); },
    blip() { tone(880, 0.08, 'square', 0.07); }
  };
})();

/* =========================================================
   Marquee bulbs, theme, overlay, confetti
   ========================================================= */
const marquee = $('#marquee'), bulbLayer = $('#bulbLayer'), stage = $('#stage'), overlay = $('#overlay');
let bulbSize = '';
function layoutBulbs() {
  const w = marquee.clientWidth, h = marquee.clientHeight, key = w + 'x' + h;
  if (key === bulbSize) return; bulbSize = key;
  const inset = w < 520 ? 8 : 11, gap = 30, pts = [];
  const edge = (ax, ay, bx, by) => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / gap)); for (let i = 0; i < n; i++) { const t = i / n; pts.push([ax + (bx - ax) * t, ay + (by - ay) * t]); } };
  edge(inset, inset, w - inset, inset); edge(w - inset, inset, w - inset, h - inset);
  edge(w - inset, h - inset, inset, h - inset); edge(inset, h - inset, inset, inset);
  bulbLayer.innerHTML = pts.map((p, i) => `<span class="bulb ${i % 2 ? 'b' : 'a'}" style="left:${p[0].toFixed(1)}px;top:${p[1].toFixed(1)}px"></span>`).join('');
}
let flashTimer = null;
function flashMarquee(kind, ms) { marquee.classList.remove('party', 'alarm'); void marquee.offsetWidth; marquee.classList.add(kind); clearTimeout(flashTimer); flashTimer = setTimeout(() => marquee.classList.remove(kind), ms); }

function applyMode(m) {
  state.mode = m; document.documentElement.setAttribute('data-mode', m); store.set('mode', m);
  const b = $('#themeBtn'); b.innerHTML = m === 'light' ? ICONS.moon : ICONS.sun;
  b.setAttribute('aria-label', m === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'); b.title = b.getAttribute('aria-label');
}
function updateSoundBtn() {
  const b = $('#soundBtn'); b.innerHTML = Sound.on ? ICONS.soundOn : ICONS.soundOff;
  b.setAttribute('aria-label', Sound.on ? 'Silenciar sonidos' : 'Activar sonidos'); b.title = b.getAttribute('aria-label');
}

let lastFocus = null, overlayEsc = null;
function setInert(v) { [$('.topbar'), marquee].forEach(el => { if (el) { el.inert = v; if (v) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden'); } }); }
function openOverlay(html, { onEsc = null } = {}) {
  if (overlay.hidden) lastFocus = document.activeElement;
  overlay.innerHTML = html; overlay.hidden = false; overlayEsc = onEsc; setInert(true);
  void overlay.offsetWidth; overlay.classList.add('show');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden && overlayEsc) { e.preventDefault(); overlayEsc(); } });
function closeOverlay(instant) {
  overlayEsc = null; setInert(false);
  if (lastFocus && lastFocus.isConnected && !instant) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  lastFocus = null;
  overlay.classList.remove('show');
  $$('body > .flycard, body > .rays').forEach(e => e.remove());
  if (instant) { overlay.hidden = true; overlay.innerHTML = ''; return; }
  setTimeout(() => { if (!overlay.classList.contains('show')) { overlay.hidden = true; overlay.innerHTML = ''; } }, 260);
}

const confCanvas = $('#confetti');
function confetti(n = 160) {
  if (REDUCED) return;
  const dpr = window.devicePixelRatio || 1, W = confCanvas.width = innerWidth * dpr, H = confCanvas.height = innerHeight * dpr;
  const ctx = confCanvas.getContext('2d');
  const colors = ['#e22840', '#f5b400', '#2f5bea', '#169c55', '#8b3fd9', '#ff7a1a', '#ffffff'];
  const ps = Array.from({ length: n }, () => ({ x: W / 2 + rand(-90, 90) * dpr, y: H * 0.42, vx: rand(-10, 10) * dpr, vy: rand(-17, -5) * dpr, w: rand(6, 11) * dpr, h: rand(9, 16) * dpr, r: rand(0, 6.28), vr: rand(-0.25, 0.25), c: colors[randInt(colors.length)] }));
  const t0 = performance.now();
  (function f(now) {
    const t = now - t0; ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += 0.38 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - t / 3200); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2); ctx.restore(); });
    if (t < 3200) requestAnimationFrame(f); else ctx.clearRect(0, 0, W, H);
  })(t0);
}

/* Outcome: GANASTE / PERDISTE
   - Real turn: only "Siguiente estudiante" applies the rules. The back icon leaves without applying anything.
   - Practice: "Probar otra vez" / "Cerrar", nothing is ever recorded. */
function showOutcome({ win, game, detail, removed, verdict, retry, focusButton = true }) {
  const s = state.current, practice = !s;
  const title = win ? '¡GANASTE!' : 'PERDISTE';
  openOverlay(`
    <div class="outcome ${win ? 'win' : 'lose'}" role="dialog" aria-modal="true" aria-labelledby="outTitle" aria-describedby="outDesc" tabindex="-1">
      <button class="back-ico" id="outBack" type="button" aria-label="Volver a la ruleta sin aplicar el resultado" title="Volver a la ruleta (no aplica el resultado)">${ICONS.back}</button>
      <div class="stamp" id="outTitle">${title}</div>
      ${s ? `<div class="who">${avatar(s, 44)}<span>${esc(s.name)}</span></div>` : '<div class="who muted">Modo práctica</div>'}
      <div id="outDesc">
        ${detail ? `<p class="detail">${detail}</p>` : ''}
        <div class="verdict">${practice ? 'En una partida real: ' + verdict.charAt(0).toLowerCase() + verdict.slice(1) : verdict}</div>
      </div>
      <div class="actions">${practice
        ? `<div class="row center"><button class="btn lg ${win ? 'green' : 'red'}" id="outRetry" type="button">Probar otra vez</button><button class="btn ghost lg" id="outClose" type="button">Cerrar</button></div>`
        : `<button class="btn lg ${win ? 'green' : 'red'}" id="outNext" type="button">Siguiente estudiante →</button>`}</div>
    </div>`, { onEsc: practice ? () => closeOverlay() : null });
  announce(`${title}. ${s ? s.name + '. ' : ''}${(detail || '').replace(/<[^>]+>/g, '')}. ${verdict}`);
  if (win) { Sound.win(); confetti(); flashMarquee('party', 3200); }
  else { Sound.lose(); flashMarquee('alarm', 1800); }
  $('#outBack').addEventListener('click', () => go('select'));
  if (practice) {
    $('#outClose').addEventListener('click', () => closeOverlay());
    $('#outRetry').addEventListener('click', () => { closeOverlay(true); if (retry) retry(); });
  } else {
    $('#outNext').addEventListener('click', () => {
      state.history.unshift({ id: s.id, name: s.name, game, win, removed, t: Date.now() });
      if (removed) state.pool = state.pool.filter(id => id !== s.id);
      state.current = null; save(); go('select');
    });
  }
  // In the reaction game a student may keep hitting Space: never put focus on an action button there.
  const target = focusButton ? (practice ? $('#outRetry') : $('#outNext')) : $('.outcome');
  setTimeout(() => { try { target.focus({ preventScroll: true }); } catch (e) {} }, 60);
}

/* During a turn (a student has been chosen) the list and the draw are locked in the top bar:
   the only way back is the explicit "Volver a la ruleta" control, which releases the student. */
function updateNav() {
  const sec = state.screen.startsWith('game-') ? 'games' : state.screen, locked = !!state.current;
  $$('#steps button').forEach(b => {
    const on = b.dataset.go === sec; b.classList.toggle('active', on); b.setAttribute('aria-current', on ? 'page' : 'false');
    const lock = locked && b.dataset.go !== 'games';
    b.disabled = lock;
    b.title = lock ? `Turno en curso de ${state.current.name}. Para salir usa «Volver a la ruleta».` : '';
  });
}

/* =========================================================
   Router
   ========================================================= */
let cleanups = [];
const onCleanup = fn => cleanups.push(fn);
function go(screen) {
  cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = [];
  closeOverlay(true);
  if (screen === 'select' || screen === 'roster') state.current = null;
  state.screen = screen;
  const sec = screen.startsWith('game-') ? 'games' : screen;
  updateNav();
  ({ roster: renderRoster, select: renderSelect, games: renderGames, 'game-roulette': renderRoulette, 'game-slots': renderSlots, 'game-reaction': renderReaction, 'game-hilo': renderHilo, 'game-blackjack': renderBlackjack })[screen]();
}

/* =========================================================
   Screen 1 · Roster
   ========================================================= */
function renderRoster() {
  const n = state.roster.length, hasSample = state.roster.some(s => s.sample);
  stage.innerHTML = `
    <div class="screen-head">
      <div class="eyebrow">Paso 1 · Lista</div>
      <h2>Tus estudiantes</h2>
      <p>${n ? `${n} en la lista · ${state.pool.length} en juego en esta ronda` : 'Añade a tus estudiantes para empezar'}</p>
    </div>
    ${hasSample ? `<div class="sample-note"><span>Estos nombres son de ejemplo para que pruebes la app.</span><button class="btn ghost sm" id="clearSample" type="button">Borrar ejemplos</button></div>` : ''}
    <form class="add-bar" id="addForm" autocomplete="off">
      <input class="field" id="nameInput" type="text" placeholder="Nombre del estudiante" maxlength="40" aria-label="Nombre del estudiante">
      <label class="photo-pick" title="Foto opcional"><span id="photoPrev">${ICONS.camera}</span><span>Foto</span><input type="file" id="photoInput" accept="image/*" hidden></label>
      <button class="btn" type="submit">Añadir</button>
    </form>
    <div class="row center" style="margin-top:12px"><button class="linkish" id="bulkToggle" type="button">Pegar una lista de nombres</button></div>
    <div id="bulkBox" class="bulk" hidden>
      <textarea class="field" id="bulkText" placeholder="Un nombre por línea"></textarea>
      <div class="row center" style="margin-top:10px"><button class="btn blue" id="bulkAdd" type="button">Añadir todos</button></div>
    </div>
    <div id="rosterList"></div>
    <div class="cta-row"><button class="btn lg red" id="goSelect" type="button" ${n ? '' : 'disabled'}>Ir al sorteo →</button></div>
    <input type="file" id="cardPhoto" accept="image/*" hidden>`;
  drawRosterList();

  let pendingPhoto = null, photoTarget = null;
  $('#photoInput').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { pendingPhoto = await readPhoto(f); $('#photoPrev').innerHTML = `<img src="${pendingPhoto}" alt="">`; } catch (err) {}
  });
  $('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#nameInput').value.trim(); if (!name) { $('#nameInput').focus(); return; }
    addStudent(name, pendingPhoto); renderRoster(); $('#nameInput').focus();
  });
  $('#bulkToggle').addEventListener('click', () => { const b = $('#bulkBox'); b.hidden = !b.hidden; if (!b.hidden) $('#bulkText').focus(); });
  $('#bulkAdd').addEventListener('click', () => {
    $('#bulkText').value.split(/[\n,;]/).map(x => x.trim()).filter(Boolean).forEach(x => addStudent(x, null));
    renderRoster();
  });
  $('#goSelect').addEventListener('click', () => go('select'));
  const cs = $('#clearSample');
  if (cs) cs.addEventListener('click', () => {
    const ids = state.roster.filter(s => s.sample).map(s => s.id);
    state.roster = state.roster.filter(s => !s.sample);
    state.pool = state.pool.filter(id => !ids.includes(id));
    state.history = state.history.filter(h => !ids.includes(h.id));
    save(); renderRoster();
  });
  $('#rosterList').addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'); if (rm) { removeStudent(rm.dataset.rm); renderRoster(); return; }
    const av = e.target.closest('[data-photo]'); if (av) { photoTarget = av.dataset.photo; $('#cardPhoto').click(); }
  });
  $('#cardPhoto').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f || !photoTarget) return;
    try { const p = await readPhoto(f); const s = byId(photoTarget); if (s) { s.photo = p; save(); } } catch (err) {}
    e.target.value = ''; drawRosterList();
  });
}
function drawRosterList() {
  const wrap = $('#rosterList');
  if (!state.roster.length) { wrap.innerHTML = '<div class="empty">Aún no hay estudiantes. Escribe un nombre arriba y pulsa «Añadir».</div>'; return; }
  wrap.innerHTML = `<div class="roster-grid">${state.roster.map(s => {
    const inPool = state.pool.includes(s.id);
    return `<div class="s-card">
      <button class="x" data-rm="${s.id}" type="button" aria-label="Quitar a ${esc(s.name)}">✕</button>
      <button class="av-btn" data-photo="${s.id}" type="button" aria-label="Cambiar la foto de ${esc(s.name)}">${avatar(s, 64)}<span class="av-edit">${ICONS.camera}</span></button>
      <div class="nm">${esc(s.name)}</div>
      <span class="tag ${inPool ? 'in' : 'out'}">${inPool ? 'En juego' : 'Fuera de la ruleta'}</span>
    </div>`; }).join('')}</div>`;
}

/* =========================================================
   Screen 2 · Select (roulette / poker)
   ========================================================= */
function renderSelect() {
  const pool = poolStudents();
  stage.innerHTML = `
    <div class="screen-head"><div class="eyebrow">Paso 2 · Sorteo</div><h2>¿Quién sigue?</h2></div>
    <div class="mode-toggle"><div class="seg" role="tablist" aria-label="Modo de sorteo">
      <button type="button" role="tab" data-mode="roulette" class="${state.pickMode === 'roulette' ? 'active' : ''}" aria-selected="${state.pickMode === 'roulette'}">${ICONS.wheel} Ruleta</button>
      <button type="button" role="tab" data-mode="poker" class="${state.pickMode === 'poker' ? 'active' : ''}" aria-selected="${state.pickMode === 'poker'}">${ICONS.cards} Poker</button>
    </div></div>
    <div class="select-layout"><div id="pickArea"></div><aside class="side" id="sidePanel"></aside></div>`;
  renderSide();
  $$('.seg [data-mode]').forEach(b => b.addEventListener('click', () => { if (b.disabled) return; state.pickMode = b.dataset.mode; save(); go('select'); }));
  if (!state.roster.length) {
    $('#pickArea').innerHTML = `<div class="empty-state"><div class="big" aria-hidden="true">📝</div><h3>Aún no hay estudiantes</h3>
      <p>Todavía no agregaste a nadie a la lista. Añade los nombres y vuelve aquí para sortear.</p>
      <button class="btn lg" id="toRoster" type="button">Ir a la lista de estudiantes</button></div>`;
    $('#toRoster').addEventListener('click', () => go('roster'));
    return;
  }
  if (!pool.length) {
    const saved = state.history.filter(h => h.win).length, answered = state.history.filter(h => !h.win).length;
    $('#pickArea').innerHTML = `<div class="empty-state"><div class="big" aria-hidden="true">🏁</div><h3>¡Todos jugaron!</h3>
      <p>La ronda terminó: ya no queda nadie en la ruleta.</p>
      <div class="stats"><span class="tag in">${saved} ${saved === 1 ? 'se salvó' : 'se salvaron'}</span><span class="tag out">${answered} ${answered === 1 ? 'respondió' : 'respondieron'}</span></div>
      <button class="btn lg" id="resetEmpty" type="button">Empezar una ronda nueva</button></div>`;
    $('#resetEmpty').addEventListener('click', resetRound);
    announce('¡Todos jugaron! La ronda terminó.');
    return;
  }
  if (state.pickMode === 'roulette') renderPicker(pool); else renderPoker(pool);
}
function setModeLock(lock) { $$('.seg [data-mode]').forEach(b => { b.disabled = lock; }); }
function resetRound() { state.pool = state.roster.map(s => s.id); state.history = []; state.current = null; state.pkOrder = null; save(); go('select'); }
function renderSide() {
  const side = $('#sidePanel'), pool = poolStudents(), hist = state.history.slice(0, 14);
  side.innerHTML = `
    <h3>En juego <span class="count">${pool.length}</span></h3>
    <div class="pool-chips">${pool.length ? pool.map(s => `<span class="pchip">${avatar(s, 22)}${esc(s.name)}</span>`).join('') : '<span class="muted small">Nadie</span>'}</div>
    <h3>Historial</h3>
    ${hist.length ? `<ul class="hist">${hist.map(h => {
      const who = byId(h.id) || { name: h.name };
      return `<li>${avatar(who, 28)}<span class="who"><span class="nm">${esc(h.name)}</span><span class="g"><span class="tag ${h.win ? 'in' : 'out'}">${h.win ? 'Se salvó' : 'Responde'}</span>${esc(h.game)} · ${h.removed ? 'sale' : 'sigue'}</span></span></li>`;
    }).join('')}</ul>` : '<p class="muted small" style="margin:0 0 14px">Aún no hay turnos jugados.</p>'}
    <button class="btn ghost sm full" id="resetRound" type="button">Reiniciar ronda</button>`;
  const rb = $('#resetRound'); let armed = false, tm;
  rb.addEventListener('click', () => {
    if (!armed) { armed = true; rb.textContent = '¿Seguro? Toca otra vez'; rb.classList.add('armed');
      tm = setTimeout(() => { armed = false; rb.textContent = 'Reiniciar ronda'; rb.classList.remove('armed'); }, 3000); return; }
    clearTimeout(tm); resetRound();
  });
}

/* Card that flies to the centre, flips and grows */
async function flyReveal(start, s, { onBack } = {}) {
  const TW = Math.round(Math.min(250, innerWidth * 0.62, (innerHeight - 170) / 1.4)), TH = Math.round(TW * 1.4);
  const backToPick = () => { closeOverlay(); if (onBack) onBack(); };
  openOverlay(`<div class="reveal" id="reveal" role="dialog" aria-modal="true" aria-label="Le tocó a ${esc(s.name)}" style="--tw:${TW}px;--th:${TH}px"><div class="slot"></div>
    <div class="actions"><button class="btn lg" id="revGo" type="button">Elegir juego →</button><button class="btn ghost lg" id="revBack" type="button" style="color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.6)">↩ Volver a elegir</button></div></div>`, { onEsc: backToPick });
  const slot = $('#reveal .slot').getBoundingClientRect();
  const suits = [['♥', 'red'], ['♠', 'black'], ['♦', 'red'], ['♣', 'black']][randInt(4)];
  const card = document.createElement('div');
  card.className = 'flycard';
  Object.assign(card.style, { left: slot.left + 'px', top: slot.top + 'px', width: TW + 'px', height: TH + 'px' });
  card.style.setProperty('--cw', TW + 'px');
  card.innerHTML = `<div class="inner">
      <div class="face front"><span class="corner tl ${suits[1]}">${suits[0]}</span><span class="corner br ${suits[1]}">${suits[0]}</span>
        <div class="sub">¡Te toca!</div>${avatar(s, Math.round(TW * 0.46))}<div class="who">${esc(s.name)}</div></div>
      <div class="face back card-back"></div></div>`;
  const rays = document.createElement('div');
  rays.className = 'rays'; rays.style.left = (slot.left + TW / 2) + 'px'; rays.style.top = (slot.top + TH / 2) + 'px';
  document.body.append(rays, card);
  const sx = start.width / TW;
  const dx = (start.left + start.width / 2) - (slot.left + TW / 2), dy = (start.top + start.height / 2) - (slot.top + TH / 2);
  const dur = D(1250);
  Sound.swish(); setTimeout(() => Sound.flip(), dur * 0.45);
  const inner = card.querySelector('.inner');
  const a1 = card.animate([
    { transform: `translate(${dx}px,${dy}px) scale(${sx})` },
    { transform: `translate(${dx * 0.4}px,${dy * 0.4 - 70}px) scale(${(sx + 1) / 2}) rotate(-8deg)`, offset: 0.45 },
    { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'both' });
  inner.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(180deg)', offset: 0.3 }, { transform: 'rotateY(360deg)' }],
    { duration: dur, easing: 'ease-in-out', fill: 'both' });
  try { await a1.finished; } catch (e) { return; }
  if (!card.isConnected) return;
  card.classList.add('landed'); rays.classList.add('on'); $('#reveal').classList.add('ready');
  Sound.ding(); confetti(70); announce(`Le tocó a ${s.name}.`);
  $('#revGo').addEventListener('click', () => { state.current = s; go('games'); });
  $('#revBack').addEventListener('click', backToPick);
  setTimeout(() => { try { $('#revGo').focus({ preventScroll: true }); } catch (e) {} }, 60);
}

/* ---------- Picker: wheel of students ---------- */
const WHEEL_COLORS = ['#e22840', '#f5b400', '#2f5bea', '#169c55', '#8b3fd9', '#ff7a1a'];
function renderPicker(pool) {
  const area = $('#pickArea'), n = pool.length, a = 360 / n, R = 200, HUB = 42;
  const colors = pool.map((_, i) => WHEEL_COLORS[i % WHEEL_COLORS.length]);
  if (n > 1 && colors[n - 1] === colors[0]) colors[n - 1] = WHEEL_COLORS[2];
  const pt = (ang, r) => { const t = ang * Math.PI / 180; return [r * Math.sin(t), -r * Math.cos(t)]; };
  const withPhotos = n <= 16 && pool.some(s => s.photo);
  const outer = withPhotos ? R * 0.70 : R * 0.93, inner = HUB * 1.15;
  const rMid = (outer + inner) / 2;
  let segs = '';
  pool.forEach((s, i) => {
    const a0 = i * a, a1 = (i + 1) * a, c = a0 + a / 2;
    let d;
    if (n === 1) d = `M0,${-R} A${R},${R} 0 1,1 0,${R} A${R},${R} 0 1,1 0,${-R} Z`;
    else { const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R); d = `M0,0 L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${a > 180 ? 1 : 0},1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`; }
    const fill = colors[i], txt = fill === '#f5b400' ? '#3a2500' : '#ffffff';
    const arcW = n === 1 ? 200 : 2 * Math.PI * rMid / n;
    const fs = Math.max(9, Math.min(22, arcW * 0.5));
    const maxChars = Math.max(3, Math.floor((outer - inner) / (fs * 0.6)));
    const label = s.name.length > maxChars ? s.name.slice(0, maxChars - 1) + '…' : s.name;
    let photo = '';
    if (withPhotos && s.photo) {
      const pr = Math.min(26, (n === 1 ? 60 : 2 * Math.PI * R * 0.84 / n) * 0.36), cy = -R * 0.84;
      photo = `<clipPath id="pc${i}"><circle cx="0" cy="${cy}" r="${pr.toFixed(1)}"/></clipPath>
        <image href="${s.photo}" x="${(-pr).toFixed(1)}" y="${(cy - pr).toFixed(1)}" width="${(pr * 2).toFixed(1)}" height="${(pr * 2).toFixed(1)}" clip-path="url(#pc${i})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="0" cy="${cy}" r="${pr.toFixed(1)}" fill="none" stroke="#fff" stroke-width="2.5"/>`;
    }
    segs += `<g class="seg-g" data-i="${i}"><path d="${d}" fill="${fill}" stroke="rgba(255,255,255,.9)" stroke-width="2"/>
      <g transform="rotate(${c.toFixed(3)})">${photo}<text transform="translate(0,${(-rMid).toFixed(1)}) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="${fs.toFixed(1)}" fill="${txt}">${esc(label)}</text></g></g>`;
  });
  let pegs = '';
  if (n > 1) for (let i = 0; i < n; i++) { const [x, y] = pt(i * a, R - 4); pegs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="#fff6cf" stroke="#b37f00" stroke-width="1.5"/>`; }
  let bulbs = ''; const NB = 30;
  for (let i = 0; i < NB; i++) { const [x, y] = pt(i * 360 / NB + 6, R + 13); bulbs += `<circle class="rim-bulb ${i % 2 ? 'b' : 'a'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#fff6cf"/>`; }

  area.innerHTML = `<div class="picker">
    <svg class="wheel-svg" id="pw" viewBox="-232 -250 464 484" role="img" aria-label="Ruleta con ${n} estudiantes">
      <defs>
        <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#f5b400"/><stop offset="1" stop-color="#b37f00"/></linearGradient>
        <radialGradient id="hubGrad" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#f5b400"/><stop offset="1" stop-color="#b37f00"/></radialGradient>
      </defs>
      <circle r="${R + 22}" cy="10" fill="rgba(0,0,0,.16)"/>
      <circle r="${R + 13}" fill="none" stroke="url(#rimGrad)" stroke-width="24"/>
      <g id="pwWheel" transform="rotate(${state.pickerAngle})">${segs}${pegs}</g>
      ${bulbs}
      <g class="hub" id="pwHub" role="button" tabindex="0" aria-label="Girar la ruleta"><circle r="${HUB}" fill="url(#hubGrad)" stroke="#fff6cf" stroke-width="4"/><text y="1" text-anchor="middle" dominant-baseline="central" font-size="14" fill="#3a2500">GIRAR</text></g>
      <g id="pwPointer"><path d="M-17,${-R - 34} L17,${-R - 34} L0,${-R + 10} Z" fill="#e22840" stroke="#fff6cf" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="${-R - 27}" r="5" fill="#fff6cf"/></g>
    </svg>
    <button class="btn lg red" id="pwSpin" type="button">${ICONS.wheel} Girar la ruleta</button>
    <p class="pick-note">Girar no cuenta nada hasta que elijas un juego.</p>
  </div>`;

  const svg = $('#pw'), wheel = $('#pwWheel'), pointer = $('#pwPointer');
  const segAt = ang => Math.floor(((((-ang) % 360) + 360) % 360) / a) % n;
  let raf = 0, spinning = false;
  onCleanup(() => cancelAnimationFrame(raf));
  function kick() {
    pointer.style.transition = 'none'; pointer.style.transform = 'rotate(-26deg)';
    void pointer.getBoundingClientRect();
    pointer.style.transition = 'transform .14s ease-out'; pointer.style.transform = 'rotate(0deg)';
  }
  function spin() {
    if (spinning) return; spinning = true;
    $('#pwSpin').disabled = true; setModeLock(true);
    svg.classList.remove('decided'); $$('.seg-g.win', svg).forEach(g => g.classList.remove('win'));
    svg.classList.add('spinning');
    // The winner is uniform; only where it stops inside its slice varies, to create near-misses:
    // sometimes it barely crosses into the slice, sometimes it almost leaves it.
    const idx = randInt(n), roll = Math.random();
    const frac = roll < 0.35 ? rand(0.86, 0.96) : roll < 0.6 ? rand(0.04, 0.14) : rand(0.2, 0.8);
    const phi = idx * a + a * frac;
    const R0 = state.pickerAngle, base = R0 + 360 * (7 + randInt(3));
    const Rend = base + ((((-phi - base) % 360) + 360) % 360);
    // Motion profile: fast spin that slows down (T1), then a slow constant crawl (T2),
    // then a gentle final stop (T3). v0 is solved so the wheel lands exactly on the target.
    const dist = Rend - R0;
    const vSlow = Math.max(24, Math.min(60, a * 1.1));      // degrees per second while crawling
    const T1 = 6, T2 = 2.2 + rand(0, 1.3), T3 = 1.7;
    const d2 = vSlow * T2, d3 = vSlow * T3 / 2;
    const v0 = vSlow + 4 * (dist - d2 - d3 - vSlow * T1) / T1;
    const d1 = vSlow * T1 + (v0 - vSlow) * T1 / 4;
    const posAt = sec => {
      if (sec <= T1) return vSlow * sec + (v0 - vSlow) * (T1 / 4) * (1 - Math.pow(1 - sec / T1, 4));
      if (sec <= T1 + T2) return d1 + vSlow * (sec - T1);
      const tau = Math.min(T3, sec - T1 - T2);
      return d1 + d2 + vSlow * tau - vSlow * tau * tau / (2 * T3);
    };
    const dur = REDUCED ? 1200 : (T1 + T2 + T3) * 1000;
    const t0 = performance.now(); let last = segAt(R0);
    Sound.clack();
    (function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      const ang = REDUCED ? R0 + dist * Ease.outQuart(t) : (t >= 1 ? Rend : R0 + posAt(t * dur / 1000));
      state.pickerAngle = ang; wheel.setAttribute('transform', `rotate(${ang.toFixed(3)})`);
      const sg = segAt(ang); if (sg !== last) { last = sg; Sound.tick(); kick(); }
      if (t < 1) { raf = requestAnimationFrame(frame); return; }
      state.pickerAngle = ang % 360; wheel.setAttribute('transform', `rotate(${state.pickerAngle.toFixed(3)})`);
      spinning = false; svg.classList.remove('spinning');
      const win = segAt(state.pickerAngle);
      announce(`La ruleta se detuvo en ${pool[win].name}.`);
      svg.classList.add('decided'); $(`.seg-g[data-i="${win}"]`, svg).classList.add('win');
      Sound.ding();
      setTimeout(() => {
        const r = svg.getBoundingClientRect(), w = r.width * 0.16;
        flyReveal({ left: r.left + r.width / 2 - w / 2, top: r.top + r.height * 0.1, width: w, height: w * 1.4 }, pool[win], {
          onBack: () => { svg.classList.remove('decided'); $('#pwSpin').disabled = false; setModeLock(false); }
        });
      }, D(900));
    })(t0);
  }
  $('#pwSpin').addEventListener('click', spin);
  $('#pwHub').addEventListener('click', spin);
  $('#pwHub').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spin(); } });
}

/* ---------- Picker: poker cards ---------- */
function renderPoker(pool) {
  const area = $('#pickArea');
  area.innerHTML = `<div class="table" id="table"></div>
    <div class="poker-actions">
      <button class="btn ghost lg" id="pkShuffle" type="button">${ICONS.shuffle} Reordenar</button>
      <button class="btn red lg" id="pkRandom" type="button">${ICONS.cards} Escoger al azar</button>
    </div>
    <p class="pick-note">También puedes tocar una carta para voltearla. Nada cuenta hasta que elijas un juego.</p>`;
  const table = $('#table');
  const ids = pool.map(s => s.id);
  if (!state.pkOrder || state.pkOrder.length !== ids.length || !ids.every(id => state.pkOrder.includes(id))) state.pkOrder = shuffle(ids);
  const cards = new Map(), rot = {};
  state.pkOrder.forEach(id => {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'pcard'; el.dataset.id = id;
    el.innerHTML = '<span class="card-back"></span>';
    table.appendChild(el); cards.set(id, el); rot[id] = rand(-2.5, 2.5);
  });
  let busy = false, geo = null, lastW = 0;
  const T = (x, y, r = 0, s = 1) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)${s !== 1 ? ` scale(${s})` : ''}`;
  function measure() {
    const W = table.clientWidth, cw = W < 520 ? 56 : 76, ch = Math.round(cw * 1.4), gap = cw < 70 ? 10 : 14, pad = 34, n = state.pkOrder.length;
    const cols = Math.max(1, Math.min(n, Math.floor((W - pad * 2 + gap) / (cw + gap)))), rows = Math.ceil(n / cols);
    const gridH = rows * (ch + gap) - gap, H = Math.max(330, gridH + pad * 2);
    const pos = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - (rows - 1) * cols : cols;
      const rowW = inRow * (cw + gap) - gap;
      pos.push({ x: (W - rowW) / 2 + c * (cw + gap), y: (H - gridH) / 2 + r * (ch + gap) });
    }
    table.style.setProperty('--cw', cw + 'px'); table.style.setProperty('--ch', ch + 'px'); table.style.height = H + 'px';
    geo = { W, H, cw, ch, pos };
  }
  function labelCards() { state.pkOrder.forEach((id, i) => cards.get(id).setAttribute('aria-label', `Carta ${i + 1} de ${state.pkOrder.length}, boca abajo`)); }
  function placeNow() { labelCards(); measure(); state.pkOrder.forEach((id, i) => { const el = cards.get(id), p = geo.pos[i]; el.style.zIndex = i + 1; el.style.transform = T(p.x, p.y, rot[id]); }); }
  async function placeAnimated() {
    measure();
    await Promise.all(state.pkOrder.map((id, i) => { const el = cards.get(id), p = geo.pos[i]; el.style.zIndex = i + 1;
      return anim(el, [{ transform: el.style.transform }, { transform: T(p.x, p.y, rot[id]) }], { duration: D(520), delay: D(i * 22), easing: 'cubic-bezier(.3,.8,.3,1)' }); }));
  }
  placeNow(); lastW = geo.W;
  const ro = new ResizeObserver(() => { if (!busy && table.clientWidth !== lastW) { lastW = table.clientWidth; placeNow(); } });
  ro.observe(table); onCleanup(() => ro.disconnect());
  function lock(v) { busy = v; table.classList.toggle('busy', v); $('#pkShuffle').disabled = v; $('#pkRandom').disabled = v; setModeLock(v); }

  async function reorder() {
    if (busy) return; lock(true); Sound.swish();
    const old = new Map(state.pkOrder.map((id, i) => [id, geo.pos[i]]));
    state.pkOrder = shuffle(state.pkOrder); measure();
    await Promise.all(state.pkOrder.map((id, i) => {
      const el = cards.get(id), A = old.get(id), B = geo.pos[i];
      const mx = (A.x + B.x) / 2 + rand(-20, 20), my = Math.max(8, (A.y + B.y) / 2 - rand(40, 80));
      el.style.zIndex = 100 + i;
      return sleep(D(i * 30)).then(() => { Sound.tick(); return anim(el, [
        { transform: T(A.x, A.y, rot[id]) },
        { transform: T(mx, my, rand(-18, 18), 1.14), offset: 0.5 },
        { transform: T(B.x, B.y, rot[id]) }], { duration: D(700), easing: 'cubic-bezier(.45,.05,.3,1)' }); });
    }));
    state.pkOrder.forEach((id, i) => { cards.get(id).style.zIndex = i + 1; });
    labelCards(); announce('Cartas reordenadas.');
    lock(false);
  }

  async function riffle(stack, cx, cy) {
    const half = Math.ceil(stack.length / 2), L = stack.slice(0, half), Rr = stack.slice(half), off = geo.cw * 0.66;
    Sound.swish();
    await Promise.all(stack.map((id, i) => { const left = i < half, k = left ? i : i - half, el = cards.get(id);
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx + (left ? -off : off), cy - k * 0.7, left ? -10 : 10) }], { duration: D(260), easing: 'cubic-bezier(.3,.7,.3,1)' }); }));
    await sleep(D(80));
    const merged = []; let x = 0, y = 0;
    while (x < L.length || y < Rr.length) { const takeL = y >= Rr.length || (x < L.length && Math.random() < 0.5); merged.push(takeL ? L[x++] : Rr[y++]); }
    const step = Math.max(8, Math.min(24, 460 / merged.length));
    await Promise.all(merged.map((id, i) => sleep(D(i * step)).then(() => {
      const el = cards.get(id); el.style.zIndex = 10 + i; if (i % 2 === 0) Sound.tick();
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx + rand(-1.5, 1.5), cy - i * 0.7, rand(-1.5, 1.5)) }], { duration: D(160), easing: 'ease-in' });
    })));
    await sleep(D(120));
    return merged;
  }
  async function cut(stack, cx, cy) {
    const k = Math.max(1, Math.floor(stack.length * rand(0.35, 0.65))), bottom = stack.slice(0, k), top = stack.slice(k);
    if (!top.length) return stack;
    await Promise.all(top.map((id, i) => { const el = cards.get(id);
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx + geo.cw * 0.95, cy - geo.ch * 0.3 - i * 0.7, 8) }], { duration: D(280), easing: 'ease-out' }); }));
    const neu = top.concat(bottom);
    neu.forEach((id, i) => { cards.get(id).style.zIndex = 10 + i; });
    Sound.clack();
    await Promise.all(neu.map((id, i) => { const el = cards.get(id);
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx, cy - i * 0.7, 0) }], { duration: D(320), easing: 'cubic-bezier(.4,0,.2,1)' }); }));
    await sleep(D(100));
    return neu;
  }
  async function pickRandom() {
    if (busy) return; lock(true);
    const cx = geo.W / 2 - geo.cw / 2, cy = geo.H / 2 - geo.ch / 2 + geo.ch * 0.2;
    let stack = state.pkOrder.slice();
    Sound.swish();
    await Promise.all(stack.map((id, i) => { const el = cards.get(id); el.style.zIndex = 10 + i;
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx + rand(-4, 4), cy - i * 0.7, rand(-7, 7)) }], { duration: D(560), delay: D(i * 20), easing: 'cubic-bezier(.5,0,.2,1)' }); }));
    await sleep(D(160));
    await Promise.all(stack.map((id, i) => { const el = cards.get(id);
      return anim(el, [{ transform: el.style.transform }, { transform: T(cx, cy - i * 0.7, 0) }], { duration: D(180) }); }));
    if (stack.length > 1) {
      stack = await riffle(stack, cx, cy);
      stack = await cut(stack, cx, cy);
      stack = await riffle(stack, cx, cy);
      stack = await riffle(stack, cx, cy);
    }
    const chosen = stack[randInt(stack.length)], el = cards.get(chosen);
    el.style.zIndex = 500; Sound.swish();
    await anim(el, [{ transform: el.style.transform }, { transform: T(cx, cy - geo.ch * 0.85, 0, 1.08) }], { duration: D(420), easing: 'cubic-bezier(.2,.8,.2,1)' });
    await sleep(D(150));
    state.pkOrder = stack;
    reveal(chosen);
  }
  function reveal(id) {
    const el = cards.get(id), r = el.getBoundingClientRect();
    el.style.visibility = 'hidden';
    flyReveal({ left: r.left, top: r.top, width: r.width, height: r.height }, byId(id), {
      onBack: async () => { el.style.visibility = ''; await placeAnimated(); lock(false); }
    });
  }
  table.addEventListener('click', async e => {
    const el = e.target.closest('.pcard'); if (!el || busy) return;
    lock(true); const i = state.pkOrder.indexOf(el.dataset.id), p = geo.pos[i];
    el.style.zIndex = 500; Sound.blip();
    await anim(el, [{ transform: el.style.transform }, { transform: T(p.x, p.y - 18, 0, 1.12) }], { duration: D(200), easing: 'ease-out' });
    reveal(el.dataset.id);
  });
  $('#pkShuffle').addEventListener('click', reorder);
  $('#pkRandom').addEventListener('click', pickRandom);
}

/* =========================================================
   Screen 3 · Games menu
   ========================================================= */
const practiceBanner = () => `<div class="practice-banner" role="note">${ICONS.flask}<div><b>Modo práctica</b><span>Puedes probar los juegos sin afectar la ronda actual.</span></div></div>`;
let currentRules = null;
function gameHead(title, rules) {
  currentRules = rules || null;
  const s = state.current;
  return `<div class="ghead"><div class="back"><button class="btn ghost sm" id="changeGame" type="button">Cambiar juego</button></div><h2>${title}</h2>
    <div class="right">${s ? `<div class="cur-mini">${avatar(s, 34)}<span class="nm">${esc(s.name)}</span></div>` : ''}${rules ? `<button class="btn ghost sm rules-btn" id="rulesBtn" type="button" aria-haspopup="dialog">${ICONS.book} Reglas</button>` : ''}</div></div>${s ? '' : practiceBanner()}`;
}
// "Cambiar juego" is only offered until the game is actually played in a real turn.
function markPlayed() { const b = $('#changeGame'); if (b && state.current) b.hidden = true; }
function bindBack(onRules) {
  $('#changeGame').addEventListener('click', () => go('games'));
  const rb = $('#rulesBtn'); if (rb) rb.addEventListener('click', () => openRules(onRules));
}
function openRules(after) {
  const r = currentRules; if (!r) return;
  openOverlay(`<div class="rules-dialog" role="dialog" aria-modal="true" aria-labelledby="rulesTitle">
      <button class="close-x" id="rulesClose" type="button" aria-label="Cerrar reglas">✕</button>
      <h2 id="rulesTitle">${r.title}</h2>${r.body}
      <div class="actions"><button class="btn lg" id="rulesOk" type="button">Entendido</button></div></div>`, { onEsc: () => closeOverlay() });
  $('#rulesClose').addEventListener('click', () => closeOverlay());
  $('#rulesOk').addEventListener('click', () => closeOverlay());
  if (after) after();
  setTimeout(() => { try { $('#rulesOk').focus({ preventScroll: true }); } catch (e) {} }, 60);
}
const li = (color, html) => `<li><span class="dot" style="background:${color}"></span><span>${html}</span></li>`;
const RULES = {
  roulette: { title: 'Reglas · Ruleta', body: `<ul class="rules">
    ${li('#2f5bea', 'Elige tus apuestas a la derecha de la rueda: <b>color</b>, <b>par o impar</b>, o <b>mitad</b> (1–18 / 19–36). Luego pulsa Girar.')}
    ${li('#169c55', '<b>Apuesta sencilla</b> (1 ficha) acertada: te salvas y sigues en la ruleta.')}
    ${li('#f5b400', '<b>Apuesta doble</b> (2 fichas de tipos distintos, por ejemplo rojo + impar) acertada: te salvas y sales de la ruleta.')}
    ${li('#0a8f4c', '<b>Sale el 0:</b> tiras otra vez con la misma apuesta.')}
    ${li('#e22840', '<b>Fallas:</b> te toca responder y sales de la ruleta.')}</ul>` },
  slots: { title: 'Reglas · Tragamonedas', body: `<ul class="rules">
    ${li('#f5b400', 'Arrastra la palanca hacia abajo, o haz clic en ella.')}
    ${li('#169c55', '<b>Tres iguales</b> en la línea roja, del símbolo que sea: te salvas y sigues en la ruleta.')}
    ${li('#e22840', '<b>Cualquier otra combinación:</b> te toca responder y sales de la ruleta.')}</ul>
    <div class="setting"><label for="jpOdds">Probabilidad de jackpot</label>
      <select id="jpOdds"><option value="0.02">Real · 2%</option><option value="0.1">Baja · 10%</option><option value="0.25">Media · 25%</option><option value="0.4">Alta · 40%</option></select>
      <small>Ajuste del profesor. Con 7 símbolos al azar, una máquina real da jackpot 1 de cada 49 veces.</small></div>` },
  hilo: { title: 'Reglas · Mayor o menor', body: `<ul class="rules">
    ${li('#2f5bea', 'Se usa un mazo de 52 cartas. El 2 es la carta más baja y el <b>As la más alta</b> (2, 3 … 10, J, Q, K, A).')}
    ${li('#f5b400', 'Mira la carta y elige si la siguiente será <b>mayor</b> o <b>menor</b>.')}
    ${li('#5e4b74', 'Si sale una carta del mismo valor, no cuenta: adivinas otra vez.')}
    ${li('#169c55', '<b>Tres aciertos seguidos:</b> te salvas y sigues en la ruleta.')}
    ${li('#e22840', '<b>Un fallo:</b> te toca responder y sales de la ruleta.')}</ul>` },
  blackjack: { title: 'Reglas · Blackjack', body: `<ul class="rules">
    ${li('#2f5bea', '<b>Objetivo:</b> sumar más que la banca <b>sin pasarte de 21</b>. El objetivo siempre es 21.')}
    ${li('#2f5bea', '<b>Valores:</b> del 2 al 10 valen su número; J, Q y K valen 10; el <b>As vale 1 u 11</b>, lo que más te convenga. Por eso a veces verás dos totales, como «5 o 15» (As + 4): cuenta como 15, y si con la siguiente carta te pasarías, el As pasa a valer 1.')}
    ${li('#f5b400', '<b>Blackjack:</b> un As y una carta que vale 10 como tus dos primeras cartas. Le gana a cualquier otro 21.')}
    ${li('#f5b400', '<b>Pedir:</b> recibes otra carta. <b>Plantarse:</b> te quedas con lo que tienes.')}
    ${li('#8b3fd9', '<b>Dividir:</b> si tus dos primeras cartas valen lo mismo, las separas en dos manos (hasta 4). Los Ases divididos reciben una sola carta cada uno, y un 21 después de dividir no cuenta como blackjack.')}
    ${li('#8b3fd9', '<b>La banca:</b> si muestra un As o una carta de 10, revisa si tiene blackjack antes de que juegues. Luego pide carta mientras tenga 16 o menos y se planta al llegar a 17 o más, aunque ese 17 lleve un As (por ejemplo, As + 6).')}
    ${li('#8b3fd9', 'Se juega con 6 mazos. Cuando quedan pocas cartas se barajan de nuevo.')}
    ${li('#169c55', '<b>Ganas la mano:</b> te salvas y sigues en la ruleta. Si dividiste, ganas si ganaste más manos de las que perdiste.')}
    ${li('#e22840', '<b>Pierdes la mano:</b> te toca responder y sales de la ruleta.')}
    ${li('#5e4b74', '<b>Empate:</b> se reparte otra mano.')}</ul>` },
  reaction: { title: 'Reglas · Reacción', body: `<ul class="rules">
    ${li('#f5b400', 'El cohete despega y la ronda dura como máximo 20 segundos.')}
    ${li('#169c55', 'En algún momento <b>todo el cielo se pone verde</b> y aparece la tecla ESPACIO durante solo <b>0.28 segundos</b>. Pulsa espacio (o toca la pantalla) en ese instante: te salvas y sigues en la ruleta.')}
    ${li('#e22840', 'Si pulsas antes o tarde, el cohete choca: te toca responder y sales de la ruleta.')}</ul>` }
};

/* Game card illustrations: one SVG per game that always scales to fill its band */
function gameArt(kind) {
  const cx = 160, cy = 90, id = 'ga-' + kind;
  const svg = inner => `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style="font-family:'Bungee',Impact,sans-serif">
    <defs><filter id="${id}-sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".35"/></filter>
    <radialGradient id="${id}-gold" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#f5b400"/><stop offset="1" stop-color="#b37f00"/></radialGradient></defs>${inner}</svg>`;
  const card = (x, y, w, r, s, red, rot = 0) => {
    const h = w * 1.4, col = red ? '#c8102e' : '#1b1b22';
    return `<g transform="translate(${x},${y}) rotate(${rot})" filter="url(#${id}-sh)">
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.1}" fill="#fffdf7"/>
      <text x="${-w / 2 + w * 0.1}" y="${-h / 2 + w * 0.27}" font-size="${w * 0.22}" fill="${col}">${r}</text>
      <text x="${-w / 2 + w * 0.1}" y="${-h / 2 + w * 0.5}" font-size="${w * 0.2}" fill="${col}">${s}</text>
      <text x="0" y="${w * 0.2}" font-size="${w * 0.55}" fill="${col}" text-anchor="middle">${s}</text></g>`;
  };
  const back = (x, y, w) => {
    const h = w * 1.4;
    return `<g transform="translate(${x},${y})" filter="url(#${id}-sh)">
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.1}" fill="#b8162e" stroke="#fff" stroke-width="3"/>
      <rect x="${-w / 2 + 6}" y="${-h / 2 + 6}" width="${w - 12}" height="${h - 12}" rx="${w * 0.07}" fill="none" stroke="#f5b400" stroke-width="2"/>
      <circle r="${w * 0.25}" fill="#7d0c1d" stroke="#f5b400" stroke-width="2"/>
      <text y="${w * 0.12}" font-size="${w * 0.32}" fill="#fff4c7" text-anchor="middle">?</text></g>`;
  };
  if (kind === 'roulette') {
    let wedges = '';
    const r = 56, pt = a => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
    for (let i = 0; i < 18; i++) {
      const [x0, y0] = pt(i * 20), [x1, y1] = pt(i * 20 + 20);
      wedges += `<path d="M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0,1 ${x1.toFixed(2)},${y1.toFixed(2)} Z" fill="${i % 2 ? '#1b1b22' : '#c8102e'}"/>`;
    }
    return svg(`<g filter="url(#${id}-sh)"><circle cx="${cx}" cy="${cy}" r="74" fill="#6b3b16"/><circle cx="${cx}" cy="${cy}" r="66" fill="#c08236"/></g>
      <g class="art-spin">${wedges}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e8c468" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="22" fill="url(#${id}-gold)"/><circle cx="${cx}" cy="${cy}" r="7" fill="#fff4c7"/></g>`);
  }
  if (kind === 'slots') {
    let reels = '';
    for (let i = 0; i < 3; i++) {
      const x = 86 + i * 52;
      reels += `<rect x="${x}" y="56" width="44" height="68" rx="6" fill="#fffdf7"/><text x="${x + 22}" y="106" font-size="48" fill="#c8102e" text-anchor="middle">7</text>`;
    }
    return svg(`<g filter="url(#${id}-sh)"><rect x="74" y="44" width="172" height="92" rx="16" fill="#1a0f26" stroke="#f5b400" stroke-width="6"/></g>${reels}
      <rect x="80" y="88" width="160" height="3" fill="rgba(226,40,64,.85)"/>`);
  }
  if (kind === 'reaction') {
    return svg(`<ellipse cx="${cx}" cy="${cy}" rx="120" ry="50" fill="rgba(62,224,138,.22)"/>
      <rect x="78" y="68" width="164" height="54" rx="14" fill="#0a5a30"/>
      <rect x="78" y="60" width="164" height="54" rx="14" fill="#2fce78"/>
      <text x="${cx}" y="96" font-size="22" fill="#fff" text-anchor="middle" letter-spacing="2">ESPACIO</text>`);
  }
  if (kind === 'hilo') {
    return svg(`${card(100, 90, 64, '7', '♥', true)}
      <text x="${cx}" y="84" font-size="26" fill="#ffd35c" text-anchor="middle">▲</text>
      <text x="${cx}" y="116" font-size="26" fill="#ffd35c" text-anchor="middle">▼</text>
      ${back(220, 90, 64)}`);
  }
  return svg(`${card(128, 94, 66, 'A', '♠', false, -10)}${card(168, 88, 66, 'K', '♥', true, 9)}
    <text x="248" y="108" font-size="46" fill="#ffd35c" text-anchor="middle" stroke="rgba(0,0,0,.25)" stroke-width="1">21</text>`);
}

function renderGames() {
  const s = state.current;
  stage.innerHTML = `
    <div class="screen-head"><div class="eyebrow">Paso 3 · Juego</div><h2>Elige el juego</h2>
      ${s ? '<p>El profesor escoge el reto de este turno</p>' : ''}</div>
    ${s ? `<div class="cur">${avatar(s, 40)}<span>Turno de <b>${esc(s.name)}</b></span></div>` : practiceBanner()}
    <div class="games-grid">
      <button class="gcard" type="button" data-game="game-roulette"><div class="art r">${gameArt('roulette')}</div>
        <div class="body"><h3>Ruleta</h3><p>Apuesta a color, par o impar, o a una mitad de la mesa. Si sale 0, tiras otra vez.</p>
        <div class="rule"><span class="tag in">Sencilla: te salvas y sigues</span><span class="tag gold">Doble: te salvas y sales</span></div></div></button>
      <button class="gcard" type="button" data-game="game-slots"><div class="art s">${gameArt('slots')}</div>
        <div class="body"><h3>Tragamonedas</h3><p>Jala la palanca y alinea tres símbolos iguales en la línea roja.</p>
        <div class="rule"><span class="tag in">Jackpot: te salvas y sigues</span></div></div></button>
      <button class="gcard" type="button" data-game="game-reaction"><div class="art x">${gameArt('reaction')}</div>
        <div class="body"><h3>Reacción</h3><p>Pulsa espacio justo cuando aparezca la tecla verde. Ni antes ni después.</p>
        <div class="rule"><span class="tag in">A tiempo: te salvas y sigues</span></div></div></button>
      <button class="gcard" type="button" data-game="game-hilo"><div class="art h">${gameArt('hilo')}</div>
        <div class="body"><h3>Mayor o menor</h3><p>Adivina si la siguiente carta será mayor o menor. Necesitas tres aciertos seguidos.</p>
        <div class="rule"><span class="tag in">3 seguidas: te salvas y sigues</span></div></div></button>
      <button class="gcard" type="button" data-game="game-blackjack"><div class="art b">${gameArt('blackjack')}</div>
        <div class="body"><h3>Blackjack</h3><p>Llega a 21 sin pasarte y gánale a la banca. Puedes pedir, plantarte y dividir.</p>
        <div class="rule"><span class="tag in">Ganas: te salvas y sigues</span><span class="tag gold">Empate: otra mano</span></div></div></button>
    </div>
    <p class="muted small center-text" style="margin:16px 0 0">En todos los juegos, si pierdes te toca responder y sales de la ruleta.</p>
    <div class="cta-row"><button class="btn ghost" id="backSel" type="button">↩ Volver a la ruleta</button></div>`;
  $$('.gcard').forEach(c => c.addEventListener('click', () => go(c.dataset.game)));
  $('#backSel').addEventListener('click', () => go('select'));
}

/* =========================================================
   Game · European roulette
   ========================================================= */
const RL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RL_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BET_LABEL = { red: 'ROJO', black: 'NEGRO', even: 'PAR', odd: 'IMPAR', low: '1–18', high: '19–36' };
const BET_CAT = { red: 'c', black: 'c', even: 'p', odd: 'p', low: 'h', high: 'h' };
const COLOR_NAME = { red: 'rojo', black: 'negro', green: 'verde' };
const numColor = n => (n === 0 ? 'green' : RL_RED.has(n) ? 'red' : 'black');
function betHits(b, n) {
  if (n === 0) return false;
  switch (b) { case 'red': return RL_RED.has(n); case 'black': return !RL_RED.has(n); case 'even': return n % 2 === 0;
    case 'odd': return n % 2 === 1; case 'low': return n <= 18; case 'high': return n >= 19; }
  return false;
}
function rouletteSVG() {
  const rl = state.rl, a = 360 / 37;
  const pt = (ang, r) => { const t = ang * Math.PI / 180; return [r * Math.sin(t), -r * Math.cos(t)]; };
  const sector = (a0, a1, r0, r1) => { const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r1},${r1} 0 0,1 ${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${r0},${r0} 0 0,0 ${x3.toFixed(2)},${y3.toFixed(2)} Z`; };
  let ring = '', frets = '';
  RL_ORDER.forEach((num, k) => {
    const c = k * a, a0 = c - a / 2, a1 = c + a / 2, col = numColor(num);
    const fill = { green: '#0a8f4c', red: '#c8102e', black: '#1b1b22' }[col], deep = { green: '#06663a', red: '#8a0b1f', black: '#0a0a0e' }[col];
    ring += `<path d="${sector(a0, a1, 130, 164)}" fill="${fill}"/><path d="${sector(a0, a1, 106, 130)}" fill="${deep}"/>` +
            `<text transform="rotate(${c.toFixed(2)}) translate(0,-147)" text-anchor="middle" dominant-baseline="central" font-size="13" fill="#fff">${num}</text>`;
    const [fx0, fy0] = pt(a0, 106), [fx1, fy1] = pt(a0, 164);
    frets += `<line x1="${fx0.toFixed(2)}" y1="${fy0.toFixed(2)}" x2="${fx1.toFixed(2)}" y2="${fy1.toFixed(2)}" stroke="#e8c468" stroke-width="1.3"/>`;
  });
  let diamonds = ''; for (let i = 0; i < 8; i++) diamonds += `<rect x="-5" y="-5" width="10" height="10" fill="#d4af37" stroke="#8a6414" transform="rotate(${i * 45 + 22.5}) translate(0,-184) rotate(45)"/>`;
  let arms = ''; for (let i = 0; i < 4; i++) arms += `<g transform="rotate(${i * 90})"><rect x="-3.5" y="-80" width="7" height="54" rx="3.5" fill="url(#rlGold)"/><circle cy="-82" r="7" fill="url(#rlGold)"/></g>`;
  return `<svg class="rl-svg" viewBox="-216 -216 432 432" role="img" aria-label="Ruleta europea de 37 casillas">
    <defs>
      <radialGradient id="rlWood" r=".5"><stop offset=".86" stop-color="#8a5a2b"/><stop offset=".94" stop-color="#6b3f1a"/><stop offset="1" stop-color="#3f230c"/></radialGradient>
      <radialGradient id="rlTrack" r=".5"><stop offset=".78" stop-color="#b9a27a"/><stop offset=".9" stop-color="#efe3cc"/><stop offset="1" stop-color="#c9b48d"/></radialGradient>
      <radialGradient id="rlCone" r=".5"><stop offset="0" stop-color="#b87a3f"/><stop offset=".7" stop-color="#7a4a22"/><stop offset="1" stop-color="#4a2a10"/></radialGradient>
      <linearGradient id="rlGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#e0a800"/><stop offset="1" stop-color="#8a6414"/></linearGradient>
      <radialGradient id="rlBallG" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c3c3cf"/></radialGradient>
    </defs>
    <circle r="214" fill="url(#rlWood)"/>
    <circle r="200" fill="url(#rlTrack)"/>
    ${diamonds}
    <circle r="167" fill="#2b1808"/>
    <g id="rlWheel" transform="rotate(${rl.W.toFixed(2)})">${ring}${frets}
      <circle r="164" fill="none" stroke="#e8c468" stroke-width="2.5"/><circle r="130" fill="none" stroke="#e8c468" stroke-width="1.5"/>
      <circle r="106" fill="url(#rlCone)" stroke="#e8c468" stroke-width="2.5"/>
      ${arms}
      <circle r="24" fill="url(#rlGold)" stroke="#8a6414" stroke-width="2"/><circle r="8" fill="#fff4c7"/>
    </g>
    <g id="rlBall" transform="rotate(${rl.B.toFixed(2)}) translate(0,${(-rl.rb).toFixed(2)})"><circle r="7.5" fill="url(#rlBallG)" stroke="rgba(0,0,0,.3)" stroke-width="1"/></g>
  </svg>`;
}
function boardHTML() {
  let h = '<div class="board" id="board" aria-label="Tablero de números"><div class="c num green" data-n="0" style="grid-column:1;grid-row:1 / span 3">0</div>';
  for (let n = 1; n <= 36; n++) h += `<div class="c num ${numColor(n)}" data-n="${n}" style="grid-column:${Math.ceil(n / 3) + 1};grid-row:${3 - ((n - 1) % 3)}">${n}</div>`;
  return h + '</div>';
}
const bpBtn = k => `<button class="bp k-${k}" type="button" data-bet="${k}" aria-pressed="false">${BET_LABEL[k]}</button>`;
function renderRoulette() {
  if (!state.rl) state.rl = { W: 0, B: 0, rb: 118, bets: [], recent: [], last: null };
  const rl = state.rl; rl.spinning = false;
  stage.innerHTML = gameHead('Ruleta de casino', RULES.roulette) + `
    <div class="rl-layout">
      <div class="rl-wheel-wrap">${rouletteSVG()}
        <div class="rl-status" id="rlStatus" aria-live="polite">Hagan sus apuestas</div>
        <button class="btn lg red" id="rlSpin" type="button">${ICONS.wheel} Girar</button></div>
      <div class="rl-info">
        <div class="result-tile" id="rlResult"></div>
        <div class="zero-banner" id="zeroBanner" hidden>¡Cayó en 0! Tira otra vez: tu apuesta sigue en la mesa.</div>
        <div class="bet-panel" id="betPanel" role="group" aria-label="Apuestas">
          <div class="bet-group"><div class="gl">Color</div><div class="pair">${bpBtn('red')}${bpBtn('black')}</div></div>
          <div class="bet-group"><div class="gl">Par o impar</div><div class="pair">${bpBtn('even')}${bpBtn('odd')}</div></div>
          <div class="bet-group"><div class="gl">Mitad</div><div class="pair">${bpBtn('low')}${bpBtn('high')}</div></div>
        </div>
        <div class="bet-summary" id="betSummary"></div>
      </div>
    </div>
    <div class="board-wrap">${boardHTML()}</div>`;
  bindBack();
  let raf = 0; onCleanup(() => cancelAnimationFrame(raf));
  const board = $('#board'), panel = $('#betPanel');

  function drawResult() {
    const el = $('#rlResult'), n = rl.last;
    if (n == null) { el.innerHTML = '<div class="num-ball none">?</div><div><div class="lbl">Sin tirar</div><div class="props">Aquí aparecerá el número ganador</div></div>'; return; }
    const c = numColor(n);
    el.innerHTML = `<div class="num-ball ${c}">${n}</div><div style="min-width:0"><div class="lbl">${n === 0 ? 'Cero' : COLOR_NAME[c]}</div>
      <div class="props">${n === 0 ? 'Ni par ni impar' : `${n % 2 ? 'Impar' : 'Par'} · ${n <= 18 ? '1–18' : '19–36'}`}</div>
      ${rl.recent.length > 1 ? `<div class="recent" aria-label="Números anteriores">${rl.recent.slice(1, 10).map(x => `<span style="background:${x === 0 ? '#0a8f4c' : RL_RED.has(x) ? '#c8102e' : '#1b1b22'}">${x}</span>`).join('')}</div>` : ''}</div>`;
  }
  function drawBets() {
    $$('.bp', panel).forEach(b => {
      const i = rl.bets.indexOf(b.dataset.bet); b.setAttribute('aria-pressed', i >= 0 ? 'true' : 'false');
      let chip = b.querySelector('.chip');
      if (i >= 0) { if (!chip) { chip = document.createElement('span'); b.appendChild(chip); } chip.className = 'chip c' + (i + 1); }
      else if (chip) chip.remove();
    });
    board.classList.toggle('has-bets', rl.bets.length > 0);
    $$('.num', board).forEach(c => { const n = +c.dataset.n; c.classList.toggle('covered', rl.bets.length > 0 && rl.bets.every(b => betHits(b, n))); });
    const b = rl.bets, sum = $('#betSummary');
    if (!b.length) sum.innerHTML = '<div class="kind">Haz tu apuesta</div><p>Elige una opción (apuesta sencilla) o dos de grupos distintos (apuesta doble).</p>';
    else { const dbl = b.length === 2;
      sum.innerHTML = `<div class="kind">${dbl ? 'Apuesta doble' : 'Apuesta sencilla'}</div>
        <div class="picks">${b.map(k => `<span class="pick k-${k}">${BET_LABEL[k]}</span>`).join(dbl ? '<span class="plus">+</span>' : '')}</div>
        <p>${dbl ? 'Si aciertas las dos: <b>te salvas y sales de la ruleta</b>.' : 'Si aciertas: <b>te salvas y sigues en la ruleta</b>. Añade otra ficha para hacerla doble.'}</p>`; }
    $('#rlSpin').disabled = rl.spinning || !b.length;
  }
  function clearMarks() { $$('.hit', board).forEach(c => c.classList.remove('hit')); $$('.bp', panel).forEach(c => c.classList.remove('ok', 'bad')); }

  panel.addEventListener('click', e => {
    const b = e.target.closest('.bp'); if (!b || rl.spinning) return;
    const k = b.dataset.bet, i = rl.bets.indexOf(k);
    clearMarks(); $('#zeroBanner').hidden = true;
    if (i >= 0) rl.bets.splice(i, 1);
    else { rl.bets = rl.bets.filter(x => BET_CAT[x] !== BET_CAT[k]); if (rl.bets.length >= 2) rl.bets.shift(); rl.bets.push(k); Sound.clack(); }
    drawBets();
  });

  async function spin() {
    if (rl.spinning || !rl.bets.length) return;
    markPlayed();
    rl.spinning = true; drawBets(); clearMarks();
    $$('.bp', panel).forEach(b => { b.disabled = true; });
    $('#zeroBanner').hidden = true; $('#rlStatus').textContent = 'No va más…';
    const a = 360 / 37, k = randInt(37), num = RL_ORDER[k];
    const dur = REDUCED ? 1600 : 8600 + rand(0, 1000);
    const W0 = rl.W, Wend = W0 + 360 * 2 + rand(0, 360);
    const rel0 = rl.B - W0, tgt = k * a;
    const relEnd = tgt + 360 * Math.floor((rel0 - 360 * 6 - tgt) / 360);
    const r0 = rl.rb, t0 = performance.now(), wheel = $('#rlWheel'), ball = $('#rlBall');
    const bounces = [1 / 2.75, 2 / 2.75, 2.5 / 2.75]; let bi = 0, lastFret = null;
    Sound.clack();
    await new Promise(res => {
      const frame = now => {
        const t = Math.min(1, (now - t0) / dur);
        const W = W0 + (Wend - W0) * Ease.outCubic(t);
        const rel = rel0 + (relEnd - rel0) * Ease.outQuad(Math.min(1, t / 0.8));
        let rb;
        if (t < 0.05) rb = r0 + (182 - r0) * (t / 0.05);
        else if (t < 0.47) rb = 182;
        else if (t < 0.8) { const p = (t - 0.47) / 0.33; rb = 182 - (182 - 118) * Ease.outBounce(p); if (bi < bounces.length && p >= bounces[bi]) { bi++; Sound.clack(); } }
        else rb = 118;
        if (rb < 136) { const f = Math.floor(((((rel % 360) + 360) % 360) + a / 2) / a); if (lastFret !== null && f !== lastFret) Sound.tick(); lastFret = f; }
        rl.W = W; rl.B = W + rel; rl.rb = rb;
        wheel.setAttribute('transform', `rotate(${W.toFixed(2)})`);
        ball.setAttribute('transform', `rotate(${rl.B.toFixed(2)}) translate(0,${(-rb).toFixed(2)})`);
        if (t < 1) raf = requestAnimationFrame(frame); else res();
      };
      raf = requestAnimationFrame(frame);
    });
    const relN = (((rl.B - rl.W) % 360) + 360) % 360; rl.W = ((rl.W % 360) + 360) % 360; rl.B = rl.W + relN;
    rl.spinning = false; rl.last = num; rl.recent.unshift(num); rl.recent = rl.recent.slice(0, 12);
    drawResult(); drawBets();
    $$('.bp', panel).forEach(b => { b.disabled = false; });
    $(`.num[data-n="${num}"]`, board).classList.add('hit');
    const col = numColor(num);
    announce(num === 0 ? 'Salió el cero. Tira otra vez.' : `Salió el ${num}, ${COLOR_NAME[col]}.`);
    if (num === 0) { $('#rlStatus').textContent = '¡Cero! Tira otra vez'; $('#zeroBanner').hidden = false; Sound.ding(); return; }
    const results = rl.bets.map(b => ({ b, ok: betHits(b, num) }));
    results.forEach(r => $(`.bp[data-bet="${r.b}"]`, panel).classList.add(r.ok ? 'ok' : 'bad'));
    const win = results.every(r => r.ok), dbl = rl.bets.length === 2;
    $('#rlStatus').textContent = `${num} ${COLOR_NAME[col]}`;
    $('#rlSpin').disabled = true;
    await sleep(D(1500));
    if (state.screen !== 'game-roulette') return;
    $('#rlSpin').disabled = false;
    showOutcome({ win, game: 'Ruleta', detail: `Salió <b>${num} ${COLOR_NAME[col]}</b> · Apostaste ${rl.bets.map(x => BET_LABEL[x]).join(' + ')}`,
      removed: win ? dbl : true, verdict: win ? (dbl ? V.saveOut : V.saveStay) : V.lose, retry: () => { clearMarks(); spin(); } });
  }
  $('#rlSpin').addEventListener('click', spin);
  drawResult(); drawBets();
}

/* =========================================================
   Game · Slot machine with lever
   ========================================================= */
const SYMS = ['cherry', 'lemon', 'bell', 'star', 'gem', 'seven', 'bar'];
const SYM_HTML = { cherry: '🍒', lemon: '🍋', bell: '🔔', star: '⭐', gem: '💎', seven: '<span class="seven">7</span>', bar: '<span class="bar">BAR</span>' };
const SYM_NAME = { cherry: 'cerezas', lemon: 'limones', bell: 'campanas', star: 'estrellas', gem: 'diamantes', seven: 'sietes', bar: 'BAR' };
const SYM_SHORT = { cherry: '🍒', lemon: '🍋', bell: '🔔', star: '⭐', gem: '💎', seven: '7', bar: 'BAR' };
const randSym = () => SYMS[randInt(SYMS.length)];
const symRow = arr => arr.map(s => `<div class="sym">${SYM_HTML[s]}</div>`).join('');

function renderSlots() {
  if (!state.slots) state.slots = { reels: [0, 1, 2].map(() => [randSym(), randSym(), randSym()]) };
  const sl = state.slots; sl.spinning = false;
  stage.innerHTML = gameHead('Tragamonedas', RULES.slots) + `
    <div class="game-stage">
      <div class="slot-wrap">
        <div class="machine" id="machine">
          <div class="m-top"><div class="m-sign">JACKPOT</div><div class="m-dots">${'<i></i>'.repeat(14)}</div></div>
          <div class="m-window">${[0, 1, 2].map(i => `<div class="reel"><div class="strip" id="strip${i}">${symRow(sl.reels[i])}</div></div>`).join('')}<div class="payline"></div><div class="m-glass"></div></div>
          <div class="m-lcd" id="lcd" aria-live="polite">JALA LA PALANCA</div>
          <div class="m-tray"></div>
        </div>
        <div class="lever" id="lever" role="button" tabindex="0" aria-label="Jalar la palanca">
          <div class="lever-housing"></div><div class="lever-rod" id="rod"></div><div class="lever-ball" id="lball"></div><div class="lever-hint">JALA ↓</div>
        </div>
      </div>
    </div>`;
  bindBack(() => {
    const oddsSel = $('#jpOdds');
    oddsSel.value = String(state.jpOdds); if (!oddsSel.value) oddsSel.value = '0.25';
    oddsSel.addEventListener('change', () => { state.jpOdds = parseFloat(oddsSel.value); store.set('jpOdds', state.jpOdds); });
  });
  let alive = true; onCleanup(() => { alive = false; });

  function spinReel(i, target, dur, sh) {
    const strip = $('#strip' + i), cur = sl.reels[i];
    const above = randSym(), below = randSym();
    const seq = [above, target, below, ...Array.from({ length: 16 + i * 6 }, randSym), ...cur];
    strip.innerHTML = symRow(seq);
    const dist = (seq.length - 3) * sh;
    strip.style.transform = `translateY(${-dist}px)`;
    strip.classList.add('blur');
    const a = strip.animate([
      { transform: `translateY(${-dist}px)`, easing: 'cubic-bezier(.2,.6,.3,1)' },
      { transform: `translateY(${(sh * 0.28).toFixed(1)}px)`, offset: 0.9, easing: 'ease-in-out' },
      { transform: 'translateY(0px)' }], { duration: dur, fill: 'forwards' });
    setTimeout(() => strip.classList.remove('blur'), dur * 0.6);
    return a.finished.then(() => {
      a.cancel(); strip.style.transform = 'translateY(0px)'; Sound.thunk();
      sl.reels[i] = [above, target, below]; strip.innerHTML = symRow(sl.reels[i]);
    }).catch(() => {});
  }
  async function spinSlots() {
    if (!sl.spinning) markPlayed();
    if (sl.spinning) return; sl.spinning = true;
    const machine = $('#machine'); machine.classList.remove('party', 'won'); $('#lcd').textContent = 'GIRANDO…';
    const win = Math.random() < state.jpOdds;
    let finals;
    if (win) { const s = randSym(); finals = [s, s, s]; }
    else { do { finals = [randSym(), randSym(), randSym()]; if (Math.random() < 0.35) finals[1] = finals[0]; } while (finals[0] === finals[1] && finals[1] === finals[2]); }
    const sh = $('.sym', machine).offsetHeight || 78;
    await Promise.all([1800, 2500, 3200].map((d, i) => spinReel(i, finals[i], D(d), sh)));
    if (!alive) return;
    if (win) { $('#lcd').textContent = `¡JACKPOT! TRES ${SYM_NAME[finals[0]].toUpperCase()}`; machine.classList.add('party', 'won'); Sound.ding(); }
    else $('#lcd').textContent = 'SIN PREMIO';
    await sleep(D(1100));
    if (!alive) return;
    sl.spinning = false;
    showOutcome({ win, game: 'Tragamonedas', detail: win ? `Tres ${SYM_NAME[finals[0]]} en la línea` : `Resultado: ${finals.map(s => SYM_SHORT[s]).join(' · ')}`,
      removed: !win, verdict: win ? V.saveStay : V.lose, retry: () => autoPull() });
  }

  /* lever */
  const lever = $('#lever'), rod = $('#rod'), lball = $('#lball');
  const H = 360, P = H / 2, L = 132; let s = 1, dragging = false, y0 = 0, moved = false, busy = false;
  function draw() {
    const by = P - L * s, top = Math.min(P, by), bot = Math.max(P, by);
    rod.style.top = top + 'px'; rod.style.height = Math.max(0, bot - top) + 'px';
    lball.style.top = by + 'px'; lball.style.transform = `scale(${(1 + (1 - Math.abs(s)) * 0.22).toFixed(3)})`;
  }
  function tween(to, d, ease) {
    return new Promise(res => { const s0 = s, t0 = performance.now();
      (function f(now) { const t = Math.min(1, (now - t0) / Math.max(1, d)); s = s0 + (to - s0) * ease(t); draw(); if (t < 1 && alive) requestAnimationFrame(f); else res(); })(t0); });
  }
  const canPull = () => !busy && !sl.spinning && overlay.hidden;
  async function autoPull() { if (!canPull()) return; busy = true; Sound.lever(); await tween(-0.85, D(260), Ease.inOutQuad); spinSlots(); await tween(1, D(700), Ease.outBack); busy = false; }
  async function release(fire) { busy = true; if (fire) { Sound.lever(); spinSlots(); } await tween(1, D(700), Ease.outBack); busy = false; }
  lball.addEventListener('pointerdown', e => { if (!canPull()) return; dragging = true; moved = false; y0 = e.clientY; try { lball.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
  lball.addEventListener('pointermove', e => { if (!dragging) return; const dy = e.clientY - y0; if (Math.abs(dy) > 4) moved = true; s = Math.max(-0.85, Math.min(1, 1 - dy / L)); draw(); });
  lball.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; if (!moved) { autoPull(); return; } release(s < 0.1); });
  lball.addEventListener('pointercancel', () => { if (dragging) { dragging = false; release(false); } });
  rod.addEventListener('click', autoPull);
  lever.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autoPull(); } });
  draw();
}

/* =========================================================
   Game · Reaction (crash-style rocket)
   ========================================================= */
function renderReaction() {
  stage.innerHTML = gameHead('Reacción', RULES.reaction) + `
    <div class="game-stage">
      <div class="rx-wrap">
        <div class="sky" id="sky" tabindex="-1" aria-label="Zona de juego: pulsa espacio o toca aquí cuando aparezca la tecla verde"><canvas id="rxc"></canvas>
          <div class="hud"><span id="rxTime">0.0 s</span><span class="st" id="rxState">LISTO</span></div>
          <div class="keycap-big" id="rxKey" hidden>ESPACIO</div>
          <div class="msg" id="rxMsg">Pulsa «Empezar ronda» y espera la tecla verde</div>
        </div>
        <div class="row center" style="margin-top:18px"><button class="btn lg green" id="rxStart" type="button">Empezar ronda</button></div>
      </div>
    </div>`;
  bindBack();
  const sky = $('#sky'), cv = $('#rxc'), ctx = cv.getContext('2d'), keyEl = $('#rxKey'), msgEl = $('#rxMsg'),
        timeEl = $('#rxTime'), stEl = $('#rxState'), startBtn = $('#rxStart');
  const WINDOW = 280, ROUND = 20000; // the whole valid window: 0.28 s, no extra grace
  let W = 0, H = 0, raf = 0, outTimer = null;
  function size() { const dpr = window.devicePixelRatio || 1, r = sky.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  const ro = new ResizeObserver(size); ro.observe(sky);
  const stars = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random() * 0.85, r: rand(0.5, 1.7), p: rand(0, 6.28) }));
  let g = { phase: 'idle', t: 0 };
  const curve = t => { const u = Math.min(1, t / 20); return [36 + u * (W - 96), H - 40 - (H - 110) * Math.pow(u, 1.6)]; };
  const setMsg = m => { msgEl.textContent = m; msgEl.hidden = !m; };

  function rocket(x, y, ang, flame) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1.4, 1.4);
    if (flame) { const fl = 14 + Math.random() * 10, gr = ctx.createLinearGradient(-12, 0, -14 - fl, 0);
      gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.4, '#ffb020'); gr.addColorStop(1, 'rgba(255,60,40,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(-14 - fl, 0); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#e22840';
    ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(-18, -14); ctx.lineTo(-3, -7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-18, 14); ctx.lineTo(-3, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4f4fa'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.quadraticCurveTo(10, -9, -12, -7); ctx.lineTo(-12, 7); ctx.quadraticCurveTo(10, 9, 20, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e22840'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.quadraticCurveTo(15, -5.5, 11, -6.8); ctx.lineTo(11, 6.8); ctx.quadraticCurveTo(15, 5.5, 20, 0); ctx.fill();
    ctx.fillStyle = '#2f5bea'; ctx.beginPath(); ctx.arc(2, 0, 3.6, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#ffd35c'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
  }
  function tracePath(tt) { ctx.beginPath(); const steps = 80; for (let i = 0; i <= steps; i++) { const [x, y] = curve(tt * i / steps); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } }
  function frame(now) {
    if (W > 0) {
      const bg = ctx.createLinearGradient(0, 0, 0, H); const go = g.phase === 'running' && g.shownAt && !g.hiddenAt; bg.addColorStop(0, go ? '#0c6b3a' : '#0b1030'); bg.addColorStop(1, go ? '#46e892' : '#3a1a5c');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      stars.forEach(st => { ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(now / 700 + st.p)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(st.x * W, st.y * H, st.r, 0, 6.283); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) { const y = Math.round(H * i / 5) + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, H - 40, W, 40);
    }
    if (g.phase === 'running') {
      const el = now - g.t0; g.t = el / 1000; timeEl.textContent = g.t.toFixed(1) + ' s';
      if (!g.shownAt && el >= g.flashAt) { keyEl.hidden = false; sky.classList.add('go'); g.shownAt = now; }
      if (g.shownAt && !g.hiddenAt && now - g.shownAt >= WINDOW) { keyEl.hidden = true; sky.classList.remove('go'); g.hiddenAt = now; }
      if (g.hiddenAt && now - g.hiddenAt > 40) lose('Se te pasó la tecla verde', now);
      else if (el >= ROUND) lose('Se acabó el tiempo', now);
    }
    const tt = Math.min(g.t, 20);
    if (W > 0) {
      if (tt > 0) {
        tracePath(tt); const [ex] = curve(tt); ctx.lineTo(ex, H - 40); ctx.lineTo(36, H - 40); ctx.closePath(); ctx.fillStyle = 'rgba(245,180,0,.14)'; ctx.fill();
        tracePath(tt); const lg = ctx.createLinearGradient(36, 0, W, 0); lg.addColorStop(0, '#f5b400'); lg.addColorStop(1, '#ff4d6d');
        ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
      }
      const [rx, ry] = curve(tt), [nx, ny] = curve(tt + 0.08), ang = Math.atan2(ny - ry, nx - rx);
      if (g.phase === 'escaped') { const e = (now - g.endAt) / 1000, d = 700 * e * e + 140 * e; rocket(rx + Math.cos(g.ang) * d, ry + Math.sin(g.ang) * d, g.ang, true); }
      else if (g.phase !== 'crashed') rocket(rx, ry, g.phase === 'idle' ? -0.15 : ang, g.phase === 'running');
      if (g.parts) { g.parts.forEach(p => { p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.life -= 0.016;
        if (p.life > 0) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); } }); ctx.globalAlpha = 1; }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function finishUI() { keyEl.hidden = true; sky.classList.remove('go'); startBtn.textContent = 'Jugar de nuevo'; }
  function start() {
    if (g.phase === 'running') return;
    markPlayed();
    startBtn.disabled = true; startBtn.blur();
    g = { phase: 'running', t0: performance.now(), t: 0, flashAt: rand(3000, 17000), shownAt: 0, hiddenAt: 0, parts: null };
    keyEl.hidden = true; stEl.textContent = 'EN VUELO'; setMsg('Atento… espera la tecla verde'); Sound.blip();
    try { sky.focus({ preventScroll: true }); } catch (e) {}
  }
  function win(rt, now) {
    const [rx, ry] = curve(g.t), [nx, ny] = curve(g.t + 0.08);
    g.ang = Math.atan2(ny - ry, nx - rx); g.phase = 'escaped'; g.endAt = now;
    finishUI(); stEl.textContent = 'A SALVO'; setMsg(`¡A tiempo! Reacción: ${Math.round(rt)} ms`); Sound.blip();
    outTimer = setTimeout(() => showOutcome({ win: true, game: 'Reacción', detail: `Tiempo de reacción: <b>${Math.round(rt)} ms</b>`, removed: false, verdict: V.saveStay, retry: start, focusButton: false }) || (startBtn.disabled = false), D(1300));
  }
  function lose(reason, now) {
    const [rx, ry] = curve(Math.min(g.t, 20));
    g.phase = 'crashed'; g.endAt = now; finishUI(); stEl.textContent = '¡CRASH!'; setMsg(reason); Sound.boom();
    g.parts = Array.from({ length: 70 }, () => { const a = rand(0, 6.283), v = rand(1, 5.5);
      return { x: rx, y: ry, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, r: rand(1.5, 4.5), life: rand(0.6, 1.3), c: ['#ffd35c', '#ff7a1a', '#e22840', '#ffffff'][randInt(4)] }; });
    sky.classList.remove('shake'); void sky.offsetWidth; sky.classList.add('shake');
    outTimer = setTimeout(() => showOutcome({ win: false, game: 'Reacción', detail: reason, removed: true, verdict: V.lose, retry: start, focusButton: false }) || (startBtn.disabled = false), D(1300));
  }
  function press(now) {
    if (g.phase !== 'running') return;
    if (!g.shownAt) { lose('Te adelantaste: la tecla verde aún no salía', now); return; }
    const rt = now - g.shownAt;
    if (!g.hiddenAt && rt <= WINDOW) win(rt, now);
    else lose(`Llegaste tarde (${Math.round(rt)} ms)`, now);
  }
  function onKey(e) {
    if (e.code !== 'Space' && e.key !== ' ') return;
    if (!overlay.hidden) return;
    if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;
    e.preventDefault(); if (e.repeat) return;
    press(performance.now());
  }
  document.addEventListener('keydown', onKey);
  sky.addEventListener('pointerdown', e => { if (g.phase !== 'running') return; e.preventDefault(); press(performance.now()); });
  startBtn.addEventListener('click', start);
  onCleanup(() => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('keydown', onKey); clearTimeout(outTimer); });
}

/* =========================================================
   Shared · playing cards (Mayor o menor, Blackjack)
   ========================================================= */
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const HL_ORDER = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13, A: 14 };
const SUIT_NAME = { '♠': 'picas', '♥': 'corazones', '♦': 'diamantes', '♣': 'tréboles' };
const RANK_NAME = { A: 'As', J: 'J', Q: 'Q', K: 'K' };
const cardName = c => `${RANK_NAME[c.r] || c.r} de ${SUIT_NAME[c.s]}`;
const cardShort = c => `${c.r}${c.s}`;
const isRedSuit = s => s === '♥' || s === '♦';
function freshDeck(n = 1) { const d = []; for (let k = 0; k < n; k++) for (const s of SUITS) for (const r of RANKS) d.push({ r, s }); return shuffle(d); }
function cardHTML(c, { down = false, size = '', dealt = false } = {}) {
  const face = c ? `<div class="pc-face pc-front"><span class="tl">${c.r}<br>${c.s}</span>` +
    `<span class="mid${'JQK'.includes(c.r) ? ' face' : ''}">${'JQK'.includes(c.r) ? c.r + c.s : c.s}</span>` +
    `<span class="br">${c.r}<br>${c.s}</span></div>` : '<div class="pc-face pc-front"></div>';
  return `<div class="pc ${size} ${c && isRedSuit(c.s) ? 'red' : ''} ${down ? 'down' : ''} ${dealt ? 'dealt' : ''}" role="img" aria-label="${down || !c ? 'Carta boca abajo' : cardName(c)}">` +
    `<div class="pc-inner">${face}<div class="pc-face pc-back card-back"></div></div></div>`;
}
function flipUp(el, c) { if (!el) return; el.classList.remove('down'); el.setAttribute('aria-label', cardName(c)); Sound.flip(); }

/* =========================================================
   Game · Mayor o menor (Hi-Lo)
   ========================================================= */
const HL_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function renderHilo() {
  stage.innerHTML = gameHead('Mayor o menor', RULES.hilo) + `
    <div class="game-stage">
      <div class="hl-stage">
        <div class="hl-steps" id="hlSteps" aria-label="Aciertos seguidos">${[1, 2, 3].map(n => `<div class="hl-step"><span>${n}</span></div>`).join('')}</div>
        <div class="hl-cards">
          <div class="hl-slot"><div class="hl-cap">Carta actual</div><div id="hlCur"></div></div>
          <div class="hl-vs" aria-hidden="true">?</div>
          <div class="hl-slot"><div class="hl-cap">Siguiente</div><div class="hl-deck" id="hlNext"></div></div>
        </div>
        <div class="hl-ladder" id="hlLadder" aria-hidden="true">${HL_RANKS.map(r => `<span data-r="${r}">${r}</span>`).join('')}</div>
        <div class="hl-msg" id="hlMsg" aria-live="polite"></div>
        <div class="hl-btns"><button class="btn lg blue" id="hlUp" type="button"><span class="arr" aria-hidden="true">▲</span> Mayor</button><button class="btn lg red" id="hlDown" type="button"><span class="arr" aria-hidden="true">▼</span> Menor</button></div>
        <div class="hl-histwrap"><div class="hl-cap">Cartas jugadas</div><div class="hl-hist" id="hlHist"></div></div>
      </div>
    </div>`;
  bindBack();
  let deck, cur, streak, hist, busy = false, alive = true;
  onCleanup(() => { alive = false; });
  const setMsg = m => { $('#hlMsg').textContent = m; };
  const lockBtns = v => { $('#hlUp').disabled = v; $('#hlDown').disabled = v; };
  function drawAll() {
    $('#hlCur').innerHTML = cardHTML(cur, { size: 'big' });
    $('#hlNext').innerHTML = cardHTML(null, { size: 'big', down: true });
    $('#hlHist').innerHTML = hist.length ? hist.map(c => cardHTML(c, { size: 'sm' })).join('') : '<span class="hl-none">Todavía ninguna</span>';
    $$('#hlSteps .hl-step').forEach((d, i) => d.classList.toggle('on', i < streak));
    const cv = HL_ORDER[cur.r];
    $$('#hlLadder span').forEach(s => { const v = HL_ORDER[s.dataset.r]; s.className = v === cv ? 'cur' : v < cv ? 'lo' : 'hi'; });
  }
  function reset() { deck = freshDeck(1); cur = deck.pop(); streak = 0; hist = []; busy = false; drawAll(); lockBtns(false); setMsg('¿La siguiente carta será mayor o menor?'); }
  async function guess(dir) {
    if (busy) return; busy = true; lockBtns(true); markPlayed();
    const nx = deck.pop(), prev = cur;
    $('#hlNext').innerHTML = cardHTML(nx, { size: 'big', down: true });
    await sleep(40); flipUp($('#hlNext .pc'), nx);
    await sleep(D(700)); if (!alive) return;
    const a = HL_ORDER[prev.r], b = HL_ORDER[nx.r];
    if (a !== b && (dir === 'up') !== (b > a)) {
      setMsg(`Salió ${cardShort(nx)}: era ${b > a ? 'mayor' : 'menor'}.`);
      await sleep(D(900)); if (!alive) return;
      showOutcome({ win: false, game: 'Mayor o menor', detail: `Después de ${cardShort(prev)} salió ${cardShort(nx)}: era ${b > a ? 'mayor' : 'menor'} · Aciertos: ${streak} de 3`,
        removed: true, verdict: V.lose, retry: reset });
      return;
    }
    if (a === b) { setMsg(`¡Igual! Salió ${cardShort(nx)}: no cuenta, adivina otra vez.`); announce(`Salió ${cardName(nx)}. Es igual, no cuenta.`); }
    else { streak++; Sound.ding(); setMsg(streak < 3 ? `¡Bien! Era ${b > a ? 'mayor' : 'menor'}. Llevas ${streak} de 3.` : '¡Tres aciertos seguidos!'); announce(`Salió ${cardName(nx)}. Acierto ${streak} de 3.`); }
    await sleep(D(600)); if (!alive) return;
    hist.push(prev); cur = nx; drawAll();
    if (streak >= 3) {
      await sleep(D(500)); if (!alive) return;
      showOutcome({ win: true, game: 'Mayor o menor', detail: 'Tres aciertos seguidos', removed: false, verdict: V.saveStay, retry: reset });
      return;
    }
    busy = false; lockBtns(false);
  }
  $('#hlUp').addEventListener('click', () => guess('up'));
  $('#hlDown').addEventListener('click', () => guess('down'));
  reset();
}

/* =========================================================
   Game · Blackjack
   6-deck shoe reshuffled at the cut card, dealer checks for blackjack with an Ace or ten up,
   dealer draws to 16 and stands on every 17 (also A+6), split up to 4 hands, split Aces get one
   card each, 21 after a split is not blackjack. No chips: each hand simply wins, loses or ties.
   ========================================================= */
const BJ_ICONS = {
  hit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  stand: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  split: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20v-7M12 13L6 6M12 13l6-7M3 6h6M15 6h6"/></svg>'
};
function renderBlackjack() {
  if (!state.bj) state.bj = { shoe: freshDeck(6) };
  const bj = state.bj, CUT = 78;
  const slots = n => '<div class="pc-slot"></div>'.repeat(n);
  stage.innerHTML = gameHead('Blackjack', RULES.blackjack) + `
    <div class="game-stage">
      <div class="bj-table">
        <div class="bj-shoebox" aria-hidden="true"><div class="shoe-stack"></div><span id="bjShoe"></span></div>
        <div class="bj-seat">
          <div class="bj-head"><span class="bj-name">Banca</span><div class="bj-badge" id="dTotal" hidden></div></div>
          <div class="bj-cards" id="dCards">${slots(2)}</div>
        </div>
        <svg class="bj-arc" viewBox="0 0 600 110" aria-hidden="true">
          <defs><path id="bjArcA" d="M40,18 Q300,118 560,18"/><path id="bjArcB" d="M95,48 Q300,132 505,48"/></defs>
          <text class="a1"><textPath href="#bjArcA" startOffset="50%" text-anchor="middle">BLACKJACK</textPath></text>
          <text class="a2"><textPath href="#bjArcB" startOffset="50%" text-anchor="middle">LA BANCA PIDE HASTA 16 Y SE PLANTA EN 17</textPath></text>
        </svg>
        <div class="bj-msg" id="bjMsg" aria-live="polite">Pulsa «Repartir» para empezar.</div>
        <div class="bj-hands" id="pHands"><div class="bj-hand"><div class="bj-cards">${slots(2)}</div><div class="bj-head"><span class="bj-name">Tú</span></div></div></div>
      </div>
      <div class="bj-actions">
        <button class="btn lg red" id="bjDeal" type="button">Repartir</button>
        <button class="btn lg" id="bjHit" type="button" hidden>${BJ_ICONS.hit} Pedir</button>
        <button class="btn lg green" id="bjStand" type="button" hidden>${BJ_ICONS.stand} Plantarse</button>
        <button class="btn lg blue" id="bjSplit" type="button" hidden>${BJ_ICONS.split} Dividir</button>
      </div>
    </div>`;
  bindBack();
  let alive = true, R = null;
  onCleanup(() => { alive = false; });
  const btn = id => $('#' + id);
  const ACTIONS = ['bjHit', 'bjStand', 'bjSplit'];
  const val = c => (c.r === 'A' ? 11 : 'JQK'.includes(c.r) ? 10 : +c.r);
  function total(cards) { let t = 0, aces = 0; cards.forEach(c => { t += val(c); if (c.r === 'A') aces++; }); while (t > 21 && aces) { t -= 10; aces--; } return { t, soft: aces > 0 }; }
  const isBJ = h => h.cards.length === 2 && total(h.cards).t === 21 && !h.fromSplit;
  // An Ace counts 1 or 11: while both are possible, show both ("5 o 15").
  const totalText = cards => { const { t, soft } = total(cards); return soft && t < 21 ? `${t - 10} o ${t}` : String(t); };
  const badgeCls = (cards, bjFlag) => { const t = total(cards).t; return bjFlag ? 'gold' : t > 21 ? 'bust' : t === 21 ? 'gold' : ''; };
  const msg = m => { $('#bjMsg').textContent = m; };
  const shoeInfo = () => { $('#bjShoe').textContent = `${bj.shoe.length} cartas`; };
  function draw() { if (!bj.shoe.length) bj.shoe = freshDeck(6); return bj.shoe.pop(); }

  function dealerTotal() {
    const el = $('#dTotal'); if (!R || !R.dealer.length) { el.hidden = true; return; }
    const cards = R.revealed ? R.dealer : [R.dealer[0]];
    el.hidden = false; el.textContent = R.revealed && isBJ({ cards: R.dealer }) ? 'Blackjack' : totalText(cards);
    el.className = 'bj-badge ' + (R.revealed ? badgeCls(R.dealer, isBJ({ cards: R.dealer })) : '');
  }
  function handHTML(h, i) {
    const active = R.phase === 'player' && i === R.active && R.hands.length > 1;
    const bjFlag = isBJ(h);
    return `<div class="bj-hand ${active ? 'active' : ''}" id="hand${i}" ${active ? 'aria-current="true"' : ''}>
      <div class="bj-cards">${h.cards.length ? h.cards.map(c => cardHTML(c)).join('') : slots(2)}</div>
      <div class="bj-head"><span class="bj-name">${R.hands.length > 1 ? `Mano ${i + 1}` : 'Tú'}</span>
        ${h.cards.length ? `<div class="bj-badge ${badgeCls(h.cards, bjFlag)}">${bjFlag ? 'Blackjack' : totalText(h.cards)}</div>` : ''}
        ${h.res ? `<span class="res ${h.resCls}">${h.res}</span>` : ''}</div></div>`;
  }
  const renderHands = () => { $('#pHands').innerHTML = R.hands.map(handHTML).join(''); };

  async function dealTo(i) {
    const c = draw(), box = $(`#hand${i} .bj-cards`); R.hands[i].cards.push(c);
    $$('.pc-slot', box).forEach(s => s.remove());
    box.insertAdjacentHTML('beforeend', cardHTML(c, { dealt: true }));
    Sound.swish(); shoeInfo(); await sleep(D(430)); if (alive) renderHands();
    return c;
  }
  async function dealDealer(down = false) {
    const c = draw(), box = $('#dCards'); R.dealer.push(c);
    $$('.pc-slot', box).forEach(s => s.remove());
    box.insertAdjacentHTML('beforeend', cardHTML(c, { dealt: true, down }));
    Sound.swish(); shoeInfo(); await sleep(D(430)); if (alive) dealerTotal();
    return c;
  }
  async function revealHole() {
    if (R.revealed) return;
    R.revealed = true; flipUp($$('#dCards .pc')[1], R.dealer[1]); dealerTotal(); await sleep(D(600));
  }
  function setButtons() {
    const playing = !!R && R.phase === 'player', h = playing ? R.hands[R.active] : null;
    btn('bjDeal').hidden = !!R && R.phase !== 'done' && R.phase !== 'push';
    ACTIONS.forEach(id => { btn(id).hidden = !playing; btn(id).disabled = !playing; });
    if (!playing) return;
    btn('bjSplit').disabled = !(h.cards.length === 2 && val(h.cards[0]) === val(h.cards[1]) && R.hands.length < 4);
  }
  const lockActions = () => ACTIONS.forEach(id => { btn(id).disabled = true; });

  async function deal() {
    if (R && R.phase !== 'done' && R.phase !== 'push') return;
    markPlayed();
    let reshuffled = false;
    if (bj.shoe.length < CUT) { bj.shoe = freshDeck(6); reshuffled = true; }
    R = { dealer: [], hands: [{ cards: [], done: false, fromSplit: false, bust: false }], active: 0, phase: 'dealing', revealed: false };
    btn('bjDeal').textContent = 'Repartir';
    $('#dCards').innerHTML = slots(2); renderHands(); dealerTotal(); setButtons();
    msg(reshuffled ? 'Se acabó el zapato: se barajaron 6 mazos nuevos.' : 'Repartiendo…');
    await dealTo(0); if (!alive) return;
    await dealDealer(); if (!alive) return;
    await dealTo(0); if (!alive) return;
    await dealDealer(true); if (!alive) return;
    const up = R.dealer[0];
    if (up.r === 'A' || val(up) === 10) { await peek(); return; }
    if (isBJ(R.hands[0])) { msg('¡Blackjack!'); await revealHole(); finish(); return; }
    startPlayer();
  }
  async function peek() {
    R.phase = 'peek'; setButtons();
    msg(`La banca muestra ${R.dealer[0].r === 'A' ? 'un As' : 'una carta que vale 10'}: revisa si tiene blackjack…`);
    await sleep(D(1000)); if (!alive) return;
    if (isBJ({ cards: R.dealer })) { await revealHole(); msg('¡La banca tiene blackjack!'); finish(); return; }
    if (isBJ(R.hands[0])) { msg('La banca no tiene blackjack. ¡Tu blackjack gana!'); await revealHole(); finish(); return; }
    startPlayer('La banca no tiene blackjack. ');
  }
  function startPlayer(pre = '') { R.phase = 'player'; R.active = 0; renderHands(); setButtons(); msg(pre + '¿Pides carta o te plantas?'); }

  async function hit() {
    if (!R || R.phase !== 'player') return;
    lockActions();
    const i = R.active, h = R.hands[i];
    await dealTo(i); if (!alive) return;
    const t = total(h.cards).t;
    if (t > 21) { h.bust = true; h.done = true; msg(`Te pasaste de 21: ${t}.`); Sound.clack(); await sleep(D(700)); next(); return; }
    if (t === 21) { h.done = true; msg('¡21!'); await sleep(D(400)); next(); return; }
    setButtons();
  }
  function stand() { if (!R || R.phase !== 'player') return; R.hands[R.active].done = true; next(); }
  async function split() {
    if (!R || R.phase !== 'player') return;
    const i = R.active, h = R.hands[i];
    if (!(h.cards.length === 2 && val(h.cards[0]) === val(h.cards[1]) && R.hands.length < 4)) return;
    lockActions();
    const aces = h.cards[0].r === 'A';
    const h2 = { cards: [h.cards.pop()], done: false, fromSplit: true, bust: false };
    h.fromSplit = true;
    R.hands.splice(i + 1, 0, h2); renderHands(); Sound.swish(); await sleep(D(300)); if (!alive) return;
    await dealTo(i); if (!alive) return;
    if (aces) {
      await dealTo(i + 1); if (!alive) return;
      h.done = true; h2.done = true; msg('Ases divididos: reciben una sola carta cada uno.'); await sleep(D(800)); next(); return;
    }
    if (total(h.cards).t === 21) { h.done = true; next(); return; }
    renderHands(); setButtons(); msg(`Mano ${i + 1}: ¿pides o te plantas?`);
  }
  async function next() {
    const n = R.hands.findIndex(h => !h.done);
    if (n >= 0) {
      R.active = n; R.phase = 'player'; const h = R.hands[n]; renderHands();
      if (h.cards.length === 1) { lockActions(); await dealTo(n); if (!alive) return; if (total(h.cards).t === 21) { h.done = true; next(); return; } }
      setButtons(); renderHands(); msg(R.hands.length > 1 ? `Mano ${n + 1}: ¿pides o te plantas?` : '¿Pides carta o te plantas?');
      return;
    }
    R.phase = 'dealer'; setButtons(); renderHands();
    await revealHole(); if (!alive) return;
    if (R.hands.some(h => !h.bust)) {
      while (total(R.dealer).t < 17) { msg('La banca pide carta…'); await sleep(D(450)); await dealDealer(); if (!alive) return; }
    }
    finish();
  }
  function finish() {
    const d = total(R.dealer).t, dBJ = isBJ({ cards: R.dealer }), dBust = d > 21;
    let wins = 0, losses = 0;
    R.hands.forEach(h => {
      const p = total(h.cards).t, pBJ = isBJ(h);
      let r, cls;
      if (h.bust) { r = 'Se pasó'; cls = 'lose'; }
      else if (pBJ && dBJ) { r = 'Empate'; cls = 'push'; }
      else if (pBJ) { r = '¡Blackjack!'; cls = 'win'; }
      else if (dBJ) { r = 'Pierde'; cls = 'lose'; }
      else if (dBust || p > d) { r = 'Gana'; cls = 'win'; }
      else if (p < d) { r = 'Pierde'; cls = 'lose'; }
      else { r = 'Empate'; cls = 'push'; }
      h.res = r; h.resCls = cls; if (cls === 'win') wins++; if (cls === 'lose') losses++;
    });
    const result = wins > losses ? 'win' : losses > wins ? 'lose' : 'push';
    R.phase = result === 'push' ? 'push' : 'over';
    renderHands(); dealerTotal(); setButtons();
    const handTxt = (h, i) => `${R.hands.length > 1 ? 'Mano ' + (i + 1) : 'Tú'}: ${h.bust ? `te pasaste (${total(h.cards).t})` : isBJ(h) ? 'blackjack' : total(h.cards).t}`;
    const parts = [`Banca: ${dBJ ? 'blackjack' : dBust ? `se pasó (${d})` : d}`, ...R.hands.map(handTxt)];
    if (R.hands.length > 1) parts.push(`Manos ganadas: ${wins} · perdidas: ${losses}`);
    const detail = parts.join(' · ');
    if (result === 'push') {
      msg(R.hands.length > 1 ? 'Ganaste y perdiste las mismas manos: se reparte otra mano.' : 'Empate: se reparte otra mano.');
      btn('bjDeal').textContent = 'Repartir otra mano'; announce('Empate. Se reparte otra mano.'); Sound.ding(); return;
    }
    const win = result === 'win';
    msg(win ? '¡Ganaste la mano!' : 'Perdiste la mano.');
    announce(`${parts.join('. ')}. ${win ? 'Ganaste' : 'Perdiste'}.`);
    setTimeout(() => { if (!alive) return; showOutcome({ win, game: 'Blackjack', detail, removed: !win, verdict: win ? V.saveStay : V.lose, retry: deal }); R.phase = 'done'; setButtons(); }, D(1400));
  }

  btn('bjDeal').addEventListener('click', deal);
  btn('bjHit').addEventListener('click', hit);
  btn('bjStand').addEventListener('click', stand);
  btn('bjSplit').addEventListener('click', split);
  shoeInfo();
}

/* =========================================================
   Init
   ========================================================= */
document.documentElement.lang = 'es';
applyMode(state.mode === 'dark' ? 'dark' : 'light');
updateSoundBtn();
$('#themeBtn').addEventListener('click', () => applyMode(state.mode === 'light' ? 'dark' : 'light'));
$('#soundBtn').addEventListener('click', () => { Sound.toggle(); updateSoundBtn(); });
$$('#steps button').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
let bulbRaf = 0;
new ResizeObserver(() => { cancelAnimationFrame(bulbRaf); bulbRaf = requestAnimationFrame(layoutBulbs); }).observe(marquee);
go(state.roster.some(s => s.sample) || !state.roster.length ? 'roster' : 'select');
})();
