import { mkdir, readFile, writeFile } from 'node:fs/promises';

const UA = 'catalysis-atlas (mailto:edenspec2@gmail.com)';
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const DIR = 'public/figures';
await mkdir(DIR, { recursive: true });

const graph = JSON.parse(await readFile('original/graph_catalysis_v7.json', 'utf8'));
const papers = graph.nodes.filter(n => n.type === 'paper' && n.doi);
let existing = { records: {}, failures: [] };
try { existing = JSON.parse(await readFile('public/figures.json', 'utf8')); } catch {}
const records = { ...(existing.records || {}) };

async function fetchText(url, timeout = 18000, ua = UA) {
  const r = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'text/html,application/xml,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  return { ok: r.ok, status: r.status, ct: r.headers.get('content-type') || '', url: r.url, text: await r.text() };
}

async function headish(url, ua = UA) {
  const r = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'image/*,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  const ct = r.headers.get('content-type') || '';
  if (r.ok && /^image\//i.test(ct) && !/svg/i.test(ct)) {
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 4000 && buf.slice(0, 40).toString('utf8').search(/<html/i) < 0) return { url: r.url, ct, buf };
  }
  return null;
}

function extFrom(ct, url) {
  if (/png/i.test(ct) || /\.png(\?|$)/i.test(url)) return 'png';
  if (/gif/i.test(ct) || /\.gif(\?|$)/i.test(url)) return 'gif';
  if (/webp/i.test(ct) || /\.webp(\?|$)/i.test(url)) return 'webp';
  return 'jpg';
}

