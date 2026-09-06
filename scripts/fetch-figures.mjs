import {mkdir, readFile, writeFile} from 'node:fs/promises';

const UA = 'catalysis-atlas (mailto:edenspec2@gmail.com)';
const DIR = 'public/figures';
await mkdir(DIR, { recursive: true });

const graph = JSON.parse(await readFile('original/graph_catalysis_v7.json', 'utf8'));
const papers = graph.nodes.filter(n => n.type === 'paper' && n.doi);

async function fetchText(url, timeout = 18000) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  return { ok: r.ok, status: r.status, ct: r.headers.get('content-type') || '', url: r.url, text: await r.text() };
}

async function headish(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  const ct = r.headers.get('content-type') || '';
  if (r.ok && /^image\//i.test(ct) && !/svg/i.test(ct)) {
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 4000) return { url: r.url, ct, buf };
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
    const label = (block.match(/<label>([^<]+)/i)?.[1] || '') + ' ' + (block.match(/<title>([^<]+)/i)?.[1] || '');
    const path = block.match(/cloudpmc-path\s+([^?]+)/)?.[1]?.trim() || '';
    const href = [...block.matchAll(/xlink:href="([^"]+\.(?:jpg|jpeg|png|gif))"/gi)].map(x => x[1]).find(h => !/\.gif$/i.test(h)) || '';
    const is1 = /\bfig(?:ure)?\.?\s*1\b/i.test(label) || /\bid="fig1"/i.test(block) || /-f1\.(jpg|png)/i.test(href + path);
    return { label: label.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), path, href, is1 };
  });
  return scored.find(f => f.is1 && (f.path || f.href)) || scored.find(f => f.path || f.href) || null;
}

async function fromPmc(doi) {
  const search = await fetchText('https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' + encodeURIComponent('DOI:' + doi) + '&format=json&resultType=core');
  if (!search.ok) return null;
  let data;
  try { data = JSON.parse(search.text); } catch { return null; }
  const pmcid = data.resultList?.result?.[0]?.pmcid;
  if (!pmcid) return null;
  const xml = await fetchText('https://www.ebi.ac.uk/europepmc/webservices/rest/' + pmcid + '/fullTextXML');
  if (xml.ok) {
    const fig = pickFig(xml.text);
    if (fig?.path) {
      const img = await headish('https://cdn.ncbi.nlm.nih.gov/pmc/' + fig.path);
      if (img) return { ...img, caption: fig.label || 'Figure 1', kind: /fig\.?\s*1/i.test(fig.label) ? 'figure1' : 'figure', source: 'pmc', pmcid };
    }
  }
  const html = await fetchText('https://pmc.ncbi.nlm.nih.gov/articles/' + pmcid + '/');
  if (!html.ok) return null;
  const imgs = [...html.text.matchAll(/https:\/\/cdn\.ncbi\.nlm\.nih\.gov\/pmc\/blobs\/[^"'\s]+?\.(?:jpg|jpeg|png)/gi)].map(m => m[0]);
  const fig1 = imgs.find(u => /-f1\.(jpg|jpeg|png)/i.test(u)) || imgs.find(u => /fig1/i.test(u));
  const ga = imgs.find(u => /-ga\.(jpg|jpeg|png)/i.test(u));
  const chosen = fig1 || ga || imgs[0];
  if (!chosen) return null;
  const img = await headish(chosen);
  if (!img) return null;
  return { ...img, caption: fig1 ? 'Figure 1' : ga ? 'Graphical abstract' : 'Figure', kind: fig1 ? 'figure1' : ga ? 'toc' : 'figure', source: 'pmc', pmcid };
}

function natureNames(doi) {
  const id = doi.replace(/^10\.1038\//i, '');
  const names = [];
  const m = id.match(/^s(\d+)-(\d+)-(\d+)/i);
  if (m) {
    const journal = m[1], year = m[2], art = m[3];
    names.push(`${journal}_${year}_${art}_Fig1_HTML.png`, `${journal}_${year}_${Number(art)}_Fig1_HTML.png`, `${journal}_${year}_${art}_Fig1_HTML.jpg`);
  }
  names.push(`${id}-f1.jpg`, `${id}-f1.png`, `${id.replace(/\./g, '_')}_Fig1_HTML.png`);
  return names;
}

async function fromNature(doi) {
  if (!/^10\.1038\//i.test(doi)) return null;
  const art = encodeURIComponent('art:' + doi);
  for (const name of natureNames(doi)) {
    for (const size of ['lw685', 'full']) {
      const img = await headish(`https://media.springernature.com/${size}/springer-static/image/${art}/MediaObjects/${name}`);
      if (img) return { ...img, caption: 'Figure 1', kind: 'figure1', source: 'springer' };
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
      if (img) return { ...img, caption: 'Cover / graphical abstract', kind: 'toc', source: 'chemrxiv' };
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
    caption: hit.caption || 'Figure 1',
    kind: hit.kind || 'figure1',
    source: hit.source,
    pmcid: hit.pmcid || '',
    bytes: hit.buf.length,
    origin: hit.url
  };
}

const records = {};
const failures = [];
for (let i = 0; i < papers.length; i += 3) {
  await Promise.all(papers.slice(i, i + 3).map(async p => {
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
console.log('Figures:', out.found, '/', out.tried);
