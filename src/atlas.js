const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eid = x => typeof x === 'object' && x ? x.id : x;
const url = s => { try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } };
function hash(s) { let h = 2166136261; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

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
let Graph, currentData = { nodes:[], links:[] }, currentSelection = null, activeStory = null, fitted = false;

const primaryGroup = n => n.type === 'paper' ? (n.groups?.[0] || 'Other') : 'Other';
const paperText = p => [p.label, p.full_title, p.chemistry, p.chemistry_class, p.paradigm, p.representation_class, p.why, p.journal, (p.derived_authors||[]).join(' '), (p.groups||[]).join(' '), (p.derived_methods||[]).join(' '), (p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();

function colorMap() {
  const mode = $('colorby').value;
  return mode === 'paradigm' ? paradigmColors : mode === 'representation' ? representationColors : mode === 'group' ? groupColors : mode === 'year' ? yearColors : typeColors;
}
function nodeColor(n) {
  const mode = $('colorby').value;
  if (n._dim) return '#2a3340';
  if (n._selected) return '#ffffff';
  if (mode === 'type' || n.type !== 'paper') return typeColors[n.type] || '#9aa7b8';
  if (mode === 'paradigm') return paradigmColors[n.paradigm] || '#9aa7b8';
  if (mode === 'representation') return representationColors[n.representation_class] || '#9aa7b8';
  if (mode === 'group') return groupColors[primaryGroup(n)] || groupColors.Other;
  if (mode === 'year') return yearColors[String(n.year)] || yearColors.Unknown;
  return '#9aa7b8';
}
function makeSprite(n) {
  const sp = new SpriteText(n.label);
  sp.material.depthWrite = false;
  sp.color = n._dim ? '#6d7888' : '#eef4fb';
  sp.textHeight = n.type === 'paper' ? 4.4 : 3.6;
  sp.backgroundColor = 'rgba(8,12,18,.82)';
  sp.padding = 2;
  sp.borderRadius = 2;
  return sp;
}
function nodeObject(n) {
  const mode = $('labels').value;
  const show = mode === 'all' || (mode === 'papers' && n.type === 'paper') || (mode === 'selected' && n._selected);
  return show ? makeSprite(n) : null;
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
      density:$('density').value, labels:$('labels').value, story:activeStory
    }));
  } catch {}
}
function restore() {
  try {
    const s = JSON.parse(localStorage.getItem('cml:atlas') || 'null'); if (!s) return;
    for (const [k, v] of Object.entries(s)) {
      if (k === 'story') { activeStory = v; continue; }
      const el = $(k); if (el && v != null) el.value = v;
    }
  } catch {}
}
function syncPositions() {
  if (!Graph) return;
  const { nodes, links } = Graph.graphData();
  for (const n of nodes) {
    if (n.__threeObj && Number.isFinite(n.x)) n.__threeObj.position.set(n.x, n.y, n.z);
  }
  for (const l of links) {
    const obj = l.__lineObj, a = l.source, b = l.target;
    if (!obj || !a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
    const attr = obj.geometry?.getAttribute?.('position');
    if (attr?.array && attr.array.length >= 6 && obj.type === 'Line') {
      attr.array[0] = a.x; attr.array[1] = a.y || 0; attr.array[2] = a.z || 0;
      attr.array[3] = b.x; attr.array[4] = b.y || 0; attr.array[5] = b.z || 0;
      attr.needsUpdate = true;
      obj.geometry.computeBoundingSphere?.();
    }
  }
}
function sizeGraph() {
  if (!Graph) return;
  const el = $('graph');
  const w = Math.max(1, el.clientWidth);
  const h = Math.max(1, el.clientHeight);
  Graph.width(w).height(h);
  Graph.controls().autoRotate = false;
}
function fitGraph() {
  if (!Graph || !currentData.nodes.length) return;
  const nodes = currentData.nodes.filter(n => Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.z));
  if (!nodes.length) { Graph.controls().autoRotate = false; return; }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    minZ = Math.min(minZ, n.z); maxZ = Math.max(maxZ, n.z);
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
  const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 120);
  Graph.cameraPosition({ x: cx, y: cy + span * 0.12, z: cz + span * 1.55 }, { x: cx, y: cy, z: cz }, 500);
  Graph.controls().autoRotate = false;
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
  $('paper-count').textContent = papers.length;
  $('papers').innerHTML = papers.length
    ? papers.map(p => `<button type="button" class="rowitem${p._selected ? ' active' : ''}" data-node="${esc(p.id)}"><span>${esc(p.label)}</span><span class="muted">${esc(p.year || '')} · ${esc(p.groups?.[0] || p.paradigm || '')}</span></button>`).join('')
    : '<p class="muted">No papers match these filters.</p>';
  if (currentSelection) {
    const row = document.querySelector(`[data-node="${CSS.escape(currentSelection)}"]`);
    row?.scrollIntoView({ block:'nearest' });
  }
}
function renderSelection() {
  const box = $('selection');
  const n = currentData.nodes.find(x => x.id === currentSelection);
  if (!n) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  if (n.type !== 'paper') {
    box.innerHTML = `<div class="sel-card"><p class="eyebrow">${esc(n.type)}</p><h2>${esc(n.label)}</h2><p class="muted">Tap the same node again to clear focus.</p></div>`;
    return;
  }
  box.innerHTML = `<div class="sel-card"><p class="eyebrow">${esc(n.year || '')} · ${esc(n.journal || '')}</p><h2>${esc(n.full_title || n.label)}</h2>
    <p>${esc(n.why || '')}</p>
    <div class="tags">${[n.chemistry_class, n.representation_class, n.paradigm, ...(n.groups||[]).filter(g => g !== 'Other')].filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="actions"><a class="primary" href="${esc(url(n.url))}" target="_blank" rel="noopener">Read paper ↗</a><button type="button" id="clear-focus">Clear focus</button></div></div>`;
}
function paintGraph() {
  if (!Graph) return;
  Graph.nodeThreeObject(nodeObject).nodeThreeObjectExtend(true).nodeColor(nodeColor).nodeVal(n => (n.type === 'paper' ? 14 : 6) * (n._selected ? 1.6 : 1))
    .linkColor(l => l._highlight ? 'rgba(141,227,193,.95)' : l.relation === 'paper_similarity' ? 'rgba(180,205,230,.32)' : 'rgba(255,255,255,.18)')
    .linkWidth(l => l._highlight ? 2.6 : l.relation === 'paper_similarity' ? Math.min(1.8, 0.7 + (l.score || 1) / 8) : 1.15);
}
function applyLayout(mode) {
  currentData.nodes.forEach(n => { delete n.fx; delete n.fy; delete n.fz; });
  Graph.d3Force('charge').strength(mode === 'free' ? -86 : -28);
  const ps = currentData.nodes.filter(n => n.type === 'paper');
  if (mode === 'year') {
    const years = [...new Set(ps.map(p => Number(p.year) || 0))].sort((a,b) => a - b);
    const yi = Object.fromEntries(years.map((y,i) => [y,i]));
    currentData.nodes.forEach(n => {
      if (n.type !== 'paper') return;
      n.fx = (yi[Number(n.year) || 0] - (years.length - 1) / 2) * 95;
      n.fy = ((hash(n.id) % 1000) / 1000 - .5) * 180;
      n.fz = ((hash(n.id + 'z') % 1000) / 1000 - .5) * 130;
    });
  } else if (mode === 'paradigm' || mode === 'representation' || mode === 'group') {
    const cats = mode === 'paradigm' ? Object.keys(paradigmColors) : mode === 'representation' ? REPS : Object.keys(groupColors);
    const key = n => mode === 'paradigm' ? n.paradigm : mode === 'representation' ? n.representation_class : primaryGroup(n);
    const ci = Object.fromEntries(cats.map((x,i) => [x,i]));
    currentData.nodes.forEach(n => {
      if (n.type !== 'paper') return;
      const a = 2 * Math.PI * (ci[key(n)] || 0) / cats.length, r = 165;
      n.fx = r * Math.cos(a) + ((hash(n.id) % 100) / 100 - .5) * 48;
      n.fy = r * Math.sin(a) + ((hash(n.id + 'y') % 100) / 100 - .5) * 48;
      n.fz = ((hash(n.id + 'z') % 1000) / 1000 - .5) * 90;
    });
  }
  fitted = false;
  Graph.graphData(currentData);
  Graph.d3ReheatSimulation();
  paintGraph();
  Graph.controls().autoRotate = false;
  setTimeout(fitGraph, 700);
}
function buildData() {
  const types = new Set(VIEWS[$('view').value] || ['paper']);
  const papers = ALL.filter(n => n.type === 'paper' && types.has('paper') && paperVisible(n));
  const paperIds = new Set(papers.map(p => p.id));
  let nodes = papers.slice();
  if ($('view').value !== 'papers') {
    const extras = ALL.filter(n => n.type !== 'paper' && types.has(n.type) && META.some(l =>
      (l.source === n.id && paperIds.has(l.target)) || (l.target === n.id && paperIds.has(l.source))
    ));
    const q = $('q').value.trim().toLowerCase();
    nodes = nodes.concat(q ? extras.filter(n => String(n.label || '').toLowerCase().includes(q) || META.some(l => {
      const a = l.source, b = l.target;
      return (a === n.id && paperIds.has(b)) || (b === n.id && paperIds.has(a));
    })) : extras);
  }
  const ids = new Set(nodes.map(n => n.id));
  const density = { sparse:1, normal:2, dense:3 }[$('density').value] || 2;
  let links = ($('view').value === 'papers'
    ? PAPER_LINKS.filter(l => ids.has(l.source) && ids.has(l.target) && ( {sparse:1,normal:2,dense:3}[l.density] || 2 ) <= density)
    : META.filter(l => ids.has(eid(l.source)) && ids.has(eid(l.target)))
  ).map(l => ({ ...l, source: eid(l.source), target: eid(l.target) }));
  if ($('hideIsolates').checked) {
    const deg = new Set();
    links.forEach(l => { deg.add(l.source); deg.add(l.target); });
    nodes = nodes.filter(n => n.type === 'paper' ? deg.has(n.id) : deg.has(n.id));
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
  if (Graph) applyLayout($('layout').value);
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
  paintGraph();
  renderPapers();
  renderSelection();
  if (window.innerWidth <= 900) $('side').scrollIntoView({ behavior:'smooth', block:'start' });
}
function clearSelection() {
  currentSelection = null;
  currentData.nodes.forEach(n => { n._selected = false; n._dim = false; });
  currentData.links.forEach(l => { l._highlight = false; });
  paintGraph();
  renderPapers();
  renderSelection();
}
function fillFilters(papers) {
  const chem = $('chemistry');
  [...new Set(papers.map(p => p.chemistry_class).filter(Boolean))].sort().forEach(c => chem.insertAdjacentHTML('beforeend', `<option>${esc(c)}</option>`));
  const rep = $('representation');
  REPS.filter(r => papers.some(p => p.representation_class === r)).forEach(r => rep.insertAdjacentHTML('beforeend', `<option>${esc(r)}</option>`));
  const bar = $('storybar');
  const order = ['milo','representation','small_data','automation','physics','frontier_2026'];
  const keys = [...new Set([...order, ...Object.keys(STORIES)])];
  keys.forEach(id => {
    const s = STORIES[id]; if (!s) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'story'; b.dataset.story = id; b.textContent = s.label; b.title = s.description || '';
    b.addEventListener('click', () => { activeStory = activeStory === id ? null : id; document.querySelectorAll('[data-story]').forEach(x => x.classList.toggle('active', x.dataset.story === activeStory)); clearSelection(); buildData(); });
    bar.appendChild(b);
  });
}
function bind() {
  ['q','view','year','density','chemistry','representation','hideReviews','hideIsolates'].forEach(id =>
    $(id).addEventListener(id === 'q' ? 'input' : 'change', () => { clearSelection(); buildData(); }));
  $('layout').addEventListener('change', () => { persist(); applyLayout($('layout').value); });
  $('colorby').addEventListener('change', () => { paintGraph(); updateHud(); persist(); });
  $('labels').addEventListener('change', () => { paintGraph(); persist(); });
  $('focus').addEventListener('change', () => { if (currentSelection) { const id = currentSelection; currentSelection = null; selectNode(id); } });
  $('center').addEventListener('click', fitGraph);
  $('reset').addEventListener('click', () => {
    $('q').value = ''; $('view').value = 'papers'; $('layout').value = 'free'; $('colorby').value = 'paradigm';
    $('year').value = 'all'; $('chemistry').value = 'all'; $('representation').value = 'all'; $('density').value = 'normal';
    $('labels').value = 'selected'; $('focus').value = '1'; $('hideReviews').checked = false; $('hideIsolates').checked = false;
    activeStory = null; document.querySelectorAll('[data-story]').forEach(x => x.classList.remove('active'));
    clearSelection(); buildData();
  });
  document.addEventListener('click', e => {
    if (e.target.id === 'clear-focus') { clearSelection(); return; }
    const row = e.target.closest('[data-node]'); if (row) selectNode(row.dataset.node);
  });
}
function createGraph() {
  const el = $('graph');
  Graph = ForceGraph3D({ rendererConfig: { antialias: true, alpha: false, preserveDrawingBuffer: true } })(el)
    .backgroundColor('#080c12')
    .showNavInfo(false)
    .enableNodeDrag(true)
    .nodeId('id')
    .nodeRelSize(9)
    .nodeResolution(16)
    .nodeOpacity(1)
    .nodeVal(n => (n.type === 'paper' ? 14 : 6) * (n._selected ? 1.6 : 1))
    .nodeColor(nodeColor)
    .nodeThreeObject(nodeObject)
    .nodeThreeObjectExtend(true)
    .nodeLabel(n => `<div class="glabel"><b>${esc(n.label)}</b><br>${esc(n.type)}${n.year ? ' · ' + esc(n.year) : ''}${n.representation_class ? ' · ' + esc(n.representation_class) : ''}</div>`)
    .linkOpacity(0.9)
    .onNodeClick(n => selectNode(n.id))
    .onBackgroundClick(clearSelection)
    .cooldownTicks(1e9)
    .cooldownTime(1e12)
    .d3AlphaMin(0)
    .warmupTicks(40);
  Graph.d3Force('charge').strength(-86);
  Graph.d3Force('link').distance(l => l.relation === 'paper_similarity' ? 78 : 54);
  Graph.controls().autoRotate = false;
  Graph.controls().enableDamping = true;
  Graph.onEngineStop(() => { if (!fitted) { fitted = true; fitGraph(); } });
  Graph.onEngineTick(syncPositions);
  (function loop(){ syncPositions(); requestAnimationFrame(loop); })();
  window.AtlasGraph = Graph;
  sizeGraph();
  new ResizeObserver(sizeGraph).observe(el);
  window.addEventListener('resize', sizeGraph);
}
async function init() {
  bind();
  try {
    const r = await fetch('graph.json');
    if (!r.ok) throw Error();
    const graph = await r.json();
    ALL = graph.nodes; META = graph.edges || []; PAPER_LINKS = graph.paper_similarity_edges || []; STORIES = graph.stories || {};
    fillFilters(ALL.filter(n => n.type === 'paper'));
    restore();
    document.querySelectorAll('[data-story]').forEach(x => x.classList.toggle('active', x.dataset.story === activeStory));
    if (!webglOk() || typeof ForceGraph3D !== 'function' || typeof THREE === 'undefined') {
      $('status').textContent = '3D view needs WebGL. Use the paper list.';
      buildData();
      return;
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    createGraph();
    buildData();
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && ALL.some(n => n.id === hashId)) setTimeout(() => selectNode(hashId), 800);
  } catch {
    $('status').textContent = 'The atlas could not load.';
    $('papers').innerHTML = '<p class="muted">Reload the page to try again.</p>';
  }
}
init();
