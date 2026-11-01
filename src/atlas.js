const autoRotate = false;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eid = x => typeof x === 'object' && x ? x.id : x;
const url = s => { try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } };
function hash(s) { let h = 2166136261; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const paradigmColors = {
  'Physical / interpretable':'#78a9ff','3D / deep learning':'#d88cff','Mechanistic ML':'#69d1b2',
  'Ligand-space / screening':'#f0b45b','Bayesian / active learning':'#ff8177','Autonomous / HTE':'#ff5fa2',
  'Transfer / few-shot':'#85d66f','MLIP / TS acceleration':'#51c5dd','Inverse / generative':'#f7dd72','Other / mixed':'#9aa7b8'
};
const representationColors = {
  'Reusable ligand library':'#f0b45b','Physical / chemist descriptors':'#78a9ff','Conformer / ensemble descriptors':'#85d66f',
  'Catalyst-state / mechanistic':'#69d1b2','Learned 3D / TS GNN':'#d88cff','Pretrained learned representation':'#c2a3ff',
  'MLIP / physics acceleration':'#51c5dd','Dataset / experimental loop':'#ff5fa2','Overview / mixed':'#9aa7b8'
};
const stackColors = {
  'Ground-state conformers':'#7ad5a7','TS search':'#f0b45b','TS ensembles':'#ff8d72','Thermochemistry':'#78a9ff',
  'Descriptors':'#d68dff','Supervised model':'#68a9ff','Experiment selection':'#ff5fa2','MLIP / mechanism':'#51c5dd','Overview':'#9aa7b8'
};
const groupColors = {
  Milo:'#38c8ea',Sigman:'#f2bc5c',Doyle:'#d68dff',Hartwig:'#68a9ff',Kulik:'#7ad5a7',Corminboeuf:'#ff8d72',
  Schwaller:'#e078bc',Denmark:'#a0d66f',Reid:'#c2a3ff',Abolhasani:'#54d7c1',Sunoj:'#f3cd78',Pidko:'#7f9cff',
  Hong:'#ff9d78',Coley:'#9ad0ff',Duarte:'#7fd0b5',Cernak:'#e0a36b',Rajaraman:'#c9a6ff',Nova:'#7fb3d8',
  Glorius:'#f0c27a',Schreiner:'#8fd0a8',Woodward:'#f2a0b6','Alegre-Requena':'#9bb7e8',Paton:'#b7c8ee',
  Jorner:'#7ec8ff',Stuyver:'#c9e07a',Grimme:'#e8a06a',Cavallo:'#d4a574',Nolan:'#8ec4c0',Fey:'#b8a0e8',
  Aspuru:'#6ad0c8',White:'#c4b0ff',Reiher:'#8ab4f8',Margraf:'#f0a070',Hein:'#7ec8b8',Schoenebeck:'#e8b07a',
  Grzybowski:'#d080a8',Jensen:'#90c070',Poater:'#c8a060',Ess:'#a0c8e0',Jiang:'#b0a8d0',Other:'#9aa7b8'
};
const typeColors = { paper:'#f0c867', author:'#63a8ff', topic:'#64d59e', method:'#b991f0', workflow:'#ed80a5', program:'#34c9e8' };
const yearColors = { '2026':'#72a8ff','2025':'#7fd0b5','2024':'#edbf6a','2023':'#d590e8','2022':'#e47d78', Unknown:'#9aa7b8' };
const REPS = Object.keys(representationColors);
const STACKS = Object.keys(stackColors);
const VIEWS = { full:['paper','author','topic','method','workflow','program'], papers:['paper'], papers_authors:['paper','author'], papers_topics:['paper','topic'], papers_methods:['paper','method'], papers_workflows:['paper','workflow'] };

let ALL = [], META = [], PAPER_LINKS = [], STORIES = {};
let currentData = { nodes:[], links:[] }, currentSelection = null, activeStory = null;
let canvas, ctx, hoverId = null, layoutTicks = 0, layoutKind = 'free';
const cam = { yaw: -0.48, pitch: 0.58, zoom: 1, tx: 0, ty: 0, tz: 0, autoRotate };
const pointer = { down:false, x:0, y:0, moved:false, id:null, pan:false };
const figImgs = new Map();
let lastLayoutSize = { w: 0, h: 0 };
let relayouting = false;

const primaryGroup = n => n.type === 'paper' ? (n.groups?.[0] || 'Other') : 'Other';
const paperText = p => [p.label, p.full_title, p.chemistry, p.chemistry_class, p.paradigm, p.representation_class, p.stack_layer, p.data_size_bin, p.validation_type, p.why, p.summary, p.brief, p.ask_next, p.journal, (p.derived_authors||[]).join(' '), (p.groups||[]).join(' '), (p.derived_methods||[]).join(' '), (p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();

function colorMap() {
  const mode = $('colorby').value;
  return mode === 'paradigm' ? paradigmColors : mode === 'representation' ? representationColors : mode === 'stack' ? stackColors : mode === 'group' ? groupColors : mode === 'year' ? yearColors : typeColors;
}
function nodeColor(n) {
  const mode = $('colorby').value;
  if (n._dim) return '#3a4654';
  if (n._selected) return '#ffffff';
  if (mode === 'type' || n.type !== 'paper') return typeColors[n.type] || '#9aa7b8';
  if (mode === 'paradigm') return paradigmColors[n.paradigm] || '#9aa7b8';
  if (mode === 'representation') return representationColors[n.representation_class] || '#9aa7b8';
  if (mode === 'stack') return stackColors[n.stack_layer] || '#9aa7b8';
  if (mode === 'group') return groupColors[primaryGroup(n)] || groupColors.Other;
  if (mode === 'year') return yearColors[String(n.year)] || yearColors.Unknown;
  return '#9aa7b8';
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
  if ($('hideReviews').checked && ['review','perspective','viewpoint'].includes((n.paper_type || '').toLowerCase())) return false;
  if ($('chemistry').value !== 'all' && n.chemistry_class !== $('chemistry').value) return false;
  if ($('representation').value !== 'all' && n.representation_class !== $('representation').value) return false;
  if ($('stack') && $('stack').value !== 'all' && n.stack_layer !== $('stack').value) return false;
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
      year:$('year').value, chemistry:$('chemistry').value, representation:$('representation').value,
      stack:$('stack')?.value || 'all',
      density:$('density').value, labels:$('labels').value, story:activeStory,
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
      const el = $(k); if (el && v != null) el.value = v;
    }
  } catch {}
}
function figuresOn() { return $('showFigs')?.checked !== false; }
function figCaption(p) {
  if (p?.figure?.kind === 'toc') return p.figure.caption || 'Graphical abstract';
  return p?.figure?.caption || 'Figure 1';
}
function figImage(n) {
  if (!n?.figure?.src || !figuresOn()) return null;
  let im = figImgs.get(n.id);
  if (!im) {
    im = new Image();
    im.decoding = 'async';
    im.src = n.figure.src;
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
function fibonacciSphere(count, i, radius) {
  const n = Math.max(1, count);
  const phi = Math.acos(1 - 2 * (i + 0.5) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi) * 0.78,
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}
function paperSize(n, N) {
  const fig = figuresOn() && n.type === 'paper' && n.figure?.src;
  const base = fig ? Math.max(13, Math.min(24, 208 / Math.sqrt(Math.max(8, N)))) : Math.max(6, Math.min(11, 110 / Math.sqrt(Math.max(8, N))));
  n._rw = fig ? base : base * 0.62;
  n._rh = fig ? base * 0.74 : base * 0.62;
}
function packRect(members, x0, y0, x1, y1) {
  const N = Math.max(1, members.length);
  const W = Math.max(40, x1 - x0), H = Math.max(40, y1 - y0);
  const cols = Math.max(1, Math.ceil(Math.sqrt(N * (W / H))));
  const rows = Math.max(1, Math.ceil(N / cols));
  const dx = W / cols, dy = H / rows;
  const depth = Math.min(160, 28 + N * 1.1);
  members.slice().sort((a, b) => hash(a.id) - hash(b.id)).forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    n.x = x0 + (col + 0.5) * dx + ((hash(n.id) % 100) / 100 - 0.5) * dx * 0.18;
    n.y = y0 + (row + 0.5) * dy + ((hash(n.id + 'y') % 100) / 100 - 0.5) * dy * 0.18;
    n.z = ((hash(n.id + 'z') % 100) / 100 - 0.5) * depth;
    n.vx = n.vy = n.vz = 0;
    paperSize(n, N);
    n._rw = Math.min(n._rw, Math.min(dx, dy * 1.35) * (figuresOn() && n.figure?.src ? 0.36 : 0.16));
    n._rh = Math.min(n._rh, Math.min(dy, dx * 0.8) * (figuresOn() && n.figure?.src ? 0.34 : 0.16));
  });
  return { dx, dy };
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
    n.vx = n.vy = n.vz = 0;
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
    n.vx = n.vy = n.vz = 0;
    paperSize(n, N);
  });
  extras.forEach((n, i) => {
    const s = sunflower(Math.max(extras.length, 8), i);
    n.x = rx * 0.72 * s.x;
    n.y = 90 + s.y * 36;
    n.z = rz * 0.72 * s.y;
    n._rw = n._rh = 8;
    n.vx = n.vy = n.vz = 0;
  });
  lastLayoutSize = { w, h };
}
function seedPositions(nodes) {
  seedCloud(nodes);
}
function figureButton(p, large) {
  if (!p.figure?.src) return large ? '<p class="fig-missing muted">No open Figure 1 or abstract image for this paper.</p>' : '';
  const cap = figCaption(p);
  const kind = p.figure.kind === 'toc' ? 'Graphical abstract' : 'Figure 1';
  if (!large) return `<img class="fig-sm" src="${esc(p.figure.src)}" alt="${esc(cap)}" loading="lazy" decoding="async">`;
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
  cam.pitch = 0.58;
  cam.zoom = 1;
  cam.tx = 0;
  cam.ty = 0;
  cam.tz = 0;
}
function applyLayout(mode) {
  layoutKind = mode || 'free';
  const nodes = currentData.nodes;
  const ps = nodes.filter(n => n.type === 'paper');
  const { w, h } = stageSize();
  seedPositions(nodes);
  if (mode === 'year') {
    const years = [...new Set(ps.map(p => Number(p.year) || 0))].sort((a, b) => a - b);
    const colW = Math.max(102, (Math.min(w, 1100) * 0.9) / Math.max(1, years.length));
    years.forEach((y, yi) => {
      const members = ps.filter(p => (Number(p.year) || 0) === y);
      const cx = (yi - (years.length - 1) / 2) * colW;
      packVolume(members, cx - colW * 0.36, -h * 0.28, -110, cx + colW * 0.36, h * 0.28, 110);
    });
  } else if (mode === 'paradigm' || mode === 'representation' || mode === 'group' || mode === 'stack') {
    const cats = mode === 'paradigm' ? Object.keys(paradigmColors) : mode === 'representation' ? REPS : mode === 'stack' ? STACKS : Object.keys(groupColors);
    const key = n => mode === 'paradigm' ? n.paradigm : mode === 'representation' ? n.representation_class : mode === 'stack' ? n.stack_layer : primaryGroup(n);
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
  cam.tx = 0; cam.ty = 0; cam.tz = 0;
  layoutTicks = 0;
  fitGraph(false);
}
function stepForces() {
  if (layoutTicks <= 0) return;
  layoutTicks--;
  const nodes = currentData.nodes, links = currentData.links, n = nodes.length;
  if (!n) return;
  const clustered = layoutKind !== 'free';
  const byId = new Map(nodes.map(x => [x.id, x]));
  const minD = clustered ? 28 : 36;
  const bound = Math.max(260, 18 * Math.sqrt(n) * 4);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      let d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 1) d2 = 1;
      const d = Math.sqrt(d2);
      const rep = Math.min(0.06, 36 / d2);
      a.vx += dx * rep; a.vy += dy * rep; a.vz += dz * rep;
      b.vx -= dx * rep; b.vy -= dy * rep; b.vz -= dz * rep;
      if (d < minD) {
        const push = (minD - d) * 0.08;
        a.vx += (dx / d) * push; a.vy += (dy / d) * push; a.vz += (dz / d) * push;
        b.vx -= (dx / d) * push; b.vy -= (dy / d) * push; b.vz -= (dz / d) * push;
      }
    }
  }
  const rest = clustered ? 48 : 70;
  const linkK = clustered ? 0.002 : 0.0025;
  for (const l of links) {
    const a = byId.get(eid(l.source)), b = byId.get(eid(l.target)); if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const k = (dist - rest) * linkK;
    a.vx += dx * k; a.vy += dy * k; a.vz += dz * k;
    b.vx -= dx * k; b.vy -= dy * k; b.vz -= dz * k;
  }
  const grav = clustered ? 0.0008 : 0.0006;
  for (const p of nodes) {
    p.vx = (p.vx - p.x * grav) * 0.8;
    p.vy = (p.vy - p.y * grav) * 0.8;
    p.vz = (p.vz - p.z * grav) * 0.8;
    p.x = Math.max(-bound, Math.min(bound, p.x + p.vx));
    p.y = Math.max(-bound, Math.min(bound, p.y + p.vy));
    p.z = Math.max(-200, Math.min(200, p.z + p.vz));
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
      const a = (hash(p.id) / 0xffffffff) * Math.PI * 2;
      p.x = Math.cos(a) * 80; p.y = Math.sin(a) * 80; p.z = Math.sin(a * 1.7) * 70;
      p.vx = p.vy = p.vz = 0;
    }
  }
  if (layoutTicks === 0) fitGraph(false);
}
function figBox(n, s) {
  const hasFig = figuresOn() && n.type === 'paper' && n.figure?.src;
  const zoom = n._selected ? 1.22 : 1;
  if (hasFig) {
    const rw = Math.max(16, (n._rw || 28) * s * zoom);
    const rh = Math.max(12, (n._rh || 20) * s * zoom);
    return { r: rw, rw, rh, hasFig: true };
  }
  const r = Math.max(6, (n._rw || (n.type === 'paper' ? 11 : 7)) * s * zoom);
  return { r, rw: r, rh: r, hasFig: false };
}
function project(n, w, h) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const px = (n.x || 0) - cam.tx, py = (n.y || 0) - cam.ty - (n._selected ? 16 : 0), pz = (n.z || 0) - cam.tz;
  const x1 = px * cy - pz * sy;
  const z1 = px * sy + pz * cy;
  const y2 = py * cp - z1 * sp;
  const z2 = Math.max(-360, py * sp + z1 * cp);
  const focal = 620;
  const depth = focal / (focal + z2);
  const s = depth * cam.zoom;
  const box = figBox(n, s);
  const fog = Math.max(0.18, Math.min(1, 0.28 + depth * 0.82));
  return { x: w / 2 + x1 * s, y: h / 2 + y2 * s, z: z2, depth, fog, ...box };
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
}
function fitGraph(resetAngles) {
  const { w, h } = stageSize();
  if (resetAngles) defaultCamera();
  else { cam.tx = 0; cam.ty = 0; cam.tz = 0; }
  if (!currentData.nodes.length) { cam.zoom = 1; return; }
  const prev = cam.zoom;
  cam.zoom = 1;
  const xs = [], ys = [];
  for (const n of currentData.nodes) {
    const p = project(n, w, h);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    xs.push(p.x); ys.push(p.y);
  }
  if (!xs.length) { cam.zoom = prev || 1; return; }
  xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
  const pick = (arr, t) => arr[Math.max(0, Math.min(arr.length - 1, Math.round((arr.length - 1) * t)))];
  const minX = pick(xs, 0.05), maxX = pick(xs, 0.95);
  const minY = pick(ys, 0.05), maxY = pick(ys, 0.95);
  const bw = Math.max(48, maxX - minX), bh = Math.max(48, maxY - minY);
  cam.zoom = Math.max(0.32, Math.min(2.6, Math.min((w * 0.88) / bw, (h * 0.84) / bh)));
}
function nodePath(p) {
  ctx.beginPath();
  if (p.hasFig) {
    const x = p.x - p.rw, y = p.y - p.rh, ww = p.rw * 2, hh = p.rh * 2;
    if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, ww, hh, 7);
    else ctx.rect(x, y, ww, hh);
  } else ctx.arc(p.x, p.y, Math.max(6, p.r), 0, Math.PI * 2);
}
function drawNode(n, p) {
  const col = nodeColor(n);
  const im = p.hasFig ? figImage(n) : null;
  ctx.save();
  ctx.globalAlpha = (n._dim ? (im ? 0.42 : 0.22) : 1) * (p.fog ?? 1);
  if (p.depth) {
    ctx.shadowColor = 'rgba(0,0,0,' + (0.38 * p.fog).toFixed(3) + ')';
    ctx.shadowBlur = 10 * p.depth;
    ctx.shadowOffsetY = 5 * p.depth;
  }
  nodePath(p);
  ctx.fillStyle = '#0b1118';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (im) {
    ctx.save();
    nodePath(p);
    ctx.clip();
    const ir = im.naturalWidth / im.naturalHeight;
    const br = (p.rw * 2) / Math.max(1, p.rh * 2);
    let dw, dh;
    if (ir > br) { dh = p.rh * 2; dw = dh * ir; }
    else { dw = p.rw * 2; dh = dw / ir; }
    ctx.drawImage(im, p.x - dw / 2, p.y - dh / 2, dw, dh);
    ctx.restore();
  } else {
    nodePath(p);
    ctx.fillStyle = col;
    ctx.fill();
  }
  nodePath(p);
  ctx.lineWidth = n._selected || n.id === hoverId ? 3 : (p.hasFig ? 1.6 : 1);
  ctx.strokeStyle = n._selected ? '#fff' : (p.hasFig ? col : 'rgba(8,12,18,.7)');
  ctx.stroke();
  ctx.restore();
}
function drawFloor(w, h) {
  const dummy = (x, y, z) => project({ x, y, z, type: 'grid', _rw: 1, _rh: 1 }, w, h);
  const span = 240, step = 48, gy = 168;
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = -span; i <= span; i += step) {
    const a = dummy(i, gy, -span), b = dummy(i, gy, span);
    const c = dummy(-span, gy, i), d = dummy(span, gy, i);
    if (!Number.isFinite(a.x) || !Number.isFinite(b.x) || !Number.isFinite(c.x) || !Number.isFinite(d.x)) continue;
    ctx.strokeStyle = 'rgba(141,227,193,' + (0.035 + (1 - Math.abs(i) / span) * 0.05) + ')';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
  }
  ctx.restore();
}
function draw() {
  if (!ctx) { requestAnimationFrame(draw); return; }
  try {
    stepForces();
    if (autoRotate) cam.yaw += 0.004;
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#080c12';
    ctx.fillRect(0, 0, w, h);
    drawFloor(w, h);
    const proj = new Map(currentData.nodes.map(n => [n.id, project(n, w, h)]));
    ctx.lineCap = 'round';
    for (const l of currentData.links) {
      const a = proj.get(eid(l.source)), b = proj.get(eid(l.target));
      if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
      const fog = Math.min(a.fog, b.fog);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = l._highlight ? 'rgba(141,227,193,' + (0.55 + 0.4 * fog) + ')' : 'rgba(170,200,230,' + (0.08 + 0.16 * fog) + ')';
      ctx.lineWidth = l._highlight ? 2.2 : 1;
      ctx.stroke();
    }
    const ordered = currentData.nodes.slice().sort((a,b) => (proj.get(a.id)?.z || 0) - (proj.get(b.id)?.z || 0));
    const labels = $('labels')?.value || 'papers';
    const labeled = new Set();
    const papers = ordered.filter(n => n.type === 'paper');
    if (labels === 'papers') {
      papers.filter(n => n._selected || n.id === hoverId).forEach(n => labeled.add(n.id));
      const nearest = papers.slice().sort((a, b) => (proj.get(b.id)?.depth || 0) - (proj.get(a.id)?.depth || 0));
      const cap = figuresOn() ? (w < 720 ? 8 : 12) : (w < 720 ? 12 : 18);
      nearest.slice(0, cap).forEach(n => labeled.add(n.id));
    }
    const boxes = [];
    for (const n of ordered) {
      const p = proj.get(n.id);
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.r)) continue;
      drawNode(n, p);
      const show = labels === 'all' || (labels === 'papers' && labeled.has(n.id)) || (labels === 'selected' && n._selected) || n.id === hoverId;
      if (!show) continue;
      ctx.globalAlpha = p.fog ?? 1;
      ctx.font = (n._selected ? '700 ' : '600 ') + (n.type === 'paper' ? '12px ' : '11px ') + 'system-ui,sans-serif';
      const text = String(n.label || n.id).slice(0, 36);
      const tw = ctx.measureText(text).width;
      const lx = p.x + p.rw + 4, ly = p.y - 9, lw = tw + 10, lh = 18;
      const hit = boxes.some(b => lx < b.x + b.w && lx + lw > b.x && ly < b.y + b.h && ly + lh > b.y);
      if (hit && n.id !== hoverId && !n._selected) { ctx.globalAlpha = 1; continue; }
      boxes.push({x:lx,y:ly,w:lw,h:lh});
      ctx.fillStyle = 'rgba(8,12,18,.82)';
      ctx.fillRect(lx, ly, lw, lh);
      ctx.fillStyle = '#eef4fb';
      ctx.fillText(text, lx + 5, p.y + 4);
      ctx.globalAlpha = 1;
    }
  } catch (err) {
    if ($('status')) $('status').textContent = 'Graph error: ' + (err.message || err);
  }
  requestAnimationFrame(draw);
}
function hitTest(x, y) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  let best = null, bestZ = Infinity;
  for (const n of currentData.nodes) {
    const p = project(n, w, h);
    const dx = Math.abs(p.x - x) / Math.max(8, p.rw + 4);
    const dy = Math.abs(p.y - y) / Math.max(8, p.rh + 4);
    if (dx > 1 || dy > 1) continue;
    if (p.z < bestZ) { best = n; bestZ = p.z; }
  }
  return best;
}
function updateHud() {
  const papers = currentData.nodes.filter(n => n.type === 'paper');
  $('status').innerHTML = `<b>${currentData.nodes.length}</b> nodes · <b>${currentData.links.length}</b> links<br>${esc($('view').selectedOptions[0].textContent)} · ${papers.length} papers`;
  const cmap = colorMap(), used = new Set();
  if ($('colorby').value === 'type') currentData.nodes.forEach(n => used.add(n.type));
  else if ($('colorby').value === 'group') papers.forEach(n => used.add(primaryGroup(n)));
  else if ($('colorby').value === 'year') papers.forEach(n => used.add(String(n.year || 'Unknown')));
  else if ($('colorby').value === 'representation') papers.forEach(n => used.add(n.representation_class));
  else if ($('colorby').value === 'stack') papers.forEach(n => used.add(n.stack_layer));
  else papers.forEach(n => used.add(n.paradigm));
  $('legend').innerHTML = `<b>Color: ${esc($('colorby').value)}</b>` + Object.entries(cmap).filter(([k]) => used.has(k)).slice(0, 12).map(([k,v]) => `<div class="legendrow"><span class="swatch" style="background:${v}"></span>${esc(k)}</div>`).join('');
}
function paperRow(p, figs) {
  const muted = `${esc(p.stack_layer || p.groups?.[0] || p.paradigm || '')}`;
  const brief = p.brief || p.summary || p.why || '';
  return `<button type="button" class="rowitem${p._selected ? ' active' : ''}${figs && p.figure ? ' has-fig' : ''}" data-node="${esc(p.id)}">${figs ? figureButton(p, false) : ''}<span class="row-text"><span>${esc(p.label)}</span><span class="muted">${muted}</span><span class="row-brief">${esc(brief)}</span></span></button>`;
}
function renderPapers() {
  const papers = currentData.nodes.filter(n => n.type === 'paper').sort((a,b) => {
    return (b.year||0) - (a.year||0) || a.label.localeCompare(b.label);
  });
  const figs = $('showFigs')?.checked !== false;
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
    parts.push(paperRow(p, figs));
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
function viewStats(papers) {
  const hard = papers.filter(p => ['prospective experimental','autonomous closed-loop','scaffold / OOD'].includes(p.validation_type)).length;
  const small = papers.filter(p => p.data_size_bin === 'n < 50').length;
  const reps = {};
  papers.forEach(p => { const k = p.representation_class || 'unspecified'; reps[k] = (reps[k] || 0) + 1; });
  const topRep = Object.entries(reps).sort((a,b) => b[1] - a[1])[0];
  const chem = {};
  papers.forEach(p => { const k = p.chemistry_class || 'unspecified'; chem[k] = (chem[k] || 0) + 1; });
  const topChem = Object.entries(chem).sort((a,b) => b[1] - a[1])[0];
  return { hard, small, topRep, topChem, n: papers.length };
}
function renderSelection() {
  const box = $('selection');
  const n = currentData.nodes.find(x => x.id === currentSelection);
  if (!n) {
    const papers = currentData.nodes.filter(x => x.type === 'paper');
    const s = viewStats(papers);
    box.hidden = false;
    $('side')?.classList.remove('has-fig-sel');
    document.querySelector('.atlas-shell')?.classList.remove('has-paper-fig');
    box.classList.remove('has-fig');
    box.innerHTML = papers.length ? `<div class="sel-card"><p class="eyebrow">This view</p>
      <p class="view-stats"><b>${s.n}</b> papers · <b>${papers.filter(p=>p.figure).length}</b> with an open figure · <b>${s.hard}</b> prospective/OOD/closed-loop</p>
      <p class="muted">${s.topChem ? `Most papers: ${esc(s.topChem[0])} (${s.topChem[1]}).` : ''} ${s.topRep ? `Dominant representation: ${esc(s.topRep[0])}.` : ''}</p>
      <p class="prompt">Drag to rotate the cloud. Shift-drag or right-drag pans. Scroll zooms. Fit keeps this 3D angle; Reset restores it. Arrow keys or J/K walk the list.</p></div>` : '';
    if (!papers.length) box.hidden = true;
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
  box.innerHTML = `<div class="sel-card"><p class="eyebrow">${esc(n.year || '')} · ${esc(n.journal || '')}</p>
    <h2>${esc(n.label)}</h2>
    ${figureButton(n, true)}
    ${n.full_title && n.full_title !== n.label ? `<p class="sel-full muted">${esc(n.full_title)}</p>` : ''}
    <p class="fact-strip"><span><i>n</i>${esc(n.data_size_bin || 'unspecified')}</span><span><i>Checked</i>${esc(n.validation_type || 'unspecified')}</span><span><i>Layer</i>${esc(n.stack_layer || 'unspecified')}</span></p>
    <p class="summary">${esc(n.summary || n.why || '')}</p>
    <p class="prompt">${esc(n.ask_next || '')}</p>
    <p class="muted">${esc(n.use_for || '')}</p>
    <dl class="mini">
      ${n.stack_layer ? `<dt>Layer</dt><dd>${esc(n.stack_layer)}</dd>` : ''}
      ${n.data_regime ? `<dt>Data</dt><dd>${esc(n.data_size_bin ? n.data_size_bin + ' · ' : '')}${esc(n.data_regime)}</dd>` : ''}
      ${n.validation ? `<dt>Checked</dt><dd>${esc(n.validation_type ? n.validation_type + ' · ' : '')}${esc(n.validation)}</dd>` : ''}
    </dl>
    <div class="tags">${[n.chemistry_class, n.representation_class, n.stack_layer, n.paradigm, ...(n.groups||[]).filter(g => g !== 'Other')].filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${near.length ? `<p class="eyebrow">Nearby papers</p><div class="near">${near.map(p => `<button type="button" class="rowitem" data-node="${esc(p.id)}"><span>${esc(p.label)}</span><span class="muted">${esc(p.reason || '')}</span></button>`).join('')}</div>` : ''}
    <div class="actions"><a class="primary" href="${esc(url(n.url))}" target="_blank" rel="noopener">Read paper ↗</a><button type="button" id="clear-focus">Clear focus</button></div></div>`;
}
function paintGraph() { updateHud(); }
function buildData() {
  const types = new Set(VIEWS[$('view').value] || ['paper']);
  const papers = ALL.filter(n => n.type === 'paper' && types.has('paper') && paperVisible(n));
  const paperIds = new Set(papers.map(p => p.id));
  let nodes = papers.slice();
  if ($('view').value !== 'papers') {
    const extras = ALL.filter(n => n.type !== 'paper' && types.has(n.type) && META.some(l =>
      (l.source === n.id && paperIds.has(l.target)) || (l.target === n.id && paperIds.has(l.source))
    ));
    nodes = nodes.concat(extras);
  }
  const ids = new Set(nodes.map(n => n.id));
  const density = { sparse:1, normal:2, dense:3 }[$('density').value] || 2;
  let links = ($('view').value === 'papers'
    ? PAPER_LINKS.filter(l => ids.has(l.source) && ids.has(l.target) && ({sparse:1,normal:2,dense:3}[l.density] || 2) <= density)
    : META.filter(l => ids.has(eid(l.source)) && ids.has(eid(l.target)))
  ).map(l => ({ ...l, source: eid(l.source), target: eid(l.target) }));
  if ($('hideIsolates').checked) {
    const deg = new Set();
    links.forEach(l => { deg.add(l.source); deg.add(l.target); });
    nodes = nodes.filter(n => deg.has(n.id) || n.added);
    const keep = new Set(nodes.map(n => n.id));
    links = links.filter(l => keep.has(l.source) && keep.has(l.target));
  }
  currentData = { nodes: nodes.map(n => ({ ...n, _dim:false, _selected:n.id === currentSelection })), links };
  if (currentSelection && !currentData.nodes.some(n => n.id === currentSelection)) currentSelection = null;
  if (currentSelection) {
    const keep = neighborhood(currentSelection, Number($('focus').value));
    currentData.nodes.forEach(n => { n._selected = n.id === currentSelection; n._dim = !keep.has(n.id); });
    currentData.links.forEach(l => { l._highlight = eid(l.source) === currentSelection || eid(l.target) === currentSelection; });
  }
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
  const keep = neighborhood(id, Number($('focus').value));
  currentData.nodes.forEach(n => { n._selected = n.id === id; n._dim = !keep.has(n.id); });
  currentData.links.forEach(l => { l._highlight = eid(l.source) === id || eid(l.target) === id; });
  renderPapers();
  renderSelection();
  const row = $('papers')?.querySelector(`[data-node="${CSS.escape(id)}"]`);
  row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (window.innerWidth <= 900) $('side').scrollIntoView({ behavior:'smooth', block:'start' });
}
function clearSelection() {
  currentSelection = null;
  currentData.nodes.forEach(n => { n._selected = false; n._dim = false; });
  currentData.links.forEach(l => { l._highlight = false; });
  renderPapers();
  renderSelection();
}
function fillFilters(papers) {
  const chem = $('chemistry');
  [...new Set(papers.map(p => p.chemistry_class).filter(Boolean))].sort().forEach(c => chem.insertAdjacentHTML('beforeend', `<option>${esc(c)}</option>`));
  const rep = $('representation');
  REPS.filter(r => papers.some(p => p.representation_class === r)).forEach(r => rep.insertAdjacentHTML('beforeend', `<option>${esc(r)}</option>`));
  const stack = $('stack');
  if (stack) STACKS.filter(s => papers.some(p => p.stack_layer === s)).forEach(s => stack.insertAdjacentHTML('beforeend', `<option>${esc(s)}</option>`));
  const bar = $('storybar');
  const order = ['milo','descriptor_tools','computational_stack','representation','small_data','automation','physics','frontier_2026'];
  [...new Set([...order, ...Object.keys(STORIES)])].forEach(id => {
    const s = STORIES[id]; if (!s) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'story'; b.dataset.story = id; b.textContent = s.label; b.title = s.description || '';
    b.addEventListener('click', () => { activeStory = activeStory === id ? null : id; document.querySelectorAll('[data-story]').forEach(x => x.classList.toggle('active', x.dataset.story === activeStory)); clearSelection(); buildData(); });
    bar.appendChild(b);
  });
}
function bindGraph() {
  canvas.addEventListener('pointerdown', e => {
    pointer.down = true; pointer.moved = false; pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.pan = e.shiftKey || e.altKey || e.button === 1 || e.button === 2;
    const r = canvas.getBoundingClientRect();
    pointer.id = pointer.pan ? null : (hitTest(e.clientX - r.left, e.clientY - r.top)?.id || null);
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = pointer.pan ? 'move' : 'grabbing';
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const n = hitTest(e.clientX - r.left, e.clientY - r.top);
    hoverId = n?.id || null;
    if (!pointer.down) canvas.style.cursor = hoverId ? 'pointer' : 'grab';
    if (!pointer.down) return;
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
    cam.tx = n.x; cam.ty = n.y; cam.tz = n.z;
    cam.zoom = Math.max(cam.zoom, 1.2);
    selectNode(n.id, { keep: true });
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    cam.zoom = Math.max(0.22, Math.min(3.2, cam.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
  }, { passive:false });
}
function bind() {
  ['q','view','year','density','chemistry','representation','stack','hideReviews','hideIsolates'].forEach(id =>
    $(id)?.addEventListener(id === 'q' ? 'input' : 'change', () => { clearSelection(); buildData(); }));
  $('showFigs')?.addEventListener('change', () => { applyLayout($('layout').value); renderPapers(); persist(); });
  $('layout').addEventListener('change', () => { persist(); applyLayout($('layout').value); });
  $('colorby').addEventListener('change', () => { paintGraph(); persist(); });
  $('labels').addEventListener('change', persist);
  $('focus').addEventListener('change', () => { if (currentSelection) { const id = currentSelection; currentSelection = null; selectNode(id); } });
  $('center').addEventListener('click', () => fitGraph(false));
  $('reset').addEventListener('click', () => {
    $('q').value = ''; $('view').value = 'papers'; $('layout').value = 'free'; $('colorby').value = 'paradigm';
    $('year').value = 'all'; $('chemistry').value = 'all'; $('representation').value = 'all';
    if ($('stack')) $('stack').value = 'all';
    $('density').value = 'normal';
    $('labels').value = 'papers'; $('focus').value = '1'; $('hideReviews').checked = false; $('hideIsolates').checked = false;
    if ($('showFigs')) $('showFigs').checked = true;
    activeStory = null; document.querySelectorAll('[data-story]').forEach(x => x.classList.remove('active'));
    defaultCamera();
    clearSelection(); buildData();
  });
  $('close-fig')?.addEventListener('click', () => $('figbox')?.close());
  $('figbox')?.addEventListener('click', e => { if (e.target.id === 'figbox') $('figbox').close(); });
  document.addEventListener('click', e => {
    if (e.target.id === 'clear-focus') { clearSelection(); return; }
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
  requestAnimationFrame(draw);
  window.__atlasDebug = () => ({ nodes: currentData.nodes.map(n => ({id:n.id, x:n.x, y:n.y, z:n.z, hasFig:!!n.figure?.src})), cam, size: lastLayoutSize });
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
    ALL.filter(n => n.figure?.src).forEach(n => { const img = new Image(); img.src = n.figure.src; });
    fillFilters(ALL.filter(n => n.type === 'paper'));
    restore();
    if ($('labels').value === 'selected') $('labels').value = 'papers';
    activeStory = null;
    document.querySelectorAll('[data-story]').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('[data-story]').forEach(x => x.classList.toggle('active', x.dataset.story === activeStory));
    buildData();
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && ALL.some(n => n.id === hashId)) selectNode(hashId);
  } catch {
    $('status').textContent = 'The atlas could not load.';
    $('papers').innerHTML = '<p class="muted">Reload the page to try again.</p>';
  }
}
init();
