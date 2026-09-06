import {readFile, writeFile} from 'node:fs/promises';
import {publicationDate, clean} from '../src/literature.js';

const papers = [
  {
    id: 'paper_molli_2024',
    label: 'molli: Combinatorial Libraries and Feature Extraction',
    year: 2024,
    journal: 'JCIM',
    doi: '10.1021/acs.jcim.4c00424',
    paper_type: 'research',
    relevance: 'catalysis-enabling methodology',
    derived_authors: ['Alexander S. Shved', 'Blake E. Ocampo', 'Elena S. Burlova', 'Casey L. Olen', 'N. Ian Rinehart', 'Scott E. Denmark'],
    derived_topics: ['Combinatorial libraries', 'Feature extraction', 'Python toolkit', 'Molecular descriptors'],
    derived_methods: ['molli', 'Combinatorial library generation', 'Descriptor extraction'],
    derived_workflows: ['Automated QM descriptor workflow'],
    chemistry: 'General molecular / homogeneous-ligand libraries; combinatorial feature extraction, not a catalytic reference frame',
    data_regime: 'Software paper; combinatorial molecular libraries rather than a single catalytic n',
    validation: 'Software demonstration across library generation and feature-extraction workflows',
    why: 'Denmark-lab infrastructure for making libraries and extracting features. Contrast for DescriPyTor: no chemist-chosen substituent axis.',
    summary: 'Python toolkit for combinatorial small-molecule libraries and feature extraction. Useful when the bottleneck is enumerating molecules. DescriPyTor’s claim is different: on small catalytic n the missing control is where each descriptor is read, not another feature extractor.',
    paradigm: 'Ligand-space / screening',
    groups: ['Denmark']
  },
  {
    id: 'paper_sambvca2_2016',
    label: 'SambVca 2: Topographic Steric Maps of Catalytic Pockets',
    year: 2016,
    journal: 'Organometallics',
    doi: '10.1021/acs.organomet.6b00371',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Laura Falivene', 'Raffaele Credendino', 'Albert Poater', 'Andrea Petta', 'Luigi Serra', 'Romina Oliva', 'Vittorio Scarano', 'Luigi Cavallo'],
    derived_topics: ['Buried volume', 'Steric maps', 'Catalytic pockets', 'N-heterocyclic carbenes'],
    derived_methods: ['SambVca 2', 'Percent buried volume', 'Topographic steric maps'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; metal-centered steric maps for NHCs, phosphines, and catalytic pockets',
    data_regime: 'Software paper with organometallic pocket examples',
    validation: 'Web-tool demonstration of topographic maps versus classical %Vbur numbers',
    why: 'Canonical cavity/pocket steric software. The frame is a metal-centered sphere, not a chemist-oriented substituent axis.',
    summary: 'SambVca 2 turns buried volume into topographic steric maps of the catalytic pocket. Same steric family as %Vbur and SMARTpy; opposite origin of the frame from DescriPyTor’s orientational Sterimol.',
    paradigm: 'Physical / interpretable',
    groups: ['Cavallo']
  },
  {
    id: 'paper_sambvca_pockets_2019',
    label: 'Online Computer-Aided Design of Catalytic Pockets',
    year: 2019,
    journal: 'Nature Chemistry',
    doi: '10.1038/s41557-019-0319-5',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Laura Falivene', 'Zhen Cao', 'Andrea Petta', 'Luigi Serra', 'Albert Poater', 'Romina Oliva', 'Vittorio Scarano', 'Luigi Cavallo'],
    derived_topics: ['Catalytic pockets', 'Buried volume', 'Ligand design', 'Steric maps'],
    derived_methods: ['SambVca', 'Percent buried volume', 'Topographic steric maps'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; online design of catalytic pockets from buried-volume maps',
    data_regime: 'Computational pocket-design case studies across organometallic catalysts',
    validation: 'Case studies connecting pocket topography to known catalytic behavior',
    why: 'The high-profile cavity paper: design the pocket, not a substituent axis. Natural contrast for DescriPyTor’s orientational Sterimol.',
    summary: 'Shows how topographic steric maps can be used to design catalytic pockets online. Measures cavity occupancy around a metal; DescriPyTor instead lets the chemist point the steric frame along a chosen substituent.',
    paradigm: 'Physical / interpretable',
    groups: ['Cavallo']
  },
  {
    id: 'paper_vbur_2010',
    label: 'Percent Buried Volume for Phosphines and NHCs',
    year: 2010,
    journal: 'Chemical Communications',
    doi: '10.1039/b922984a',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Hervé Clavier', 'Steven P. Nolan'],
    derived_topics: ['Buried volume', 'N-heterocyclic carbenes', 'Phosphine ligands', 'Steric parameters'],
    derived_methods: ['Percent buried volume', 'SambVca'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; %Vbur as a steric number for phosphines and NHCs',
    data_regime: 'Method paper; computational buried-volume examples on common ligands',
    validation: 'Comparisons of %Vbur with Tolman cone angle and related steric scales',
    why: 'The single-number buried-volume ancestor. Metal-centered sphere, no user-defined substituent axis.',
    summary: 'Defines percent buried volume as a practical steric parameter for phosphines and NHCs. AQME, SambVca and SMARTpy all sit downstream of this number. DescriPyTor’s steric terms are directional Sterimol, not a metal-centered occupancy.',
    paradigm: 'Physical / interpretable',
    groups: ['Nolan']
  },
  {
    id: 'paper_sigman_accounts_2016',
    label: 'Multidimensional Analysis Tools for Asymmetric Catalysis',
    year: 2016,
    journal: 'Accounts of Chemical Research',
    doi: '10.1021/acs.accounts.6b00194',
    paper_type: 'review',
    relevance: 'overview',
    derived_authors: ['Matthew S. Sigman', 'Kaid C. Harper', 'Elizabeth N. Bess', 'Anat Milo'],
    derived_topics: ['Multivariable linear regression', 'Physical-organic descriptors', 'Asymmetric catalysis', 'Sterimol'],
    derived_methods: ['Multivariable linear regression', 'Sterimol parameters', 'Descriptor design'],
    derived_workflows: [],
    chemistry: 'Asymmetric catalysis; the Sigman/Milo playbook for chemist-designed descriptors and MLR',
    data_regime: 'n/a overview of multivariable catalytic modeling case studies',
    validation: 'N/A',
    why: 'The written playbook DescriPyTor still follows: chemist-designed descriptors, then MLR. Milo is a coauthor.',
    summary: 'Accounts of how multidimensional analysis — Sterimol, IR, Hammett-type terms, MLR — became a catalytic workflow. Direct ancestor of DescriPyTor’s modeling stage; it does not yet require a user-defined orientational reference frame.',
    paradigm: 'Physical / interpretable',
    groups: ['Sigman', 'Milo']
  },
  {
    id: 'paper_lkb_p_2005',
    label: 'Ligand Knowledge Base for Phosphorus Donor Ligands',
    year: 2005,
    journal: 'Chemistry – A European Journal',
    doi: '10.1002/chem.200500891',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Natalie Fey', 'Athanassios C. Tsipis', 'Stephanie E. Harris', 'Jeremy N. Harvey', 'A. Guy Orpen', 'Ralph A. Mansson'],
    derived_topics: ['Ligand knowledge base', 'Phosphine descriptors', 'Ligand space', 'DFT descriptors'],
    derived_methods: ['DFT ligand descriptors', 'Principal component maps', 'LKB-P'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; reaction-agnostic DFT maps of phosphorus-donor ligand space',
    data_regime: 'Computational phosphine ligand maps rather than a single catalytic dataset',
    validation: 'PCA maps of ligand space compared with known organometallic trends',
    why: 'The original reaction-agnostic ligand library. Kraken is the scaled descendant; DescriPyTor argues the opposite direction.',
    summary: 'Builds a DFT descriptor knowledge base for phosphorus donor ligands and maps ligand space. This is the library alternative: precomputed, reaction-agnostic features. DescriPyTor instead reads descriptors from a chemist-chosen frame on a small catalytic n.',
    paradigm: 'Ligand-space / screening',
    groups: ['Fey']
  },
  {
    id: 'paper_fey_ligand_rev_2019',
    label: 'Computational Ligand Descriptors for Catalyst Design',
    year: 2019,
    journal: 'Chemical Reviews',
    doi: '10.1021/acs.chemrev.8b00588',
    paper_type: 'review',
    relevance: 'overview',
    derived_authors: ['Derek J. Durand', 'Natalie Fey'],
    derived_topics: ['Ligand descriptors', 'Catalyst design', 'Ligand space', 'Computational screening'],
    derived_methods: ['Review of computational ligand descriptors', 'Ligand knowledge bases'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; survey of computational ligand descriptors used in catalyst design',
    data_regime: 'n/a overview of computational ligand-descriptor methods',
    validation: 'N/A',
    why: 'The map of the library/descriptor landscape DescriPyTor is written against: computational ligand space rather than chemist-chosen axes.',
    summary: 'Reviews computational ligand descriptors for catalyst design, from knowledge bases to steric maps. Use it as the landscape paper: most of the field precomputes ligand space; DescriPyTor asks the chemist to define the frame on the reaction at hand.',
    paradigm: 'Ligand-space / screening',
    groups: ['Fey']
  }
];

const similarity = [
  ['paper_molli_2024', 'paper_kraken_2022', 6.5, 'Library infrastructure vs reaction-agnostic ligand descriptors'],
  ['paper_molli_2024', 'paper_autoqchem_2022', 6.0, 'Feature extraction / automated descriptor pipelines'],
  ['paper_molli_2024', 'paper_denmark_catalyst_selection_2024', 7.0, 'authors: Scott E. Denmark; Denmark-lab selection tools'],
  ['paper_sambvca2_2016', 'paper_sambvca_pockets_2019', 9.0, 'authors: Laura Falivene, Luigi Cavallo; SambVca pocket maps'],
  ['paper_sambvca2_2016', 'paper_vbur_2010', 8.0, '%Vbur numbers to topographic steric maps'],
  ['paper_sambvca2_2016', 'paper_smartpy_2025', 7.0, 'Cavity / pocket steric descriptors'],
  ['paper_sambvca_pockets_2019', 'paper_smartpy_2025', 7.5, 'Catalytic-pocket steric software'],
  ['paper_sambvca_pockets_2019', 'paper_vbur_2010', 7.0, 'Buried-volume lineage of pocket design'],
  ['paper_vbur_2010', 'paper_aqme_2023', 6.5, 'AQME computes %Vbur from supplied geometries'],
  ['paper_vbur_2010', 'paper_harper_sterimol_2012', 6.0, 'Two steric languages: buried volume vs directional Sterimol'],
  ['paper_sigman_accounts_2016', 'paper_harper_sterimol_2012', 9.0, 'authors: Matthew S. Sigman, Kaid C. Harper; Sterimol MLR playbook'],
  ['paper_sigman_accounts_2016', 'paper_santiago_mlr_2018', 8.5, 'authors: Matthew S. Sigman; multidimensional MLR tools'],
  ['paper_sigman_accounts_2016', 'paper_milo_science_2015', 8.5, 'authors: Anat Milo, Matthew S. Sigman'],
  ['paper_sigman_accounts_2016', 'paper_santiago_milo_2016', 8.0, 'authors: Anat Milo, Matthew S. Sigman; steric/electronic split'],
  ['paper_lkb_p_2005', 'paper_kraken_2022', 8.0, 'Ligand-knowledge-base ancestor of Kraken maps'],
  ['paper_lkb_p_2005', 'paper_fey_ligand_rev_2019', 8.5, 'authors: Natalie Fey; ligand-space descriptors'],
  ['paper_fey_ligand_rev_2019', 'paper_kraken_2022', 7.0, 'Computational ligand-descriptor landscape including libraries'],
  ['paper_fey_ligand_rev_2019', 'paper_harper_sterimol_2012', 5.5, 'Library descriptors vs chemist-designed Sterimol']
];

function paperNode(p) {
  return {
    ...p,
    type: 'paper',
    url: 'https://doi.org/' + p.doi,
    citations: '',
    citation_date: '2026-09-06',
    authors: p.derived_authors,
    topics: p.derived_topics,
    methods: p.derived_methods,
    focus: '',
    steps: [],
    group: 'paper'
  };
}

const graphPath = 'original/graph_catalysis_v7.json';
const graph = JSON.parse(await readFile(graphPath, 'utf8'));
const have = new Set(graph.nodes.filter(n => n.type === 'paper').map(n => n.id));
const added = papers.filter(p => !have.has(p.id));
for (const p of added) graph.nodes.push(paperNode(p));

const edgeKey = e => `${e.relation}|${e.source}|${e.target}`;
const edges = new Set(graph.edges.map(edgeKey));
for (const id of added.filter(p => (p.groups || []).includes('Milo')).map(p => p.id)) {
  const e = {source: 'program_anat_milo_work', target: id, relation: 'includes_work'};
  if (graph.nodes.some(n => n.id === e.source) && !edges.has(edgeKey(e))) {
    graph.edges.push(e);
    edges.add(edgeKey(e));
  }
}

graph.paper_similarity_edges ||= [];
const simKey = e => [e.source, e.target].sort().join('|');
const sims = new Set(graph.paper_similarity_edges.map(simKey));
for (const [source, target, score, reason] of similarity) {
  if (!graph.nodes.some(n => n.id === source) || !graph.nodes.some(n => n.id === target)) continue;
  const e = {source, target, relation: 'paper_similarity', score, reason, density: score >= 7 ? 'sparse' : 'normal'};
  if (!sims.has(simKey(e))) {
    graph.paper_similarity_edges.push(e);
    sims.add(simKey(e));
  }
}

graph.meta = {
  ...graph.meta,
  updated: '2026-09-06',
  new_papers_added: (graph.meta.new_papers_added || 0) + added.length,
  paper_count: graph.nodes.filter(n => n.type === 'paper').length,
  note: 'DescriPyTor neighborhood plus comparators: molli, SambVca, %Vbur, Sigman Accounts, LKB-P, Fey ligand-descriptor review.'
};

await writeFile(graphPath, JSON.stringify(graph, null, 2));
console.log('Added', added.length, 'papers; corpus now', graph.meta.paper_count);

const metadata = JSON.parse(await readFile('public/metadata.json', 'utf8'));
metadata.checked_at = new Date().toISOString();
metadata.failures ||= [];
for (const p of added) {
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
    console.log('metadata', p.id, metadata.records[p.id].published_date);
  } catch (e) {
    metadata.failures.push({id: p.id, error: e.message});
    console.log('metadata fail', p.id, e.message);
  }
}
await writeFile('public/metadata.json', JSON.stringify(metadata, null, 2));
console.log('Metadata records', Object.keys(metadata.records).length, 'failures', metadata.failures.length);