function pickFig(xml) {
  const blocks = [...xml.matchAll(/<fig\b[^>]*>[\s\S]*?<\/fig>/gi)].map(m => m[0]);
  const scored = blocks.map(block => {
    const label = ((block.match(/<label>([^<]+)/i)?.[1] || '') + ' ' + (block.match(/<title>([^<]+)/i)?.[1] || '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const path = block.match(/cloudpmc-path\s+([^?]+)/)?.[1]?.trim() || '';
    const href = [...block.matchAll(/xlink:href="([^"]+\.(?:jpg|jpeg|png|gif))"/gi)].map(x => x[1]).find(h => !/\.gif$/i.test(h)) || '';
    const is1 = /\bfig(?:ure)?\.?\s*1\b/i.test(label) || /\bid="fig1"/i.test(block) || /-f1\.(jpg|png)/i.test(href + path);
    const isGa = /graphical\s*abstract|\babstract graphic\b|\btoc\b|table of contents/i.test(label) || /-ga\.(jpg|png)|fx1\.(jpg|png)/i.test(href + path);
    return { label, path, href, is1, isGa };
  });
  return scored.find(f => f.is1 && (f.path || f.href)) || scored.find(f => f.isGa && (f.path || f.href)) || scored.find(f => f.path || f.href) || null;
}

function classifyUrl(u) {
  if (/(?:-f1|_fig1|fig1_html)\.(jpg|jpeg|png)/i.test(u)) return 'figure1';
  if (/(?:-ga|_figa|figa_html|fx1)\.(jpg|jpeg|png)/i.test(u)) return 'toc';
  return 'figure';
}

async function fromPmc(doi) {
  const search = await fetchText('https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' + encodeURIComponent('DOI:"' + doi + '"') + '&format=json&resultType=core');
  if (!search.ok) return null;
  let data;
  try { data = JSON.parse(search.text); } catch { return null; }
  const pmcid = data.resultList?.result?.[0]?.pmcid;
  if (!pmcid) return null;

  const html = await fetchText('https://pmc.ncbi.nlm.nih.gov/articles/' + pmcid + '/');
  if (html.ok) {
    const imgs = [...html.text.matchAll(/https:\/\/cdn\.ncbi\.nlm\.nih\.gov\/pmc\/blobs\/[^"'\s]+?\.(?:jpg|jpeg|png)/gi)].map(m => m[0]);
    const fig1 = imgs.find(u => classifyUrl(u) === 'figure1');
    const ga = imgs.find(u => classifyUrl(u) === 'toc');
    const chosen = fig1 || ga || imgs[0];
    if (chosen) {
      const img = await headish(chosen);
      if (img) {
        const kind = classifyUrl(chosen);
        return {
          ...img,
          caption: kind === 'toc' ? 'Graphical abstract' : kind === 'figure1' ? 'Figure 1' : 'Figure',
          kind,
          source: 'pmc',
          pmcid
        };
      }
    }
  }

  const xml = await fetchText('https://www.ebi.ac.uk/europepmc/webservices/rest/' + pmcid + '/fullTextXML');
  if (xml.ok) {
    const fig = pickFig(xml.text);
    if (fig?.path) {
      const img = await headish('https://cdn.ncbi.nlm.nih.gov/pmc/' + fig.path);
      if (img) return { ...img, caption: fig.isGa ? 'Graphical abstract' : (fig.label || 'Figure 1'), kind: fig.is1 ? 'figure1' : fig.isGa ? 'toc' : 'figure', source: 'pmc', pmcid };
    }
  }
  return null;
}

function natureNames(doi) {
  const id = doi.replace(/^10\.1038\//i, '');
  const names = [];
  const m = id.match(/^s(\d+)-(\d+)-(\d+)/i);
  if (m) {
    const journal = m[1];
    let year = m[2];
    if (year.length === 3) year = '20' + year.slice(-2);
    else if (year.length === 2) year = '20' + year;
    const arts = [...new Set([String(Number(m[3])), m[3]])];
    for (const kind of ['Fig1_HTML', 'Figa_HTML']) {
      for (const a of arts) names.push(`${journal}_${year}_${a}_${kind}.png`, `${journal}_${year}_${a}_${kind}.jpg`);
    }
  }
  names.push(`${id}-f1.jpg`, `${id}-f1.png`);
  return names;
}

function natureKind(url) {
  if (/Figa_HTML|figa/i.test(url)) return 'toc';
  if (/Fig1_HTML|fig1|-f1/i.test(url)) return 'figure1';
  return 'figure';
}

async function fromNature(doi) {
  if (!/^10\.1038\//i.test(doi)) return null;
  const art = encodeURIComponent('art:' + doi);
  for (const name of natureNames(doi)) {
    for (const size of ['lw1200', 'full', 'm685', 'lw685']) {
      const img = await headish(`https://media.springernature.com/${size}/springer-static/image/${art}/MediaObjects/${name}`);
      if (img) {
        const kind = natureKind(name);
        return { ...img, caption: kind === 'toc' ? 'Graphical abstract' : 'Figure 1', kind, source: 'springer' };
      }
    }
  }
  const slug = doi.replace(/^10\.1038\//i, '');
  const html = await fetchText('https://www.nature.com/articles/' + slug + '?error=cookies_not_supported', 22000, CHROME);
  if (!html.ok && html.status !== 200) return null;
  const urls = [...html.text.matchAll(/https:\/\/media\.springernature\.com\/[^"' ]+MediaObjects\/[^"' ]+/g)]
    .map(m => m[0].replace(/&amp;/g, '&'))
    .filter(u => /Fig[a1]_HTML/i.test(u) && !/w215h120/i.test(u));
  const fig1 = urls.filter(u => /Fig1_HTML/i.test(u));
  const figa = urls.filter(u => /Figa_HTML/i.test(u));
  const variants = u => [...new Set([u, u.replace('/lw1200/', '/full/'), u.replace('/lw1200/', '/m685/'), u.replace('/m685/', '/full/'), u.replace('/lw685/', '/full/')])];
  for (const [list, kind, cap] of [[fig1, 'figure1', 'Figure 1'], [figa, 'toc', 'Graphical abstract']]) {
    for (const u of list) {
      for (const t of variants(u)) {
        const img = await headish(t);
        if (img) return { ...img, caption: cap, kind, source: 'springer' };
      }
    }
  }
  return null;
}

async function fromChemrxiv(doi) {
  if (!/26434\/chemrxiv/i.test(doi)) return null;
  try {
    const j = await (await fetch('https://chemrxiv.org/engage/chemrxiv/public-api/v1/items?doi=' + encodeURIComponent(doi), { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) })).json();
    const item = j?.itemHits?.[0]?.item || j?.items?.[0] || j;
    const cover = item?.assetLink || item?.coverImage || item?.largeCover || item?.thumbnail;
    if (typeof cover === 'string') {
      const img = await headish(cover.startsWith('http') ? cover : 'https://chemrxiv.org' + cover);
      if (img) return { ...img, caption: 'Graphical abstract', kind: 'toc', source: 'chemrxiv' };
    }
  } catch {}
  return null;
}

async function save(paper, hit) {
  const ext = extFrom(hit.ct, hit.url);
  const file = `${paper.id}.${ext}`;
  await writeFile(`${DIR}/${file}`, hit.buf);
  return {
    src: 'figures/' + file,
    caption: hit.caption || (hit.kind === 'toc' ? 'Graphical abstract' : 'Figure 1'),
    kind: hit.kind || 'figure1',
    source: hit.source,
    pmcid: hit.pmcid || '',
    bytes: hit.buf.length,
    origin: hit.url
  };
}

const failures = [];
const todo = papers.filter(p => !records[p.id]);
console.log('Already have', Object.keys(records).length, '; fetching', todo.length);
for (let i = 0; i < todo.length; i += 3) {
  await Promise.all(todo.slice(i, i + 3).map(async p => {
    try {
      const hit = await fromPmc(p.doi) || await fromNature(p.doi) || await fromChemrxiv(p.doi);
      if (!hit) { failures.push({ id: p.id, reason: 'not openly available' }); console.log('skip', p.id); return; }
      records[p.id] = await save(p, hit);
      console.log('ok', p.id, records[p.id].kind, records[p.id].bytes, records[p.id].source);
    } catch (e) {
      failures.push({ id: p.id, reason: e.message });
      console.log('fail', p.id, e.message);
    }
  }));
}

const out = { checked_at: new Date().toISOString(), records, failures, found: Object.keys(records).length, tried: papers.length };
await writeFile('public/figures.json', JSON.stringify(out, null, 2));
console.log('Figures:', out.found, '/', out.tried, 'new failures', failures.length);
