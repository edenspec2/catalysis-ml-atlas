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
const groupColors = {
  Milo:'#38c8ea',Sigman:'#f2bc5c',Doyle:'#d68dff',Hartwig:'#68a9ff',Kulik:'#7ad5a7',Corminboeuf:'#ff8d72',
  Schwaller:'#e078bc',Denmark:'#a0d66f',Reid:'#c2a3ff',Abolhasani:'#54d7c1',Sunoj:'#f3cd78',Pidko:'#7f9cff',
  Hong:'#ff9d78',Coley:'#9ad0ff',Duarte:'#7fd0b5',Cernak:'#e0a36b',Rajaraman:'#c9a6ff',Nova:'#7fb3d8',
  Glorius:'#f0c27a',Schreiner:'#8fd0a8',Woodward:'#f2a0b6','Alegre-Requena':'#9bb7e8',Other:'#9aa7b8'
};
const typeColors = { paper:'#f0c867', author:'#63a8ff', topic:'#64d59e', method:'#b991f0', workflow:'#ed80a5', program:'#34c9e8' };
const yearColors = { '2026':'#72a8ff','2025':'#7fd0b5','2024':'#edbf6a','2023':'#d590e8','2022':'#e47d78', Unknown:'#9aa7b8' };
const REPS = Object.keys(representationColors);
const VIEWS = { full:['paper','author','topic','method','workflow','program'], papers:['paper'], papers_authors:['paper','author'], papers_topics:['paper','topic'], papers_methods:['paper','method'], papers_workflows:['paper','workflow'] };

let ALL = [], META = [], PAPER_LINKS = [], STORIES = {};
let currentData = { nodes:[], links:[] }, currentSelection = null, activeStory = null;
let canvas, ctx, hoverId = null, layoutTicks = 0, layoutKind = 'free';
const cam = { yaw: 0.42, pitch: 0.18, zoom: 1, autoRotate };
const pointer = { down:false, x:0, y:0, moved:false, id:null };

