import {readFile, writeFile} from 'node:fs/promises';
import {publicationDate, clean} from '../src/literature.js';

const papers = [
  {
    id: 'paper_crest_2024',
    label: 'CREST: Exploration of Low-Energy Molecular Chemical Space',
    year: 2024,
    journal: 'J. Chem. Phys.',
    doi: '10.1063/5.0197592',
    paper_type: 'research',
    relevance: 'adjacent method',
    derived_authors: ['Philipp Pracht', 'Stefan Grimme', 'Christoph Bannwarth', 'Fabian Bohle'],
    derived_topics: ['Conformer sampling', 'Ground-state ensembles', 'xTB', 'Chemical space'],
    derived_methods: ['CREST', 'GFNn-xTB', 'Metadynamics'],
    derived_workflows: ['Structure', 'Ground-state conformers'],
    chemistry: 'Ground-state conformational ensembles for molecules and complexes; not a TS-ensemble generator',
    data_regime: 'Software paper; computational examples across drug-sized molecules',
    validation: 'Benchmarked conformational coverage and timings versus earlier CREST/xTB workflows',
    why: 'Canonical ground-state conformer tool. Distinct from racerTS: CREST samples minima (and can constrain TSs only at extra cost), not TS ensembles by default.',
    summary: 'CREST is the workhorse for low-energy conformer–rotamer ensembles at GFN-xTB/GFN-FF cost. In a catalysis stack it belongs in the ground-state layer. Do not treat it as interchangeable with racerTS, which samples transition-state conformers.',
    paradigm: 'MLIP / TS acceleration',
    groups: ['Grimme'],
    stack_layer: 'Ground-state conformers'
  },
  {
    id: 'paper_autode_2021',
    label: 'autodE: Automated Calculation of Reaction Energy Profiles',
    year: 2021,
    journal: 'Angew. Chem. Int. Ed.',
    doi: '10.1002/anie.202011941',
    paper_type: 'research',
    relevance: 'adjacent method',
    derived_authors: ['Tom A. Young', 'Joseph J. Silcock', 'Alistair J. Sterling', 'Fernanda Duarte'],
    derived_topics: ['Transition-state search', 'Reaction profiles', 'Organometallic reactions', 'Automation'],
    derived_methods: ['autodE', 'NEB', 'DFT', 'xTB'],
    derived_workflows: ['Structure', 'TS search', 'Thermochemistry'],
    chemistry: 'Automated reaction-profile search for molecular and transition-metal reactions from SMILES-level input',
    data_regime: 'Computational benchmarks on organic and organometallic reactions',
    validation: 'Recovered literature TSs and reaction energies across a curated reaction set',
    why: 'TS localization from a reaction string — the search step before ensemble sampling or descriptors. TS-tools sits on top of this layer.',
    summary: 'autodE automates locating TSs and assembling reaction energy profiles for organic and organometallic chemistry. It is a TS-search tool, not a conformer sampler and not a supervised ML model.',
    paradigm: 'MLIP / TS acceleration',
    groups: ['Duarte'],
    stack_layer: 'TS search'
  },
  {
    id: 'paper_tstools_2024',
    label: 'TS-tools: Automated TS Localization from Reaction SMILES',
    year: 2024,
    journal: 'J. Comput. Chem.',
    doi: '10.1002/jcc.27374',
    paper_type: 'research',
    relevance: 'adjacent method',
    derived_authors: ['Thijs Stuyver'],
    derived_topics: ['Transition-state search', 'Reaction SMILES', 'xTB', 'Solvation'],
    derived_methods: ['TS-tools', 'xTB', 'DFT', 'autodE'],
    derived_workflows: ['Structure', 'TS search'],
    chemistry: 'Automated TS searches including multi-molecular and solvent-sensitive pathways',
    data_regime: 'Benchmark set of mono-, bi-, and multimolecular reactions',
    validation: '95% success already at xTB for mono/bimolecular TSs; DFT required more often for multimolecular paths',
    why: 'Faster TS guesses from reaction SMILES. Complements autodE; still not a TS-conformer ensemble tool.',
    summary: 'TS-tools locates transition states from textual reaction SMILES at xTB or DFT. High success on simple reactions; harder multi-molecular and solvent-switched mechanisms need DFT. Use it for TS search, then racerTS if you need a TS ensemble.',
    paradigm: 'MLIP / TS acceleration',
    groups: ['Stuyver'],
    stack_layer: 'TS search'
  },
  {
    id: 'paper_racerts_2026',
    label: 'racerTS: Rapid Transition-State Conformer Ensembles',
    year: 2026,
    journal: 'JCIM',
    doi: '10.1021/acs.jcim.5c02794',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Stefan P. Schmid', 'Henrik Seng', 'Thibault Kläy', 'Kjell Jorner'],
    derived_topics: ['Transition-state conformers', 'Distance geometry', 'Catalyst design data', 'RDKit'],
    derived_methods: ['racerTS', 'Constrained ETKDG', 'MMFF94', 'GFN2-xTB'],
    derived_workflows: ['TS search', 'TS ensembles'],
    chemistry: 'TS conformer ensembles for 20 diverse reactions, including catalysis-relevant TSs',
    data_regime: 'Computational benchmark: 20 reaction TSs versus CREST and GOAT',
    validation: 'Similar coverage to CREST, better DFT-optimized TS validity, median 0.17 kcal/mol low-energy error, far lower wall time',
    why: 'This is the TS-ensemble layer. CREST/GOAT are expensive stand-ins; racerTS is built to sample TS conformers, not ground-state minima.',
    summary: 'racerTS generates TS conformer ensembles with constrained distance geometry. It is not CREST: CREST explores ground-state chemical space; racerTS freezes the reaction center and samples the rest. Needed before TS-informed descriptors or MLIP datasets.',
    paradigm: 'MLIP / TS acceleration',
    groups: ['Jorner'],
    stack_layer: 'TS ensembles'
  },
  {
    id: 'paper_goodvibes_2020',
    label: 'GoodVibes: Automated Quasi-Harmonic Thermochemistry',
    year: 2020,
    journal: 'F1000Research',
    doi: '10.12688/f1000research.22758.1',
    paper_type: 'research',
    relevance: 'adjacent method',
    derived_authors: ['Guilian Luchini', 'Juan V. Alegre-Requena', 'Ignacio Funes-Ardoiz', 'Robert S. Paton'],
    derived_topics: ['Thermochemistry', 'Quasi-harmonic entropy', 'Frequency scaling', 'Reproducible DFT'],
    derived_methods: ['GoodVibes', 'Grimme quasi-RRHO', 'Truhlar quasi-harmonic'],
    derived_workflows: ['Thermochemistry'],
    chemistry: 'Thermochemical corrections from Gaussian/ORCA/xTB frequency jobs used throughout homogeneous catalysis DFT',
    data_regime: 'Software paper with worked catalytic reaction-path examples',
    validation: 'Reproducible quasi-harmonic G values versus raw RRHO; community standard in Paton/Alegre-Requena workflows',
    why: 'After a TS or minimum is found, free energies still need quasi-harmonic treatment. This is the thermochemistry layer, not a model.',
    summary: 'GoodVibes applies Grimme/Truhlar quasi-harmonic corrections and frequency scaling to electronic-structure outputs. In the stack it sits after conformer/TS optimization and before descriptors or ΔG-based ranking. AQME/ROBERT often assume this step exists.',
    paradigm: 'Physical / interpretable',
    groups: ['Paton', 'Alegre-Requena'],
    stack_layer: 'Thermochemistry'
  },
  {
    id: 'paper_thermomlip_2026',
    label: 'thermoMLIP: MLIP-Enhanced Thermochemistry',
    year: 2026,
    journal: 'J. Chem. Theory Comput.',
    doi: '10.1021/acs.jctc.6c00936',
    paper_type: 'research',
    relevance: 'adjacent method',
    derived_authors: ['Bowen Deng', 'Thijs Stuyver'],
    derived_topics: ['Thermochemistry', 'MLIP', 'Conformer optimization', 'Active learning'],
    derived_methods: ['thermoMLIP', 'MLIP geometry optimization', 'Evidential GNN'],
    derived_workflows: ['Ground-state conformers', 'Thermochemistry', 'MLIP / mechanism'],
    chemistry: 'Organic thermochemistry across chemical space; relevant when catalysis models need cheap, consistent ΔG',
    data_regime: 'Computational organic chemical space plus an actively learned thermodynamic dataset',
    validation: 'Near-DFT thermochemistry; MLIP conformer searches often find lower-energy structures than existing datasets',
    why: 'MLIP replacement for the expensive DFT thermochemistry layer. Complements GoodVibes rather than replacing quasi-harmonic logic.',
    summary: 'thermoMLIP uses MLIPs to optimize conformers and evaluate thermochemistry near DFT quality, then trains a fast GNN surrogate. Use it when the bottleneck is ΔG at scale, not when you need a TS ensemble (that is racerTS) or experiment selection (that is EDBO).',
    paradigm: 'MLIP / TS acceleration',
    groups: ['Stuyver'],
    stack_layer: 'Thermochemistry'
  },
  {
    id: 'paper_edbo_2021',
    label: 'EDBO: Bayesian Reaction Optimization for Chemical Synthesis',
    year: 2021,
    journal: 'Nature',
    doi: '10.1038/s41586-021-03213-y',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Benjamin J. Shields', 'Jason M. Stevens', 'Jun Li', 'Marvin Parasram', 'Farhan Damani', 'Jesus I. Martinez Alvarado', 'Jacob M. Janey', 'Ryan P. Adams', 'Abigail G. Doyle'],
    derived_topics: ['Bayesian optimization', 'Reaction optimization', 'Experimental design', 'Direct arylation'],
    derived_methods: ['EDBO', 'Gaussian process', 'Acquisition function'],
    derived_workflows: ['Experiment selection'],
    chemistry: 'Pd-catalyzed direct arylation benchmark plus Mitsunobu and deoxyfluorination case studies',
    data_regime: 'Large Pd arylation HTE benchmark plus closed-loop synthetic case studies versus expert chemists',
    validation: 'Prospective comparison with expert human experiment selection; BO more efficient and more consistent',
    why: 'EDBO chooses the next experiment. It is not a supervised yield model and not a descriptor engine.',
    summary: 'Introduces Experimental Design via Bayesian Optimization (EDBO) and shows it can beat expert chemists at picking the next reaction conditions. Type this as experiment selection / BO, not as supervised ML on a static dataset.',
    paradigm: 'Bayesian / active learning',
    groups: ['Doyle'],
    stack_layer: 'Experiment selection'
  },
  {
    id: 'paper_edboplus_2022',
    label: 'EDBO+: Multi-Objective Active Learning for Reaction Optimization',
    year: 2022,
    journal: 'JACS',
    doi: '10.1021/jacs.2c08592',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Jose A. Garrido Torres', 'Sii Hong Lau', 'Pranay Anchuri', 'Jason M. Stevens', 'Jose E. Tabora', 'Jun Li', 'Alina Borovika', 'Ryan P. Adams', 'Abigail G. Doyle'],
    derived_topics: ['Multi-objective optimization', 'Bayesian optimization', 'Web app', 'Nickel photoredox'],
    derived_methods: ['EDBO+', 'Expected hypervolume improvement', 'HTE'],
    derived_workflows: ['Experiment selection'],
    chemistry: 'Ni/photoredox enantioselective cross-electrophile coupling as a real multi-objective test case',
    data_regime: 'HTE and virtual-screening datasets plus a live Ni photoredox optimization campaign',
    validation: 'Prospective multi-objective laboratory optimization; web app removes a coding barrier',
    why: 'EDBO+ is still experiment selection, now Pareto-aware. Do not collapse it into the Ni 2024 application paper or into supervised regression.',
    summary: 'EDBO+ extends EDBO to multiple objectives (yield vs selectivity vs cost) with a chemist-facing web app. Same stack layer as EDBO: choose the next experiment. The later Sigman/Doyle Ni reduction paper uses EDBO+; this is the method paper.',
    paradigm: 'Bayesian / active learning',
    groups: ['Doyle'],
    stack_layer: 'Experiment selection'
  }
];

