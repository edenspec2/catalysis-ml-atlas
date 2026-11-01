const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eid = x => typeof x === 'object' && x ? x.id : x;
const url = s => { try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } };
function hash(s) { let h = 2166136261; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Eight validated categorical slots; anything past them folds into gray. Year is ordered, so it is one hue.
const SERIES = ['#2a78d6','#eb6834','#1baf7a','#eda100','#e87ba4','#008300','#6250d6','#e34948'];
const GRAY = '#8e8e93', ACCENT = '#0071e3';
const paradigmColors = {
  'Physical / interpretable':SERIES[0],'MLIP / TS acceleration':SERIES[1],'Autonomous / HTE':SERIES[2],'Transfer / few-shot':SERIES[3],
  'Ligand-space / screening':SERIES[4],'Bayesian / active learning':SERIES[5],'3D / deep learning':SERIES[6],'Mechanistic ML':SERIES[7],
  'Inverse / generative':GRAY,'Other / mixed':GRAY
};
const representationColors = {
  'Physical / chemist descriptors':SERIES[0],'MLIP / physics acceleration':SERIES[1],'Conformer / ensemble descriptors':SERIES[2],'Reusable ligand library':SERIES[3],
  'Dataset / experimental loop':SERIES[4],'Catalyst-state / mechanistic':SERIES[5],'Learned 3D / TS GNN':SERIES[6],'Pretrained learned representation':SERIES[7],'Overview / mixed':GRAY
};
const yearColors = { '2026':'#104281','2025':'#1c5cab','2024':'#2a78d6','2023':'#5598e7','2022':'#86b6ef', '2021 and earlier':'#b7d3f6' };
const yearKey = n => String(n.year) in yearColors ? String(n.year) : '2021 and earlier';
const typeColors = { author:SERIES[0], topic:SERIES[2], method:SERIES[6], workflow:SERIES[4], program:SERIES[1] };
const groupColors = { Other:GRAY };
const REPS = Object.keys(representationColors);
const VIEWS = { papers:['paper'], papers_authors:['paper','author'], papers_topics:['paper','topic'], papers_methods:['paper','method'] };

// Everything the renderer touches per node sits in flat typed arrays, one slot per node.
const FOCAL = 620, DOT = 32, DOT_R = 23, CARD_W = 240, CARD_H = 178;
let POS = new Float32Array(0), START = POS, TARGET = POS, SX = POS, SY = POS, SZ = POS, SS = POS, SRW = POS, SRH = POS, BASE_W = POS, BASE_H = POS;
let ORDER = new Uint16Array(0), LINKS = ORDER, HOT = new Uint8Array(0), HASFIG = HOT;
let slotOf = new Map(), selectedSlot = -1, cosY = 1, sinY = 0, cosP = 1, sinP = 0;
let dirty = false, settled = false, tween = null, overlays = [], cardShadowSprite = null;
const dotSprites = new Map(), cardSprites = new Map();

let ALL = [], META = [], PAPER_LINKS = [], STORIES = {}, GROUPS = [];
let currentData = { nodes:[], links:[] }, currentSelection = null, activeStory = null;
let canvas, ctx, hoverId = null, layoutKind = 'free';
const cam = { yaw: -0.48, pitch: 0.85, zoom: 1, tx: 0, ty: 0, tz: 0, ox: 0, oy: 0 };
const pointer = { down:false, x:0, y:0, moved:false, id:null, pan:false };
const figImgs = new Map(), texts = new WeakMap();
let lastLayoutSize = { w: 0, h: 0 };
let relayouting = false;

const primaryGroup = n => n.type === 'paper' ? (n.groups?.[0] || 'Other') : 'Other';
const paperText = p => { if (!texts.has(p)) texts.set(p, joinedText(p)); return texts.get(p); };
const joinedText = p => [p.label, p.full_title, p.chemistry, p.chemistry_class, p.paradigm, p.representation_class, p.stack_layer, p.data_size_bin, p.validation_type, p.why, p.summary, p.brief, p.ask_next, p.journal, (p.derived_authors||[]).join(' '), (p.groups||[]).join(' '), (p.derived_methods||[]).join(' '), (p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();

const COLOR_BY = {
  paradigm:[paradigmColors, n => n.paradigm], representation:[representationColors, n => n.representation_class],
  group:[groupColors, primaryGroup], year:[yearColors, yearKey]
};
function baseColor(n) {
  if (n._dim) return '#d1d1d6';
  if (n._selected) return ACCENT;
  if (n.type !== 'paper') return typeColors[n.type] || GRAY;
  const [map, key] = COLOR_BY[$('colorby').value] || COLOR_BY.paradigm;
  return map[key(n)] || GRAY;
}
function storyMatch(p) {
  if (!activeStory) return true;
  const s = STORIES[activeStory]; if (!s) return true;
  if (s.filter?.years && !s.filter.years.includes(Number(p.year))) return false;
  if (s.filter?.relevance && !s.filter.relevance.includes(p.relevance)) return false;
  if (s.ids && !s.ids.includes(p.id)) return false;
  if (s.layers && !s.layers.includes(p.stack_layer)) return false;
  if (s.paradigms && !s.paradigms.includes(p.paradigm)) return false;
  if (s.representations && !s.representations.includes(p.representation_class)) return false;
  if (s.groups && !p.groups?.some(g => s.groups.includes(g))) return false;
  if (s.keywords) { const text = paperText(p); if (!s.keywords.some(k => text.includes(k))) return false; }
  return true;
}
function paperVisible(n) {
  const yr = $('year').value, q = $('q').value.trim().toLowerCase();
  if (yr !== 'all' && (yr === 'older' ? Number(n.year || 0) >= 2023 : String(n.year) !== yr)) return false;
  if ($('chemistry').value !== 'all' && n.chemistry_class !== $('chemistry').value) return false;
  if (!storyMatch(n)) return false;
  if (q && !paperText(n).includes(q) && !(n.type !== 'paper' && String(n.label || '').toLowerCase().includes(q))) return false;
  return true;
}
function neighborhood(id, hops) {
  const keep = new Set([id]); let front = new Set([id]);
  for (let k = 0; k < hops; k++) {
    const nxt = new Set();
    currentData.links.forEach(l => {
      const a = eid(l.source), b = eid(l.target);
      if (front.has(a) && !keep.has(b)) { keep.add(b); nxt.add(b); }
      if (front.has(b) && !keep.has(a)) { keep.add(a); nxt.add(a); }
    });
    front = nxt;
  }
  return keep;
}
function persist() {
  try {
    localStorage.setItem('cml:atlas', JSON.stringify({
      q:$('q').value, view:$('view').value, layout:$('layout').value, colorby:$('colorby').value,
      year:$('year').value, chemistry:$('chemistry').value, story:activeStory,
      showFigs:$('showFigs')?.checked !== false
    }));
  } catch {}
}
function restore() {
  try {
    const s = JSON.parse(localStorage.getItem('cml:atlas') || 'null'); if (!s) return;
    for (const [k, v] of Object.entries(s)) {
      if (k === 'story') { activeStory = v; continue; }
      if (k === 'showFigs') { if ($('showFigs')) $('showFigs').checked = v !== false; continue; }
      const el = $(k); if (el && v != null) { el.value = v; if (el.selectedIndex < 0) el.selectedIndex = 0; }
    }
  } catch {}
}
function figuresOn() { return $('showFigs')?.checked !== false; }
function figCaption(p) {
  if (p?.figure?.kind === 'toc') return p.figure.caption || 'Graphical abstract';
  return p?.figure?.caption || 'Figure 1';
}
const thumb = src => src.replace('figures/', 'figures/thumb/').replace(/\.\w+$/, '.webp');
function figImage(n) {
  if (!n?.figure?.src || !figuresOn()) return null;
  let im = figImgs.get(n.id);
  if (!im) {
    im = new Image();
    im.decoding = 'async';
    im.onload = invalidate;
    im.src = thumb(n.figure.src);
    figImgs.set(n.id, im);
  }
  return im.complete && im.naturalWidth > 0 ? im : null;
}
function stageSize() {
  const el = $('graph');
  return {
    w: Math.max(280, el?.clientWidth || canvas?.clientWidth || 800),
    h: Math.max(220, el?.clientHeight || canvas?.clientHeight || 500)
  };
}
function sunflower(count, i) {
  const k = i + 0.5;
  const u = Math.sqrt(k / Math.max(1, count));
  const theta = Math.PI * (1 + Math.sqrt(5)) * k;
  return { x: u * Math.cos(theta), y: u * Math.sin(theta) };
}
function paperSize(n, N) {
  const fig = figuresOn() && n.type === 'paper' && n.figure?.src;
  const base = fig ? Math.max(13, Math.min(24, 208 / Math.sqrt(Math.max(8, N)))) : Math.max(6, Math.min(11, 110 / Math.sqrt(Math.max(8, N))));
  n._rw = fig ? base : base * 0.62;
  n._rh = fig ? base * 0.74 : base * 0.62;
}
function packVolume(members, x0, y0, z0, x1, y1, z1) {
  const N = Math.max(1, members.length);
  const W = Math.max(48, x1 - x0), H = Math.max(48, y1 - y0), D = Math.max(48, z1 - z0);
  const cols = Math.max(1, Math.round(Math.cbrt(N * (W * W) / Math.max(1, H * D))));
  const rows = Math.max(1, Math.round(Math.cbrt(N * (H * H) / Math.max(1, W * D))));
  const layers = Math.max(1, Math.ceil(N / Math.max(1, cols * rows)));
  const dx = W / cols, dy = H / rows, dz = D / layers;
  members.slice().sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || hash(a.id) - hash(b.id)).forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const layer = Math.floor(i / (cols * rows));
    n.x = x0 + (col + 0.5) * dx + ((hash(n.id) % 100) / 100 - 0.5) * dx * 0.22;
    n.y = y0 + (row + 0.5) * dy + ((hash(n.id + 'y') % 100) / 100 - 0.5) * dy * 0.22;
    n.z = z0 + (layer + 0.5) * dz + ((hash(n.id + 'z') % 100) / 100 - 0.5) * dz * 0.22;
    paperSize(n, N);
  });
}
function seedCloud(nodes) {
  const { w, h } = stageSize();
  const papers = nodes.filter(n => n.type === 'paper');
  const extras = nodes.filter(n => n.type !== 'paper');
  const N = Math.max(papers.length, 1);
  const rx = Math.max(250, w * 0.48);
  const rz = Math.max(220, h * 0.5);
  const years = papers.map(p => Number(p.year) || 2024);
  const ymin = Math.min(...years, 2020), ymax = Math.max(...years, 2026);
  papers.forEach((n, i) => {
    const s = sunflower(N, i);
    const yNorm = ((Number(n.year) || 2024) - ymin) / Math.max(1, ymax - ymin);
    const lift = ((hash(n.id) % 100) / 100 - 0.5);
    n.x = s.x * rx;
    n.z = s.y * rz;
    n.y = (0.42 - yNorm) * 110 + lift * 28;
    paperSize(n, N);
  });
  extras.forEach((n, i) => {
    const s = sunflower(Math.max(extras.length, 8), i);
    n.x = rx * 0.72 * s.x;
    n.y = 90 + s.y * 36;
    n.z = rz * 0.72 * s.y;
    n._rw = n._rh = 8;
  });
  lastLayoutSize = { w, h };
}
function figureButton(p, large) {
  if (!p.figure?.src) return large ? '<p class="fig-missing muted">No open Figure 1 or abstract image for this paper.</p>' : '';
  const cap = figCaption(p);
  const kind = p.figure.kind === 'toc' ? 'Graphical abstract' : 'Figure 1';
  if (!large) return `<img class="fig-sm" src="${esc(thumb(p.figure.src))}" alt="${esc(cap)}" loading="lazy" decoding="async">`;
  return `<button type="button" class="fig fig-lg" data-fig="${esc(p.id)}" aria-label="Enlarge ${esc(cap)}"><img src="${esc(p.figure.src)}" alt="${esc(cap)}" loading="eager" decoding="async"></button><p class="fig-cap"><span class="fig-kind">${esc(kind)}</span>${esc(cap)}</p>`;
}
function openFigure(id) {
  const n = ALL.find(x => x.id === id);
  if (!n?.figure?.src || !$('figbox')) return;
  $('figbox-img').src = n.figure.src;
  $('figbox-img').alt = figCaption(n);
  $('figbox-cap').textContent = (n.full_title || n.label) + ' · ' + figCaption(n);
  if (!$('figbox').open) $('figbox').showModal();
}
function defaultCamera() {
  cam.yaw = -0.48;
  cam.pitch = 0.85;
  cam.zoom = 1;
  cam.tx = 0;
  cam.ty = 0;
  cam.tz = 0;
  cam.ox = 0;
  cam.oy = 0;
}
function applyLayout(mode) {
  layoutKind = mode || 'free';
  const nodes = currentData.nodes;
  const ps = nodes.filter(n => n.type === 'paper');
  const { w, h } = stageSize();
  seedCloud(nodes);
  if (mode === 'year') {
    const years = [...new Set(ps.map(p => Number(p.year) || 0))].sort((a, b) => a - b);
    const colW = Math.max(102, (Math.min(w, 1100) * 0.9) / Math.max(1, years.length));
    years.forEach((y, yi) => {
      const members = ps.filter(p => (Number(p.year) || 0) === y);
      const cx = (yi - (years.length - 1) / 2) * colW;
      packVolume(members, cx - colW * 0.36, -h * 0.28, -110, cx + colW * 0.36, h * 0.28, 110);
    });
  } else if (mode === 'paradigm' || mode === 'representation' || mode === 'group') {
    const cats = mode === 'paradigm' ? Object.keys(paradigmColors) : mode === 'representation' ? REPS : GROUPS;
    const key = COLOR_BY[mode][1];
    const list = cats.filter(c => ps.some(p => key(p) === c));
    const cols = Math.max(1, Math.ceil(Math.cbrt(list.length * 4)));
    const rows = Math.max(1, Math.ceil(Math.sqrt(list.length / cols)));
    const layers = Math.max(1, Math.ceil(list.length / Math.max(1, cols * rows)));
    const cw = (w * 0.82) / cols, ch = (h * 0.72) / rows, cd = 220 / layers;
    list.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols) % rows, layer = Math.floor(i / (cols * rows));
      const x0 = -w * 0.4 + col * cw, y0 = -h * 0.34 + row * ch, z0 = -110 + layer * cd;
      packVolume(ps.filter(p => key(p) === c), x0 + 10, y0 + 10, z0, x0 + cw - 10, y0 + ch - 10, z0 + cd * 0.82);
    });
  }
  packNodes();
  settle(false);
}
function packNodes() {
  const { nodes, links } = currentData, N = nodes.length, before = POS, beforeSlot = slotOf;
  slotOf = new Map(nodes.map((n, i) => [n.id, i]));
  POS = new Float32Array(N * 3); START = new Float32Array(N * 3); TARGET = new Float32Array(N * 3);
  [SX, SY, SZ, SS, SRW, SRH, BASE_W, BASE_H] = Array.from({ length: 8 }, () => new Float32Array(N));
  HASFIG = new Uint8Array(N);
  ORDER = new Uint16Array(N).map((_, i) => i);
  nodes.forEach((n, i) => {
    const k = i * 3, j = beforeSlot.get(n.id);
    TARGET[k] = n.x; TARGET[k + 1] = n.y; TARGET[k + 2] = n.z;
    for (let c = 0; c < 3; c++) START[k + c] = j === undefined ? TARGET[k + c] : before[j * 3 + c];
    HASFIG[i] = figuresOn() && n.type === 'paper' && n.figure?.src ? 1 : 0;
    BASE_W[i] = n._rw || (n.type === 'paper' ? 11 : 7);
    BASE_H[i] = HASFIG[i] ? n._rh || 20 : BASE_W[i];
  });
  LINKS = new Uint16Array(links.length * 2);
  links.forEach((l, k) => { LINKS[k * 2] = slotOf.get(l.source); LINKS[k * 2 + 1] = slotOf.get(l.target); });
  HOT = new Uint8Array(links.length);
  POS.set(START);
  markSelection();
}
function markSelection() {
  const keep = currentSelection ? neighborhood(currentSelection, 1) : null;
  currentData.nodes.forEach(n => {
    n._selected = n.id === currentSelection;
    n._dim = !!keep && !keep.has(n.id);
    n._color = baseColor(n);
  });
  currentData.links.forEach((l, k) => { HOT[k] = l.source === currentSelection || l.target === currentSelection ? 1 : 0; });
  selectedSlot = slotOf.get(currentSelection) ?? -1;
  invalidate();
}
function projectAll(w, h) {
  cosY = Math.cos(cam.yaw); sinY = Math.sin(cam.yaw); cosP = Math.cos(cam.pitch); sinP = Math.sin(cam.pitch);
  const { zoom, tx, ty, tz } = cam, ox = w / 2 + cam.ox, oy = h / 2 + cam.oy, N = SX.length;
  for (let i = 0, k = 0; i < N; i++, k += 3) {
    const sel = i === selectedSlot;
    const px = POS[k] - tx, py = POS[k + 1] - ty - (sel ? 16 : 0), pz = POS[k + 2] - tz;
    const x1 = px * cosY - pz * sinY, z1 = px * sinY + pz * cosY;
    const y2 = py * cosP - z1 * sinP, z2 = Math.max(-360, py * sinP + z1 * cosP);
    const s = FOCAL / (FOCAL + z2) * zoom, grown = sel ? s * 1.22 : s;
    SX[i] = ox + x1 * s; SY[i] = oy + y2 * s; SZ[i] = z2; SS[i] = s;
    SRW[i] = Math.max(HASFIG[i] ? 16 : 6, BASE_W[i] * grown);
    SRH[i] = HASFIG[i] ? Math.max(12, BASE_H[i] * grown) : SRW[i];
  }
  ORDER.sort((a, b) => SZ[b] - SZ[a]);
}
function sizeCanvas() {
  const el = $('graph');
  if (!el || !canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!relayouting && currentData.nodes.length && lastLayoutSize.w) {
    if (Math.abs(w - lastLayoutSize.w) > 48 || Math.abs(h - lastLayoutSize.h) > 36) {
      relayouting = true;
      applyLayout(layoutKind);
      relayouting = false;
    }
  }
  reserveOverlays();
  invalidate();
}
function fitGraph(resetAngles) {
  const { w, h } = stageSize();
  if (resetAngles) defaultCamera();
  else cam.tx = cam.ty = cam.tz = 0;
  cam.zoom = 1; cam.ox = cam.oy = 0;
  if (!SX.length) return;
  projectAll(w, h);
  const xs = SX.slice().sort(), ys = SY.slice().sort(), at = (a, t) => a[Math.round((a.length - 1) * t)];
  const minX = at(xs, 0.01), maxX = at(xs, 0.99), minY = at(ys, 0.01), maxY = at(ys, 0.99);
  cam.zoom = Math.max(0.32, Math.min(2.6, Math.min((w * 0.88) / Math.max(48, maxX - minX), (h * 0.8) / Math.max(48, maxY - minY))));
  cam.ox = (w / 2 - (minX + maxX) / 2) * cam.zoom;
  cam.oy = (h / 2 - (minY + maxY) / 2) * cam.zoom;
}
// Fits the camera to TARGET, then glides there from wherever the nodes and camera are now.
function settle(resetAngles) {
  const from = { ...cam };
  POS.set(TARGET);
  fitGraph(resetAngles);
  if (!settled || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    settled = true; tween = null;
  } else {
    POS.set(START);
    tween = { t0: performance.now(), from, to: { ...cam } };
    Object.assign(cam, from);
  }
  invalidate();
}
function endTween() {
  if (!tween) return;
  POS.set(TARGET);
  Object.assign(cam, tween.to);
  tween = null;
}
function stepTween(now) {
  const t = Math.max(0, Math.min(1, (now - tween.t0) / 560)), e = 1 - (1 - t) ** 3;
  for (let i = 0; i < POS.length; i++) POS[i] = START[i] + (TARGET[i] - START[i]) * e;
  for (const k in tween.to) cam[k] = tween.from[k] + (tween.to[k] - tween.from[k]) * e;
  if (t < 1) invalidate(); else tween = null;
}
function roundedPath(c, x, y, w, h, r) {
  c.beginPath();
  if (typeof c.roundRect === 'function') c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
}
function sprite(w, h, paint) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  paint(c.getContext('2d'));
  return c;
}
// A shaded ball per colour and one drawn card per figure, so a frame is only drawImage calls.
function dotSprite(col) {
  if (!dotSprites.has(col)) dotSprites.set(col, sprite(DOT * 2, DOT * 2, g => {
    g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 8; g.shadowOffsetY = 4;
    g.fillStyle = col;
    g.beginPath(); g.arc(DOT, DOT, DOT_R, 0, Math.PI * 2); g.fill();
    g.shadowColor = 'transparent';
    const sheen = g.createRadialGradient(DOT - 7, DOT - 9, 1, DOT, DOT, DOT_R);
    sheen.addColorStop(0, 'rgba(255,255,255,.5)');
    sheen.addColorStop(0.6, 'rgba(255,255,255,.04)');
    sheen.addColorStop(1, 'rgba(0,0,0,.08)');
    g.fillStyle = sheen; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke();
  }));
  return dotSprites.get(col);
}
function cardSprite(n) {
  if (cardSprites.has(n.id)) return cardSprites.get(n.id);
  const im = figImage(n);
  if (!im) return null;
  const c = sprite(CARD_W, CARD_H, g => {
    roundedPath(g, 0, 0, CARD_W, CARD_H, 16);
    g.fillStyle = '#fff'; g.fill(); g.clip();
    const k = Math.max(CARD_W / im.naturalWidth, CARD_H / im.naturalHeight);
    g.drawImage(im, (CARD_W - im.naturalWidth * k) / 2, (CARD_H - im.naturalHeight * k) / 2, im.naturalWidth * k, im.naturalHeight * k);
  });
  cardSprites.set(n.id, c);
  return c;
}
const cardShadow = () => cardShadowSprite ||= sprite(CARD_W + 80, CARD_H + 80, g => {
  g.shadowColor = 'rgba(0,0,0,.2)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  roundedPath(g, 40, 40, CARD_W, CARD_H, 16);
  g.fillStyle = '#fff'; g.fill();
});
function drawCard(n, i) {
  const W = SRW[i] * 2, H = SRH[i] * 2, x = SX[i] - SRW[i], y = SY[i] - SRH[i], kx = W / CARD_W, ky = H / CARD_H;
  ctx.drawImage(cardShadow(), x - 40 * kx, y - 40 * ky, (CARD_W + 80) * kx, (CARD_H + 80) * ky);
  const card = cardSprite(n);
  if (card) ctx.drawImage(card, x, y, W, H);
  roundedPath(ctx, x, y, W, H, Math.min(8, W * 0.08));
  if (!card) { ctx.fillStyle = '#fff'; ctx.fill(); }
  ctx.lineWidth = n._selected || n.id === hoverId ? 2.5 : 1.25;
  ctx.strokeStyle = n._selected ? ACCENT : n._color;
  ctx.stroke();
}
function drawDot(n, i) {
  const r = SRW[i], k = r / DOT_R;
  ctx.drawImage(dotSprite(n._color), SX[i] - DOT * k, SY[i] - DOT * k, DOT * 2 * k, DOT * 2 * k);
  if (n.id !== hoverId) return;
  ctx.beginPath(); ctx.arc(SX[i], SY[i], r + 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 2; ctx.strokeStyle = ACCENT; ctx.stroke();
}
function floorPoint(x, y, z, w, h, start) {
  const x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
  const y2 = y * cosP - z1 * sinP, z2 = Math.max(-360, y * sinP + z1 * cosP);
  const s = FOCAL / (FOCAL + z2) * cam.zoom, sx = w / 2 + cam.ox + x1 * s, sy = h / 2 + cam.oy + y2 * s;
  if (start) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
}
function drawFloor(w, h) {
  const span = 288, step = 48, gy = 176, cx = w / 2 + cam.ox, cy = h / 2 + cam.oy;
  const fade = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.62);
  fade.addColorStop(0, 'rgba(60,60,67,.13)');
  fade.addColorStop(1, 'rgba(60,60,67,0)');
  ctx.beginPath();
  for (let i = -span; i <= span; i += step) {
    floorPoint(i, gy, -span, w, h, true); floorPoint(i, gy, span, w, h, false);
    floorPoint(-span, gy, i, w, h, true); floorPoint(span, gy, i, w, h, false);
  }
  ctx.lineWidth = 1; ctx.strokeStyle = fade; ctx.stroke();
}
function drawLinks() {
  ctx.lineCap = 'round';
  for (const hot of [0, 1]) {
    ctx.beginPath();
    for (let k = 0; k < HOT.length; k++) {
      if (HOT[k] !== hot) continue;
      const a = LINKS[k * 2], b = LINKS[k * 2 + 1];
      ctx.moveTo(SX[a], SY[a]); ctx.lineTo(SX[b], SY[b]);
    }
    ctx.lineWidth = hot ? 2 : 1;
    ctx.strokeStyle = hot ? 'rgba(0,113,227,.72)' : selectedSlot >= 0 ? 'rgba(60,60,67,.05)' : 'rgba(60,60,67,.1)';
    ctx.stroke();
  }
}
const shortLabel = n => {
  const s = String(n.label || n.id), cut = s.lastIndexOf(' ', 33);
  return s.length <= 34 ? s : s.slice(0, cut > 16 ? cut : 33).trimEnd() + '…';
};
function reserveOverlays() {
  const stage = canvas?.getBoundingClientRect();
  overlays = stage ? [...document.querySelectorAll('.atlas-hud,.atlas-hint')].map(el => el.getBoundingClientRect()).filter(r => r.width)
    .map(r => ({ x: r.left - stage.left, y: r.top - stage.top, w: r.width, h: r.height })) : [];
}
function drawLabel(n, i, w, h, boxes) {
  const pinned = n._selected || n.id === hoverId;
  n._short ||= shortLabel(n);
  n._tw ||= ctx.measureText(n._short).width;
  const lw = n._tw + 14, lh = 20, ly = Math.max(4, Math.min(h - lh - 4, SY[i] - lh / 2));
  let lx = SX[i] + SRW[i] + 6;
  if (lx + lw > w - 6) lx = SX[i] - SRW[i] - 6 - lw;
  if (lx < 4) { if (!pinned) return; lx = 4; }
  const hits = b => lx < b.x + b.w && lx + lw > b.x && ly < b.y + b.h && ly + lh > b.y;
  if (!pinned && (boxes.some(hits) || overlays.some(hits))) return;
  boxes.push({ x: lx, y: ly, w: lw, h: lh });
  roundedPath(ctx, lx, ly, lw, lh, 7);
  ctx.fillStyle = n._selected ? ACCENT : 'rgba(255,255,255,.94)';
  ctx.shadowColor = 'rgba(0,0,0,.14)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = n._selected ? '#fff' : '#1d1d1f';
  ctx.fillText(n._short, lx + 7, ly + 14);
}
function draw(now) {
  dirty = false;
  if (!ctx) return;
  try {
    if (tween) stepTween(now);
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2), nodes = currentData.nodes;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    projectAll(w, h);
    drawFloor(w, h);
    drawLinks();
    for (let k = 0; k < ORDER.length; k++) {
      const i = ORDER[k], n = nodes[i], depth = SS[i] / cam.zoom;
      ctx.globalAlpha = (n._dim ? (HASFIG[i] ? 0.4 : 0.3) : 1) * Math.max(0.3, Math.min(1, 0.28 + depth * 0.82));
      if (HASFIG[i]) drawCard(n, i); else drawDot(n, i);
    }
    ctx.globalAlpha = 1;
    ctx.font = '600 12px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif';
    const boxes = [];
    nodes.forEach((n, i) => { if (n._selected || n.id === hoverId) drawLabel(n, i, w, h, boxes); });
    let left = w < 720 ? 4 : 8;
    for (let k = ORDER.length - 1; k >= 0 && left > 0; k--) {
      const i = ORDER[k], n = nodes[i];
      if (n.type !== 'paper' || n._dim || n._selected || n.id === hoverId) continue;
      drawLabel(n, i, w, h, boxes); left--;
    }
  } catch (err) {
    if ($('status')) $('status').textContent = 'Graph error: ' + (err.message || err);
  }
}
function invalidate() {
  if (dirty) return;
  dirty = true;
  requestAnimationFrame(draw);
}
function hitTest(x, y) {
  for (let k = ORDER.length - 1; k >= 0; k--) {
    const i = ORDER[k];
    if (Math.abs(SX[i] - x) <= Math.max(8, SRW[i] + 4) && Math.abs(SY[i] - y) <= Math.max(8, SRH[i] + 4)) return currentData.nodes[i];
  }
  return null;
}
function updateHud() {
  const papers = currentData.nodes.filter(n => n.type === 'paper');
  $('status').innerHTML = `<b>${papers.length}</b> papers`;
  const [cmap, key] = COLOR_BY[$('colorby').value] || COLOR_BY.paradigm;
  const used = new Set(papers.map(key)), rows = Object.entries(cmap).filter(([k]) => used.has(k));
  if (cmap === yearColors) rows.sort(([a], [b]) => b.localeCompare(a));
  const gray = rows.filter(([, v]) => v === GRAY).map(([k]) => k).join(' · ');
  $('legend').innerHTML = `<b>${esc($('colorby').selectedOptions[0].textContent.replace('Color: ', ''))}</b>` + rows.filter(([, v]) => v !== GRAY).concat(gray ? [[gray, GRAY]] : []).map(([k,v]) => `<div class="legendrow"><span class="swatch" style="background:${v}"></span>${esc(k)}</div>`).join('');
  reserveOverlays();
}
const shelf = k => { try { return JSON.parse(localStorage.getItem('cml:' + k)) || {}; } catch { return {}; } };
const keep = (k, v) => { try { localStorage.setItem('cml:' + k, JSON.stringify(v)); } catch {} };
function toggleStatus(id, status) {
  const saved = shelf('saved'), read = shelf('read'), n = ALL.find(x => x.id === id);
  const on = status === 'read' ? read[id] : saved[id] && !read[id];
  delete saved[id]; delete read[id];
  if (!on && status === 'read') read[id] = new Date().toISOString().slice(0, 10);
  if (!on && status === 'saved' && n) saved[id] = n;
  keep('saved', saved); keep('read', read);
  renderPapers(); renderSelection();
}
function paperRow(p, figs, read) {
  const muted = `${esc(p.stack_layer || p.groups?.[0] || p.paradigm || '')}`;
  const brief = p.brief || p.summary || p.why || '';
  return `<button type="button" class="rowitem${p._selected ? ' active' : ''}${figs && p.figure ? ' has-fig' : ''}" data-node="${esc(p.id)}">${figs ? figureButton(p, false) : ''}<span class="row-text"><span>${read[p.id] ? '✓ ' : ''}${esc(p.label)}</span><span class="muted">${muted}</span><span class="row-brief">${esc(brief)}</span></span></button>`;
}
function renderPapers() {
  const papers = currentData.nodes.filter(n => n.type === 'paper').sort((a,b) => {
    return (b.year||0) - (a.year||0) || a.label.localeCompare(b.label);
  });
  const figs = $('showFigs')?.checked !== false, read = shelf('read');
  $('paper-count').textContent = papers.length;
  $('papers').classList.toggle('fig-list', figs);
  if (!papers.length) {
    $('papers').innerHTML = '<p class="muted">No papers match these filters.</p>';
    return;
  }
  let lastYear = null;
  const parts = [];
  papers.forEach(p => {
    const y = String(p.year || 'Undated');
    if (y !== lastYear) {
      lastYear = y;
      parts.push(`<div class="year-head">${esc(y)}</div>`);
    }
    parts.push(paperRow(p, figs, read));
  });
  $('papers').innerHTML = parts.join('');
}
function similarPapers(id) {
  return PAPER_LINKS.filter(l => l.source === id || l.target === id)
    .sort((a,b) => (b.score || 0) - (a.score || 0))
    .slice(0, 4)
    .map(l => {
      const oid = l.source === id ? l.target : l.source;
      const n = ALL.find(x => x.id === oid);
      return n ? { id: n.id, label: n.label, reason: l.reason } : null;
    }).filter(Boolean);
}
function renderSelection() {
  const box = $('selection');
  const n = currentData.nodes.find(x => x.id === currentSelection);
  if (!n) {
    box.hidden = true;
    $('side')?.classList.remove('has-fig-sel');
    document.querySelector('.atlas-shell')?.classList.remove('has-paper-fig');
    box.classList.remove('has-fig');
    return;
  }
  box.hidden = false;
  $('side')?.classList.toggle('has-fig-sel', n.type === 'paper' && !!n.figure);
  box.classList.toggle('has-fig', n.type === 'paper' && !!n.figure);
  if (n.type !== 'paper') {
    document.querySelector('.atlas-shell')?.classList.remove('has-paper-fig');
    box.innerHTML = `<div class="sel-card"><p class="eyebrow">${esc(n.type)}</p><h2>${esc(n.label)}</h2><p class="muted">Tap the same node again to clear focus.</p></div>`;
    return;
  }
  const near = similarPapers(n.id);
  document.querySelector('.atlas-shell')?.classList.toggle('has-paper-fig', n.type === 'paper' && !!n.figure);
  const read = !!shelf('read')[n.id], queued = !!shelf('saved')[n.id] && !read;
  box.innerHTML = `<div class="sel-card"><p class="eyebrow">${esc(n.year || '')} · ${esc(n.journal || '')}</p>
    <h2>${esc(n.full_title || n.label)}</h2>
    ${figureButton(n, true)}
    <p class="summary">${esc(n.summary || n.why || '')}</p>
    <div class="sheet-actions"><a class="primary" href="${esc(url(n.url))}" target="_blank" rel="noopener">Open paper ↗</a>
      <div class="seg" role="group" aria-label="Reading status"><button type="button" data-status="saved" data-id="${esc(n.id)}" class="${queued ? 'selected' : ''}">To Read</button><button type="button" data-status="read" data-id="${esc(n.id)}" class="${read ? 'selected' : ''}">${read ? 'Read ✓' : 'Read'}</button></div>
      <a href="./#${encodeURIComponent(n.id)}">Notes</a></div>
    ${near.length ? `<p class="eyebrow">Nearby papers</p><div class="near">${near.map(p => `<button type="button" class="rowitem" data-node="${esc(p.id)}"><span>${esc(p.label)}</span><span class="muted">${esc(p.reason || '')}</span></button>`).join('')}</div>` : ''}</div>`;
}
function buildData() {
  const types = new Set(VIEWS[$('view').value] || ['paper']);
  const papers = ALL.filter(n => n.type === 'paper' && types.has('paper') && paperVisible(n));
  const paperIds = new Set(papers.map(p => p.id));
  let nodes = papers.slice();
  if ($('view').value !== 'papers') {
    const linked = new Set();
    META.forEach(l => { if (paperIds.has(l.target)) linked.add(l.source); if (paperIds.has(l.source)) linked.add(l.target); });
    const extras = ALL.filter(n => n.type !== 'paper' && types.has(n.type) && linked.has(n.id));
    nodes = nodes.concat(extras);
  }
  const ids = new Set(nodes.map(n => n.id));
  const links = ($('view').value === 'papers'
    ? PAPER_LINKS.filter(l => ids.has(l.source) && ids.has(l.target) && l.density !== 'dense')
    : META.filter(l => ids.has(eid(l.source)) && ids.has(eid(l.target)))
  ).map(l => ({ ...l, source: eid(l.source), target: eid(l.target) }));
  currentData = { nodes: nodes.map(n => ({ ...n })), links };
  if (currentSelection && !currentData.nodes.some(n => n.id === currentSelection)) currentSelection = null;
  applyLayout($('layout').value);
  updateHud();
  renderPapers();
  renderSelection();
  persist();
}
function selectNode(id, opts = {}) {
  if (!opts.keep && currentSelection === id) { clearSelection(); return; }
  if (currentSelection === id) {
    const row = $('papers')?.querySelector(`[data-node="${CSS.escape(id)}"]`);
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  currentSelection = id;
  markSelection();
  markRow();
  renderSelection();
  const row = $('papers')?.querySelector(`[data-node="${CSS.escape(id)}"]`);
  row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (window.innerWidth <= 900) $('side').scrollIntoView({ behavior:'smooth', block:'start' });
}
function clearSelection() {
  currentSelection = null;
  markSelection();
  markRow();
  renderSelection();
}
function markRow() {
  document.querySelectorAll('#papers .active').forEach(r => r.classList.remove('active'));
  if (currentSelection) $('papers')?.querySelector(`[data-node="${CSS.escape(currentSelection)}"]`)?.classList.add('active');
}
function fillFilters(papers) {
  const chem = $('chemistry');
  [...new Set(papers.map(p => p.chemistry_class).filter(Boolean))].sort().forEach(c => chem.insertAdjacentHTML('beforeend', `<option>${esc(c)}</option>`));
  const box = $('story');
  const order = ['milo','descriptor_tools','computational_stack','representation','small_data','automation','physics','frontier_2026'];
  [...new Set([...order, ...Object.keys(STORIES)])].forEach(id => {
    const s = STORIES[id]; if (s) box.insertAdjacentHTML('beforeend', `<option value="${esc(id)}">${esc(s.label)}</option>`);
  });
}
function bindGraph() {
  canvas.addEventListener('pointerdown', e => {
    endTween();
    pointer.down = true; pointer.moved = false; pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.pan = e.shiftKey || e.altKey || e.button === 1 || e.button === 2;
    const r = canvas.getBoundingClientRect();
    pointer.id = pointer.pan ? null : (hitTest(e.clientX - r.left, e.clientY - r.top)?.id || null);
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = pointer.pan ? 'move' : 'grabbing';
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('pointermove', e => {
    if (!pointer.down) {
      const r = canvas.getBoundingClientRect(), id = hitTest(e.clientX - r.left, e.clientY - r.top)?.id || null;
      if (id !== hoverId) { hoverId = id; canvas.style.cursor = id ? 'pointer' : 'grab'; invalidate(); }
      return;
    }
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 4) pointer.moved = true;
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (pointer.pan) {
      const k = 0.95 / Math.max(0.35, cam.zoom);
      cam.tx -= dx * k * Math.cos(cam.yaw);
      cam.tz -= dx * k * Math.sin(cam.yaw);
      cam.ty += dy * k;
    } else {
      cam.yaw += dx * 0.008;
      cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch + dy * 0.008));
    }
    invalidate();
  });
  canvas.addEventListener('pointerup', e => {
    if (e.detail > 1) {
      pointer.down = false;
      pointer.pan = false;
      return;
    }
    if (pointer.down && !pointer.moved && !pointer.pan) {
      if (pointer.id) selectNode(pointer.id); else clearSelection();
    }
    pointer.down = false;
    pointer.pan = false;
    canvas.style.cursor = hoverId ? 'pointer' : 'grab';
  });
  canvas.addEventListener('dblclick', e => {
    const r = canvas.getBoundingClientRect();
    const n = hitTest(e.clientX - r.left, e.clientY - r.top);
    if (!n) return;
    cam.tx = n.x; cam.ty = n.y; cam.tz = n.z; cam.ox = cam.oy = 0;
    cam.zoom = Math.max(cam.zoom, 1.2);
    selectNode(n.id, { keep: true });
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    endTween();
    // Zoom about the cursor: the point under it stays put.
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const zoom = Math.max(0.22, Math.min(3.2, cam.zoom * Math.exp(-e.deltaY * 0.0016))), k = zoom / cam.zoom;
    cam.ox = x + (cam.ox - x) * k; cam.oy = y + (cam.oy - y) * k; cam.zoom = zoom;
    invalidate();
  }, { passive:false });
}
function bind() {
  ['view','year','chemistry'].forEach(id => $(id)?.addEventListener('change', () => { clearSelection(); buildData(); }));
  let typing;
  $('q').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => { clearSelection(); buildData(); }, 140); });
  $('showFigs')?.addEventListener('change', () => { applyLayout($('layout').value); renderPapers(); persist(); });
  $('layout').addEventListener('change', () => { persist(); applyLayout($('layout').value); });
  $('colorby').addEventListener('change', () => { updateHud(); markSelection(); persist(); });
  $('story').addEventListener('change', e => { activeStory = e.target.value || null; clearSelection(); buildData(); });
  $('center').addEventListener('click', () => { endTween(); START.set(POS); settle(false); });
  $('reset').addEventListener('click', () => {
    $('q').value = ''; $('view').value = 'papers'; $('layout').value = 'free'; $('colorby').value = 'paradigm';
    $('year').value = 'all'; $('chemistry').value = 'all'; $('story').value = '';
    if ($('showFigs')) $('showFigs').checked = true;
    activeStory = null;
    defaultCamera();
    clearSelection(); buildData();
  });
  $('close-fig')?.addEventListener('click', () => $('figbox')?.close());
  $('figbox')?.addEventListener('click', e => { if (e.target.id === 'figbox') $('figbox').close(); });
  document.addEventListener('click', e => {
    document.querySelectorAll('details.menu[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
    const st = e.target.closest('[data-status]');
    if (st) { toggleStatus(st.dataset.id, st.dataset.status); return; }
    const fig = e.target.closest('[data-fig]');
    if (fig) { e.preventDefault(); e.stopPropagation(); openFigure(fig.dataset.fig); return; }
    const row = e.target.closest('[data-node]'); if (row) selectNode(row.dataset.node);
  });
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ($('figbox')?.open) return;
    const t = e.target;
    if (t && (t.matches('input, select, textarea') || t.isContentEditable || t.closest('header, .atlas-controls'))) return;
    const rows = [...document.querySelectorAll('#papers [data-node]')];
    if (e.key === 'Escape') { clearSelection(); return; }
    if (!rows.length) return;
    const idx = rows.findIndex(el => el.dataset.node === currentSelection);
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const next = rows[Math.min(rows.length - 1, Math.max(0, idx) + (idx < 0 ? 0 : 1))];
      selectNode(next.dataset.node, { keep: true });
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prev = rows[Math.max(0, idx < 0 ? 0 : idx - 1)];
      selectNode(prev.dataset.node, { keep: true });
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectNode(rows[0].dataset.node, { keep: true });
    } else if (e.key === 'End') {
      e.preventDefault();
      selectNode(rows[rows.length - 1].dataset.node, { keep: true });
    }
  });
}
async function init() {
  bind();
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  $('graph').appendChild(canvas);
  ctx = canvas.getContext('2d');
  sizeCanvas();
  new ResizeObserver(sizeCanvas).observe($('graph'));
  window.addEventListener('resize', sizeCanvas);
  bindGraph();
  try {
    const r = await fetch('graph.json');
    if (!r.ok) throw Error();
    const graph = await r.json();
    ALL = graph.nodes; META = graph.edges || []; PAPER_LINKS = graph.paper_similarity_edges || []; STORIES = graph.stories || {};
    try {
      const added = JSON.parse(localStorage.getItem('cml:added') || '{}');
      const have = new Set(ALL.filter(n => n.type === 'paper' && n.doi).map(n => String(n.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase()));
      for (const p of Object.values(added)) {
        const d = String(p.doi || '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase();
        if (!d || have.has(d)) continue;
        ALL.push({ ...p, type: 'paper', added: true, id: p.id || ('doi:' + d), paradigm: p.paradigm || 'Other / mixed' });
        have.add(d);
      }
    } catch {}
    const papers = ALL.filter(n => n.type === 'paper'), count = {};
    papers.forEach(p => { const g = primaryGroup(p); count[g] = (count[g] || 0) + 1; });
    GROUPS = Object.keys(count).sort((a, b) => count[b] - count[a]);
    GROUPS.filter(g => g !== 'Other').slice(0, SERIES.length).forEach((g, i) => { groupColors[g] = SERIES[i]; });
    fillFilters(papers);
    restore();
    activeStory = null;
    buildData();
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && ALL.some(n => n.id === hashId)) selectNode(hashId);
  } catch {
    $('status').textContent = 'The atlas could not load.';
    $('papers').innerHTML = '<p class="muted">Reload the page to try again.</p>';
  }
}
init();
