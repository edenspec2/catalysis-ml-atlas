import {readFile,writeFile} from 'node:fs/promises';
import {publicationDate,clean,doiKey} from '../src/literature.js';

// Already in the atlas before this section existed; they join it without a new record.
const existing = ['paper_kraken_2022', 'paper_racerts_2026', 'paper_crest_2024', 'paper_mlips_dft_2026',
  'paper_duarte_almeta_2025', 'paper_mlip_ligand_exchange_2025', 'paper_transfer_nature_2026'];

const learned3d = ['paper_darouich_generative_ts_2026', 'paper_galustian_goflow_2025', 'paper_shprints_fragmentflow_2026', 'paper_hadler_ruthenium_2026'];
const ensembles = ['paper_adams_conformer_quality_2025', 'paper_zhu_marcel_2023'];
const physical = ['paper_reid_steric_model_2017', 'paper_reid_holistic_2019', 'paper_liles_cpa_design_2023', 'paper_smith_buried_volume_2026', 'paper_smith_complementarity_2026'];
const mechanistic = ['paper_champagne_azetidine_2021', 'paper_harden_induced_fit_2022', 'paper_wang_azetidines_2015', 'paper_umemiya_cpa_screening_2026', 'paper_laplaza_marc_2024'];
const overview = ['paper_cascella_grignard_2025', 'paper_desouza_goat_2025', 'paper_spicher_sph_2021'];
const representation = p =>
  learned3d.includes(p.id) ? 'Learned 3D / TS GNN'
  : ensembles.includes(p.id) ? 'Conformer / ensemble descriptors'
  : physical.includes(p.id) ? 'Physical / chemist descriptors'
  : mechanistic.includes(p.id) ? 'Catalyst-state / mechanistic'
  : overview.includes(p.id) ? 'Overview / mixed'
  : p.paradigm === 'Transfer / few-shot' ? 'Pretrained learned representation'
  : 'MLIP / physics acceleration';

// enrich.js reads digits only, so "1.4 million" bins as n < 50 and "211 atoms" as a data size.
const dataSize = {
  '>1000': ['gardner_multifidelity_2026', 'huang_crossfunctional_2025', 'ren_finetuning_2026', 'ni_anysolv_2026', 'wood_uma_2025', 'levine_omol25_2025', 'batatia_macepolar_2026', 'anstine_aimnet2rxn_2026', 'kang_orbitall_2025', 'reid_steric_model_2017'],
  '200–1000': ['radova_frozen_2025'],
  '50–200': ['champagne_azetidine_2021', 'smith_buried_volume_2026'],
  'n < 50': ['holownia_finetuning_2026'],
  unspecified: ['kim_reewc_2025', 'gardner_synthetic_2024', 'kalikadien_uma_2026', 'schwalbekoda_information_2025', 'kreiman_shifts_2026', 'manoj_select50_2026'],
};
const sizeOf = id => Object.keys(dataSize).find(k => dataSize[k].includes(id.replace('paper_', '')));
const label = p => ({
  ...(sizeOf(p.id) ? {data_size_bin: sizeOf(p.id)} : {}),
  // "Extrapolation to the basis set limit" is not an out-of-domain test.
  ...(p.id === 'paper_harden_induced_fit_2022' ? {validation_type: 'mixed / unspecified'} : {}),
});

const papers = JSON.parse(await readFile('scripts/mlip-transfer-papers.json', 'utf8')).map(p => ({...p, ...label(p), representation_class: representation(p)}));
const graphPath = 'original/graph_catalysis_v7.json';
const graph = JSON.parse(await readFile(graphPath, 'utf8'));
const inAtlas = graph.nodes.filter(n => n.type === 'paper');
const ids = new Set(inAtlas.map(n => n.id));
const dois = new Set(inAtlas.filter(n => n.doi).map(n => doiKey(n.doi)));
const added = papers.filter(p => !ids.has(p.id) && !dois.has(doiKey(p.doi)));

for (const p of added) graph.nodes.push({
  ...p,
  type: 'paper',
  url: 'https://doi.org/' + p.doi,
  citations: '',
  citation_date: '2026-11-01',
  authors: p.derived_authors,
  topics: p.derived_topics,
  methods: p.derived_methods,
  focus: '',
  steps: [],
  group: 'paper'
});

const members = new Set([...existing, ...papers.map(p => p.id)]);
const paperDois = new Set(papers.map(p => doiKey(p.doi)));
for (const n of graph.nodes) if (n.type === 'paper' && (members.has(n.id) || (n.doi && paperDois.has(doiKey(n.doi))))) n.research_set = 'mlip_transfer';

// Link each new paper to its nearest neighbours in the set, so the group holds together in the 3D view.
graph.paper_similarity_edges ||= [];
const simKey = e => [e.source, e.target].sort().join('|');
const sims = new Set(graph.paper_similarity_edges.map(simKey));
const set = graph.nodes.filter(n => n.research_set === 'mlip_transfer');
const shared = (a, b) => (a.derived_methods || []).filter(m => (b.derived_methods || []).includes(m));
const closeness = (a, b) => 2 * shared(a, b).length + (a.stack_layer === b.stack_layer) + (a.paradigm === b.paradigm);
for (const p of added) {
  const near = set.filter(o => o.id !== p.id && closeness(p, o) >= 2).sort((a, b) => closeness(p, b) - closeness(p, a)).slice(0, 3);
  for (const o of near) {
    const both = shared(p, o);
    const e = {source: p.id, target: o.id, relation: 'paper_similarity', score: 6, reason: both.length ? 'Both use ' + both.join(', ') : 'Same layer: ' + p.stack_layer, density: 'normal'};
    if (!sims.has(simKey(e))) { graph.paper_similarity_edges.push(e); sims.add(simKey(e)); }
  }
}

const nPapers = graph.nodes.filter(n => n.type === 'paper').length;
graph.meta = {
  ...graph.meta,
  updated: '2026-11-01',
  new_papers_added: (graph.meta.new_papers_added || 0) + added.length,
  paper_count: nPapers,
  note: 'Includes a set on transfer of machine-learned potentials across chemical environments and on transition-state ensembles for selectivity.'
};
await writeFile(graphPath, JSON.stringify(graph, null, 2));
console.log('Added', added.length, 'papers; corpus now', nPapers);

const metadata = JSON.parse(await readFile('public/metadata.json', 'utf8'));
metadata.checked_at = new Date().toISOString();
metadata.failures ||= [];
for (const p of added.filter(p => !/^10\.48550\//.test(p.doi))) {
  try {
    const r = await fetch('https://api.crossref.org/works/' + encodeURIComponent(p.doi), {
      headers: {'User-Agent': 'catalysis-atlas (mailto:edenspec2@gmail.com)'},
      signal: AbortSignal.timeout(20000)
    });
    if (!r.ok) throw Error(String(r.status));
    const item = (await r.json()).message;
    metadata.records[p.id] = {
      title: clean(item.title?.[0]),
      published_date: publicationDate(item),
      doi: item.DOI,
      source: 'https://api.crossref.org/works/' + encodeURIComponent(p.doi)
    };
  } catch (e) {
    metadata.failures.push({id: p.id, error: e.message});
    console.log('metadata fail', p.id, e.message);
  }
}
await writeFile('public/metadata.json', JSON.stringify(metadata, null, 2));
console.log('Metadata records', Object.keys(metadata.records).length, 'failures', metadata.failures.length);