const primaryGroup = n => n.type === 'paper' ? (n.groups?.[0] || 'Other') : 'Other';
const paperText = p => [p.label, p.full_title, p.chemistry, p.chemistry_class, p.paradigm, p.representation_class, p.why, p.summary, p.brief, p.ask_next, p.journal, (p.derived_authors||[]).join(' '), (p.groups||[]).join(' '), (p.derived_methods||[]).join(' '), (p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();

function colorMap() {
  const mode = $('colorby').value;
  return mode === 'paradigm' ? paradigmColors : mode === 'representation' ? representationColors : mode === 'group' ? groupColors : mode === 'year' ? yearColors : typeColors;
}
function nodeColor(n) {
  const mode = $('colorby').value;
  if (n._dim) return '#3a4654';
  if (n._selected) return '#ffffff';
  if (mode === 'type' || n.type !== 'paper') return typeColors[n.type] || '#9aa7b8';
  if (mode === 'paradigm') return paradigmColors[n.paradigm] || '#9aa7b8';
  if (mode === 'representation') return representationColors[n.representation_class] || '#9aa7b8';
  if (mode === 'group') return groupColors[primaryGroup(n)] || groupColors.Other;
  if (mode === 'year') return yearColors[String(n.year)] || yearColors.Unknown;
  return '#9aa7b8';
}
function storyMatch(p) {
  if (!activeStory) return true;
  const s = STORIES[activeStory]; if (!s) return true;
  if (s.filter?.years && !s.filter.years.includes(Number(p.year))) return false;
  if (s.filter?.relevance && !s.filter.relevance.includes(p.relevance)) return false;
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
function figureButton(p, large) {
  if (!p.figure?.src) return large ? '<p class="fig-missing muted">No open Figure 1 or abstract image for this paper.</p>' : '';
  const cap = p.figure.caption || (p.figure.kind === 'toc' ? 'Graphical abstract' : 'Figure 1');
  if (!large) return `<img class="fig-sm" src="${esc(p.figure.src)}" alt="" loading="lazy" decoding="async">`;
  return `<button type="button" class="fig fig-lg" data-fig="${esc(p.id)}" aria-label="Enlarge ${esc(cap)}"><img src="${esc(p.figure.src)}" alt="${esc(cap)}" loading="eager" decoding="async"></button><p class="fig-cap">${esc(cap)}</p>`;
}
function openFigure(id) {
  const n = ALL.find(x => x.id === id);
  if (!n?.figure?.src || !$('figbox')) return;
  $('figbox-img').src = n.figure.src;
  $('figbox-img').alt = n.figure.caption || 'Figure 1';
  $('figbox-cap').textContent = (n.full_title || n.label) + ' · ' + (n.figure.caption || 'Figure 1');
  if (!$('figbox').open) $('figbox').showModal();
}
function seedPositions(nodes) {
  const N = Math.max(1, nodes.length);
  const minSep = 40;
  const R = minSep * Math.sqrt(N / Math.PI) * 1.2;
  nodes.slice().sort((a,b) => hash(a.id) - hash(b.id)).forEach((n, i) => {
    const k = i + 0.5;
    const r = R * Math.sqrt(k / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * k;
    n.x = r * Math.cos(theta);
    n.y = r * Math.sin(theta);
    n.z = ((hash(n.id) % 100) / 100 - .5) * 10;
    n.vx = n.vy = n.vz = 0;
  });
}
function applyLayout(mode) {
  layoutKind = mode || 'free';
  const nodes = currentData.nodes;
  const ps = nodes.filter(n => n.type === 'paper');
  seedPositions(nodes);
  if (mode === 'year') {
    const years = [...new Set(ps.map(p => Number(p.year) || 0))].sort((a,b) => a - b);
    const yi = Object.fromEntries(years.map((y,i) => [y,i]));
    const col = Math.max(90, 520 / Math.max(1, years.length));
    nodes.forEach(n => {
      if (n.type !== 'paper') return;
      n.x = (yi[Number(n.year) || 0] - (years.length - 1) / 2) * col;
      n.y = ((hash(n.id) % 1000) / 1000 - .5) * 220;
      n.z = ((hash(n.id + 'z') % 1000) / 1000 - .5) * 36;
      n.vx = n.vy = n.vz = 0;
    });
    layoutTicks = 20;
  } else if (mode === 'paradigm' || mode === 'representation' || mode === 'group') {
    const cats = mode === 'paradigm' ? Object.keys(paradigmColors) : mode === 'representation' ? REPS : Object.keys(groupColors);
    const key = n => mode === 'paradigm' ? n.paradigm : mode === 'representation' ? n.representation_class : primaryGroup(n);
    const list = cats.filter(c => ps.some(p => key(p) === c));
    const ci = Object.fromEntries(list.map((x,i) => [x,i]));
    const ring = Math.max(140, 22 * Math.sqrt(ps.length));
    nodes.forEach(n => {
      if (n.type !== 'paper') return;
      const a = 2 * Math.PI * (ci[key(n)] || 0) / Math.max(1, list.length);
      const jitter = 18 + (hash(n.id) % 28);
      n.x = ring * Math.cos(a) + ((hash(n.id) % 100) / 100 - .5) * jitter;
      n.y = ring * Math.sin(a) + ((hash(n.id + 'y') % 100) / 100 - .5) * jitter;
      n.z = ((hash(n.id + 'z') % 1000) / 1000 - .5) * 40;
      n.vx = n.vy = n.vz = 0;
    });
    layoutTicks = 20;
  } else layoutTicks = 0;
  fitGraph(true);
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
      a.vx += dx * rep; a.vy += dy * rep; a.vz += dz * rep * 0.4;
      b.vx -= dx * rep; b.vy -= dy * rep; b.vz -= dz * rep * 0.4;
      if (d < minD) {
        const push = (minD - d) * 0.08;
        a.vx += (dx / d) * push; a.vy += (dy / d) * push;
        b.vx -= (dx / d) * push; b.vy -= (dy / d) * push;
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
    a.vx += dx * k; a.vy += dy * k; a.vz += dz * k * 0.3;
    b.vx -= dx * k; b.vy -= dy * k; b.vz -= dz * k * 0.3;
  }
  const grav = clustered ? 0.0008 : 0.0006;
  for (const p of nodes) {
    p.vx = (p.vx - p.x * grav) * 0.8;
    p.vy = (p.vy - p.y * grav) * 0.8;
    p.vz = (p.vz - p.z * grav) * 0.8;
    p.x = Math.max(-bound, Math.min(bound, p.x + p.vx));
    p.y = Math.max(-bound, Math.min(bound, p.y + p.vy));
    p.z = Math.max(-28, Math.min(28, p.z + p.vz));
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
      const a = (hash(p.id) / 0xffffffff) * Math.PI * 2;
      p.x = Math.cos(a) * 80; p.y = Math.sin(a) * 80; p.z = 0;
      p.vx = p.vy = p.vz = 0;
    }
  }
  if (layoutTicks === 0) fitGraph(false);
}
function project(n, w, h) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const x1 = n.x * cy - n.z * sy;
  const z1 = n.x * sy + n.z * cy;
  const y2 = n.y * cp - z1 * sp;
  const z2 = Math.max(-520, n.y * sp + z1 * cp);
  const depth = 900 / (900 + z2);
  const s = depth * cam.zoom;
  const r = (n.type === 'paper' ? 12 : 7) * Math.min(1.35, depth) * (n._selected ? 1.35 : 1);
  return { x: w / 2 + x1 * s, y: h / 2 + y2 * s, r, z: z2, depth };
}
function sizeCanvas() {
  const el = $('graph');
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
}
function fitGraph(resetAngles) {
  const el = $('graph');
  const w = el?.clientWidth || canvas?.clientWidth || 800;
  const h = el?.clientHeight || canvas?.clientHeight || 500;
  if (resetAngles) { cam.yaw = 0.42; cam.pitch = 0.18; }
  if (!currentData.nodes.length) { cam.zoom = 1.2; return; }
  const prev = cam.zoom;
  cam.zoom = 1;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of currentData.nodes) {
    const p = project(n, w, h);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    minX = Math.min(minX, p.x - p.r); maxX = Math.max(maxX, p.x + p.r);
    minY = Math.min(minY, p.y - p.r); maxY = Math.max(maxY, p.y + p.r);
  }
  if (!Number.isFinite(minX)) { cam.zoom = prev || 1.2; return; }
  const bw = Math.max(48, maxX - minX), bh = Math.max(48, maxY - minY);
  cam.zoom = Math.max(0.45, Math.min(4.2, Math.min((w * 0.88) / bw, (h * 0.86) / bh)));
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
    const proj = new Map(currentData.nodes.map(n => [n.id, project(n, w, h)]));
    ctx.lineCap = 'round';
    for (const l of currentData.links) {
      const a = proj.get(eid(l.source)), b = proj.get(eid(l.target));
      if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = l._highlight ? 'rgba(141,227,193,.95)' : 'rgba(170,200,230,.55)';
      ctx.lineWidth = l._highlight ? 2.4 : 1.6;
      ctx.stroke();
    }
    const ordered = currentData.nodes.slice().sort((a,b) => (proj.get(a.id)?.z || 0) - (proj.get(b.id)?.z || 0));
    const labels = $('labels')?.value || 'papers';
    const labeled = new Set();
    const papers = ordered.filter(n => n.type === 'paper');
    if (labels === 'papers') {
      const cap = w < 720 ? 14 : papers.length <= 80 ? papers.length : 28;
      papers.slice(-cap).forEach(n => labeled.add(n.id));
    }
    const boxes = [];
    for (const n of ordered) {
      const p = proj.get(n.id);
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.r)) continue;
      const col = nodeColor(n);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(6.5, Math.min(20, p.r)), 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.globalAlpha = n._dim ? 0.28 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = n._selected || n.id === hoverId ? 2.5 : 1;
      ctx.strokeStyle = n._selected ? '#fff' : 'rgba(8,12,18,.7)';
      ctx.stroke();
      const show = labels === 'all' || (labels === 'papers' && labeled.has(n.id)) || (labels === 'selected' && n._selected) || n.id === hoverId;
      if (show) {
        ctx.font = (n._selected ? '700 ' : '600 ') + (n.type === 'paper' ? '12px ' : '11px ') + 'system-ui,sans-serif';
        const text = String(n.label || n.id).slice(0, 36);
        const tw = ctx.measureText(text).width;
        const lx = p.x + p.r + 4, ly = p.y - 9, lw = tw + 10, lh = 18;
        const hit = boxes.some(b => lx < b.x + b.w && lx + lw > b.x && ly < b.y + b.h && ly + lh > b.y);
        if (hit && n.id !== hoverId && !n._selected) continue;
        boxes.push({x:lx,y:ly,w:lw,h:lh});
        ctx.fillStyle = 'rgba(8,12,18,.82)';
        ctx.fillRect(lx, ly, lw, lh);
        ctx.fillStyle = '#eef4fb';
        ctx.fillText(text, lx + 5, p.y + 4);
      }
    }
  } catch (err) {
    if ($('status')) $('status').textContent = 'Graph error: ' + (err.message || err);
  }
  requestAnimationFrame(draw);
}
function hitTest(x, y) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  let best = null, bestD = 18;
  for (const n of currentData.nodes) {
    const p = project(n, w, h);
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < Math.max(bestD, p.r + 6)) { best = n; bestD = d; }
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
  else papers.forEach(n => used.add(n.paradigm));
  $('legend').innerHTML = `<b>Color: ${esc($('colorby').value)}</b>` + Object.entries(cmap).filter(([k]) => used.has(k)).slice(0, 12).map(([k,v]) => `<div class="legendrow"><span class="swatch" style="background:${v}"></span>${esc(k)}</div>`).join('');
}
function renderPapers() {
  const papers = currentData.nodes.filter(n => n.type === 'paper').sort((a,b) => (b.year||0) - (a.year||0) || a.label.localeCompare(b.label));
  const figs = $('showFigs')?.checked !== false;
  $('paper-count').textContent = papers.length;
  $('papers').classList.toggle('fig-list', figs);
  $('papers').innerHTML = papers.length
    ? papers.map(p => `<button type="button" class="rowitem${p._selected ? ' active' : ''}${figs && p.figure ? ' has-fig' : ''}" data-node="${esc(p.id)}">${figs ? figureButton(p, false) : ''}<span class="row-text"><span>${esc(p.label)}</span><span class="muted">${esc(p.year || '')} · ${esc(p.groups?.[0] || p.paradigm || '')}</span><span class="row-brief">${esc(p.brief || p.summary || p.why || '')}</span></span></button>`).join('')
    : '<p class="muted">No papers match these filters.</p>';
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
      <p class="prompt">All ${s.n} papers are in the graph and in the list. Use Fit if they look bunched. Timeline or paradigm layouts spread them further.</p></div>` : '';
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
    <p class="summary">${esc(n.summary || n.why || '')}</p>
    <p class="prompt">${esc(n.ask_next || '')}</p>
    <p class="muted">${esc(n.use_for || '')}</p>
    <dl class="mini">
      ${n.data_regime ? `<dt>Data</dt><dd>${esc(n.data_size_bin ? n.data_size_bin + ' · ' : '')}${esc(n.data_regime)}</dd>` : ''}
      ${n.validation ? `<dt>Checked</dt><dd>${esc(n.validation_type ? n.validation_type + ' · ' : '')}${esc(n.validation)}</dd>` : ''}
    </dl>
    <div class="tags">${[n.chemistry_class, n.representation_class, n.paradigm, ...(n.groups||[]).filter(g => g !== 'Other')].filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
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
function selectNode(id) {
  if (currentSelection === id) { clearSelection(); return; }
  currentSelection = id;
  const keep = neighborhood(id, Number($('focus').value));
  currentData.nodes.forEach(n => { n._selected = n.id === id; n._dim = !keep.has(n.id); });
  currentData.links.forEach(l => { l._highlight = eid(l.source) === id || eid(l.target) === id; });
  renderPapers();
  renderSelection();
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
  const bar = $('storybar');
  const order = ['milo','chemist_frames','representation','small_data','automation','physics','frontier_2026'];
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
    const r = canvas.getBoundingClientRect();
    pointer.id = hitTest(e.clientX - r.left, e.clientY - r.top)?.id || null;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const n = hitTest(e.clientX - r.left, e.clientY - r.top);
    hoverId = n?.id || null;
    canvas.style.cursor = hoverId ? 'pointer' : 'grab';
    if (!pointer.down) return;
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 4) pointer.moved = true;
    pointer.x = e.clientX; pointer.y = e.clientY;
    cam.yaw += dx * 0.008;
    cam.pitch = Math.max(-1.1, Math.min(1.1, cam.pitch + dy * 0.008));
  });
  canvas.addEventListener('pointerup', e => {
    if (pointer.down && !pointer.moved) {
      if (pointer.id) selectNode(pointer.id); else clearSelection();
    }
    pointer.down = false;
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    cam.zoom = Math.max(0.45, Math.min(4.2, cam.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
  }, { passive:false });
}
function bind() {
  ['q','view','year','density','chemistry','representation','hideReviews','hideIsolates'].forEach(id =>
    $(id).addEventListener(id === 'q' ? 'input' : 'change', () => { clearSelection(); buildData(); }));
  $('showFigs')?.addEventListener('change', () => { renderPapers(); persist(); });
  $('layout').addEventListener('change', () => { persist(); applyLayout($('layout').value); });
  $('colorby').addEventListener('change', () => { paintGraph(); persist(); });
  $('labels').addEventListener('change', persist);
  $('focus').addEventListener('change', () => { if (currentSelection) { const id = currentSelection; currentSelection = null; selectNode(id); } });
  $('center').addEventListener('click', () => fitGraph(true));
  $('reset').addEventListener('click', () => {
    $('q').value = ''; $('view').value = 'papers'; $('layout').value = 'free'; $('colorby').value = 'paradigm';
    $('year').value = 'all'; $('chemistry').value = 'all'; $('representation').value = 'all'; $('density').value = 'normal';
    $('labels').value = 'papers'; $('focus').value = '1'; $('hideReviews').checked = false; $('hideIsolates').checked = false;
    if ($('showFigs')) $('showFigs').checked = true;
    activeStory = null; document.querySelectorAll('[data-story]').forEach(x => x.classList.remove('active'));
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
  window.__atlasDebug = () => ({ nodes: currentData.nodes.map(n => ({id:n.id, x:n.x, y:n.y, z:n.z})), cam: { ...cam } });
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