const similarity = [
  ['paper_crest_2024', 'paper_racerts_2026', 8, 'Ground-state CREST vs TS-ensemble racerTS — same family of sampling, different layer'],
  ['paper_crest_2024', 'paper_paton_sterimol_2019', 6, 'Conformer choice changes steric descriptors'],
  ['paper_autode_2021', 'paper_tstools_2024', 8, 'TS search tools; TS-tools uses autodE internals'],
  ['paper_autode_2021', 'paper_duarte_almeta_2025', 7, 'Duarte lab: TS search then MLIP acceleration'],
  ['paper_tstools_2024', 'paper_racerts_2026', 7, 'Find a TS, then sample its conformer ensemble'],
  ['paper_tstools_2024', 'paper_thermomlip_2026', 6, 'Stuyver TS search then MLIP thermochemistry'],
  ['paper_racerts_2026', 'paper_rmlp_2025', 6, 'TS ensembles feed MLIP / TS-search datasets'],
  ['paper_racerts_2026', 'paper_cats_2025', 6, 'TS-centered catalyst screening needs ensembles'],
  ['paper_goodvibes_2020', 'paper_aqme_2023', 8, 'Paton thermochemistry then AQME descriptors'],
  ['paper_goodvibes_2020', 'paper_thermomlip_2026', 7, 'Quasi-harmonic DFT vs MLIP thermochemistry'],
  ['paper_goodvibes_2020', 'paper_robert_2024', 6, 'Alegre-Requena/Paton software layer'],
  ['paper_edbo_2021', 'paper_edboplus_2022', 9, 'EDBO then multi-objective EDBO+'],
  ['paper_edbo_2021', 'paper_ni_edbo_2024', 7, 'Method paper vs later Ni application of EDBO+'],
  ['paper_edboplus_2022', 'paper_ni_edbo_2024', 8, 'EDBO+ software used in the Ni reduction campaign'],
  ['paper_edboplus_2022', 'paper_minerva_2025', 6, 'Experiment-selection engines, not static predictors'],
  ['paper_edbo_2021', 'paper_flexcat_2026', 6, 'BO / closed-loop experiment selection']
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
for (const p of added) {
  if ((p.groups || []).includes('Duarte')) {
    const e = {source: 'program_fernanda_duarte_work', target: p.id, relation: 'includes_work'};
    if (graph.nodes.some(n => n.id === e.source) && !edges.has(edgeKey(e))) { graph.edges.push(e); edges.add(edgeKey(e)); }
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
  note: 'Includes a DescriPyTor neighborhood and a computational stack: CREST, autodE, TS-tools, racerTS, GoodVibes, thermoMLIP, EDBO, EDBO+.'
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
