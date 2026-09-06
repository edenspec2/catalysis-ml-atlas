import {readFile, writeFile} from 'node:fs/promises';
import {publicationDate, clean} from '../src/literature.js';

const papers = [
  {
    id: 'paper_harper_sterimol_2012',
    label: 'Multidimensional Steric Parameters in Asymmetric Catalysis',
    year: 2012,
    journal: 'Nature Chemistry',
    doi: '10.1038/nchem.1297',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Kaid C. Harper', 'Elizabeth N. Bess', 'Matthew S. Sigman'],
    derived_topics: ['Sterimol', 'Asymmetric catalysis', 'Physical-organic descriptors', 'Enantioselectivity'],
    derived_methods: ['Sterimol parameters', 'Multivariable linear regression'],
    derived_workflows: [],
    chemistry: 'Asymmetric catalysis; directional Sterimol parameterization of substituents',
    data_regime: 'Small published enantioselectivity series',
    validation: 'Retrospective correlation with selectivity; steric terms interpreted mechanistically',
    why: 'Moved Sterimol from QSAR into homogeneous catalysis: L, B1 and B5 report where bulk sits, not only a cone angle.',
    summary: 'Sigman lab showed that Verloop Sterimol parameters, used as a chemist-defined steric frame, can give compact multivariable models of enantioselectivity. Direct ancestor of DescriPyTor’s orientational Sterimol terms.',
    paradigm: 'Physical / interpretable',
    groups: ['Sigman']
  },
  {
    id: 'paper_milo_vibrations_2014',
    label: 'Interrogating Selectivity in Catalysis Using Molecular Vibrations',
    year: 2014,
    journal: 'Nature',
    doi: '10.1038/nature13019',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Anat Milo', 'Elizabeth N. Bess', 'Matthew S. Sigman'],
    derived_topics: ['Infrared descriptors', 'Physical-organic descriptors', 'Asymmetric catalysis', 'Selectivity'],
    derived_methods: ['IR stretching frequencies', 'Multivariable linear regression'],
    derived_workflows: [],
    chemistry: 'Asymmetric catalysis; IR vibrations as electronic descriptors',
    data_regime: 'Small catalytic selectivity datasets',
    validation: 'Interpretable vibrational terms mapped onto the selectivity-determining interaction',
    why: 'Milo/Sigman prototype for reading an electronic descriptor from a chemically chosen site rather than a generic molecular fingerprint.',
    summary: 'Uses IR stretching frequencies as site-anchored electronic descriptors in multivariable models of catalytic selectivity. The same premise — choose where to read the feature — is the DescriPyTor reference-frame argument.',
    paradigm: 'Physical / interpretable',
    groups: ['Milo', 'Sigman']
  },
  {
    id: 'paper_milo_science_2015',
    label: 'A Data-Intensive Approach to Mechanistic Elucidation in Chiral Anion Catalysis',
    year: 2015,
    journal: 'Science',
    doi: '10.1126/science.1261043',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Anat Milo', 'Andrew J. Neel', 'F. Dean Toste', 'Matthew S. Sigman'],
    derived_topics: ['Mechanistic discovery', 'Physical-organic descriptors', 'Organocatalysis', 'Small data'],
    derived_methods: ['Multivariable linear regression', 'Parameterization of catalysts and substrates'],
    derived_workflows: [],
    chemistry: 'Chiral anion organocatalysis; catalyst–substrate parameterization',
    data_regime: 'Designed small catalytic library, not a large HTE dump',
    validation: 'Statistical models used to distinguish competing mechanistic hypotheses',
    why: 'Canonical Milo-lab result: a small, chemically designed dataset plus interpretable descriptors can interrogate mechanism.',
    summary: 'Parameterizes catalysts and substrates in a chiral-anion system and uses the fitted models to distinguish mechanisms. Template for DescriPyTor’s claim that small catalytic sets need chemist-guided features, not bigger descriptor pools.',
    paradigm: 'Physical / interpretable',
    groups: ['Milo', 'Sigman']
  },
  {
    id: 'paper_santiago_milo_2016',
    label: 'A Modern Approach to Steric Effects in Hammett-Type Correlations',
    year: 2016,
    journal: 'JACS',
    doi: '10.1021/jacs.6b08799',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Celine B. Santiago', 'Anat Milo', 'Matthew S. Sigman'],
    derived_topics: ['Sterimol', 'Hammett correlations', 'Physical-organic descriptors', 'Steric effects'],
    derived_methods: ['Sterimol parameters', 'Linear free-energy relationships'],
    derived_workflows: [],
    chemistry: 'Physical-organic catalysis; steric correction of Hammett-type models',
    data_regime: 'Classic linear free-energy series plus Sterimol terms',
    validation: 'Improved correlations when steric and electronic terms are separated geometrically',
    why: 'Puts Sterimol on the same footing as σ constants — the electronic/steric split DescriPyTor still uses.',
    summary: 'Shows that Sterimol steric terms can be combined with Hammett electronic parameters instead of burying steric demand in a single substituent constant. Milo is a coauthor; this is the closest published ancestor of chemist-guided steric frames.',
    paradigm: 'Physical / interpretable',
    groups: ['Milo', 'Sigman']
  },
  {
    id: 'paper_santiago_mlr_2018',
    label: 'Predictive and Mechanistic Multivariate Linear Regression for Reaction Development',
    year: 2018,
    journal: 'Chemical Science',
    doi: '10.1039/C7SC04679K',
    paper_type: 'review',
    relevance: 'overview',
    derived_authors: ['Celine B. Santiago', 'Jing-Yao Guo', 'Matthew S. Sigman'],
    derived_topics: ['Multivariable linear regression', 'Physical-organic descriptors', 'Reaction development', 'Enantioselectivity'],
    derived_methods: ['Multivariable linear regression', 'Cross-validation', 'Descriptor design'],
    derived_workflows: [],
    chemistry: 'Asymmetric catalysis; MLR workflow for selectivity models',
    data_regime: 'Review of small-to-moderate catalytic modeling case studies',
    validation: 'N/A',
    why: 'The playbook DescriPyTor still follows: exhaustively search a chemist-designed descriptor pool, then validate on Q² not R².',
    summary: 'Sigman-group tutorial on multivariate linear regression for reaction development: how to choose physical-organic descriptors, avoid overfitting, and read mechanism from the selected terms. Direct methodological backdrop for DescriPyTor’s modeling stage.',
    paradigm: 'Physical / interpretable',
    groups: ['Sigman']
  },
  {
    id: 'paper_paton_sterimol_2019',
    label: 'Conformational Effects on Sterimol Steric Parameters',
    year: 2019,
    journal: 'ACS Catalysis',
    doi: '10.1021/acscatal.8b04043',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Alexandre V. Brethomé', 'Stephen P. Fletcher', 'Robert S. Paton'],
    derived_topics: ['Sterimol', 'Conformer ensembles', 'Physical-organic descriptors', 'Asymmetric catalysis'],
    derived_methods: ['Boltzmann-weighted Sterimol', 'Conformer ensembles', 'DFT geometries'],
    derived_workflows: [],
    chemistry: 'Asymmetric catalysis; conformer-averaged Sterimol descriptors',
    data_regime: 'Catalytic case studies where a single conformer misrepresents steric demand',
    validation: 'Boltzmann-weighted Sterimol outperforms single-conformer values',
    why: 'Shows that the geometry a steric descriptor is read from is itself a modeling variable — the same point DescriPyTor makes for metal complexes vs free ligands.',
    summary: 'Paton lab: Sterimol values change with conformation, and Boltzmann averaging is required before the descriptor is used in a selectivity model. DescriPyTor’s case studies treat structure choice (product, free ligand, metal complex) as the analogous decision.',
    paradigm: 'Physical / interpretable',
    groups: ['Paton']
  },
  {
    id: 'paper_autoqchem_2022',
    label: 'Auto-QChem: Automated DFT Descriptor Workflows for Organic Molecules',
    year: 2022,
    journal: 'Reaction Chemistry & Engineering',
    doi: '10.1039/D2RE00030J',
    paper_type: 'research',
    relevance: 'catalysis-enabling methodology',
    derived_authors: ['Andrzej M. Żurański', 'Jason Y. Wang', 'Benjamin J. Shields', 'Abigail G. Doyle'],
    derived_topics: ['Descriptor pipelines', 'Automated featurization', 'DFT descriptors', 'Organic molecules'],
    derived_methods: ['Automated DFT workflows', 'Descriptor databases'],
    derived_workflows: ['Automated QM descriptor workflow'],
    chemistry: 'Organic molecules including catalytic ligands and substrates; automated DFT featurization',
    data_regime: 'Reusable DFT descriptor database generated from SMILES inputs',
    validation: 'Workflow benchmarks and downstream modeling use-cases',
    why: 'The Doyle-lab pipeline DescriPyTor contrasts with: compute a large fixed descriptor pool, then model. No user-defined chemical axes.',
    summary: 'Automates DFT jobs and stores molecular descriptors from SMILES. Important platform paper: it solves extraction, not reference-frame choice. DescriPyTor’s claim is that in small catalytic sets the missing control is where each descriptor is read.',
    paradigm: 'Other / mixed',
    groups: ['Doyle']
  },
  {
    id: 'paper_lustosa_milo_2022',
    label: 'Mechanistic Inference from Statistical Models at Different Data-Size Regimes',
    year: 2022,
    journal: 'ACS Catalysis',
    doi: '10.1021/acscatal.2c01741',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Danilo M. Lustosa', 'Anat Milo'],
    derived_topics: ['Small data', 'Mechanistic inference', 'Statistical modeling', 'Physical-organic descriptors'],
    derived_methods: ['Multivariable linear regression', 'Data-size analysis'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; how dataset size changes what a statistical model can claim',
    data_regime: 'Explicit comparison across small vs larger catalytic data-size regimes',
    validation: 'Shows when fitted equations support mechanistic claims versus when they only interpolate',
    why: 'Milo-lab warning that DescriPyTor is built on: with n in the tens, an unconstrained descriptor search will overfit.',
    summary: 'Maps what statistical models in catalysis can and cannot support as n grows. The small-n regime is exactly where DescriPyTor insists on a chemist-chosen reference frame instead of a free search over hundreds of features.',
    paradigm: 'Physical / interpretable',
    groups: ['Milo']
  },
  {
    id: 'paper_aqme_2023',
    label: 'AQME: Automated Quantum Mechanical Environments for Descriptor Generation',
    year: 2023,
    journal: 'WIREs Computational Molecular Science',
    doi: '10.1002/wcms.1663',
    paper_type: 'research',
    relevance: 'catalysis-enabling methodology',
    derived_authors: ['Juan V. Alegre-Requena', 'Shree Sowndarya S. V.', 'Raúl Pérez-Soto', 'Turki M. Alturaifi', 'Robert S. Paton'],
    derived_topics: ['Descriptor pipelines', 'Automated featurization', 'Quantum chemistry workflows', 'Catalysis modeling'],
    derived_methods: ['Automated QM workflows', 'MORFEUS', 'xTB', 'DFT descriptors'],
    derived_workflows: ['Automated QM descriptor workflow'],
    chemistry: 'General molecular / catalysis descriptor generation from automated quantum chemistry',
    data_regime: 'Broad descriptor pools assembled per molecule from QM and steric codes',
    validation: 'Software demonstration and downstream modeling examples',
    why: 'The Paton/Alegre-Requena platform DescriPyTor is written against: Sterimol and %Vbur from supplied geometries, not user-defined axes.',
    summary: 'End-to-end automated QM environment that computes charges, frequencies, Sterimol and buried volume. DescriPyTor keeps this broad pool, then adds chemist-chosen axes for orientational Sterimol and projected dipoles.',
    paradigm: 'Other / mixed',
    groups: ['Paton', 'Alegre-Requena']
  },
  {
    id: 'paper_milo_smalldata_2023',
    label: 'Small Data Can Play a Big Role in Chemical Discovery',
    year: 2023,
    journal: 'Angewandte Chemie',
    doi: '10.1002/anie.202219070',
    paper_type: 'viewpoint',
    relevance: 'overview',
    derived_authors: ['Hadas Shalit Peleg', 'Anat Milo'],
    derived_topics: ['Small data', 'Chemical discovery', 'Interpretable models', 'Dataset design'],
    derived_methods: ['Viewpoint / methodology guidance'],
    derived_workflows: [],
    chemistry: 'Chemical discovery including catalysis; advocacy for small, designed datasets',
    data_regime: 'n/a overview',
    validation: 'N/A',
    why: 'Milo-lab manifesto for the DescriPyTor setting: do not wait for HTE-scale data if the representation is chemically right.',
    summary: 'Argues that carefully designed small datasets, paired with interpretable representations, can drive discovery. Sets the lab stance that DescriPyTor operationalizes: descriptor frame first, more data second.',
    paradigm: 'Other / mixed',
    groups: ['Milo']
  },
  {
    id: 'paper_robert_2024',
    label: 'ROBERT: Automated Machine Learning for Chemistry',
    year: 2024,
    journal: 'WIREs Computational Molecular Science',
    doi: '10.1002/wcms.1733',
    paper_type: 'research',
    relevance: 'catalysis-enabling methodology',
    derived_authors: ['Juan V. Alegre-Requena', 'David Dalmau', 'Raúl Pérez-Soto', 'Robert S. Paton'],
    derived_topics: ['Automated model selection', 'Small data', 'Catalysis workflows', 'Descriptor matrices'],
    derived_methods: ['ROBERT', 'Automated ML workflow', 'Cross-validation'],
    derived_workflows: ['Automated ML workflow'],
    chemistry: 'Chemistry ML including homogeneous catalysis; automated model screening from feature matrices',
    data_regime: 'Designed for the small-n chemical tables AQME and similar tools export',
    validation: 'Automated model comparison with reported diagnostics',
    why: 'DescriPyTor exports its labeled feature matrices here. ROBERT screens models; it does not choose the chemical reference frame.',
    summary: 'Bridges chemistry descriptor tables to automated model selection. Complementary to DescriPyTor: once the chemist has anchored Sterimol and dipole columns to atoms and axes, ROBERT can hunt the equation.',
    paradigm: 'Other / mixed',
    groups: ['Alegre-Requena', 'Paton']
  },
  {
    id: 'paper_smartpy_2025',
    label: 'SMARTpy: Cavity Steric Molecular Descriptors',
    year: 2025,
    journal: 'Digital Discovery',
    doi: '10.1039/D4DD00329B',
    paper_type: 'research',
    relevance: 'core catalysis',
    derived_authors: ['Beck R. Miller', 'Ryan C. Cammarota', 'Matthew S. Sigman'],
    derived_topics: ['Cavity descriptors', 'Steric parameters', 'Physical-organic descriptors', 'Homogeneous catalysis'],
    derived_methods: ['Cavity steric descriptors', 'Python descriptor software'],
    derived_workflows: [],
    chemistry: 'Homogeneous catalysis; cavity-specific steric descriptors beyond classical Sterimol',
    data_regime: 'Applied to diverse catalytic and molecular systems',
    validation: 'Case studies against established steric parameterizations',
    why: 'Newest Sigman-lab steric software: measures bulk in a cavity, not only along a substituent axis. Natural comparison for DescriPyTor’s orientational Sterimol.',
    summary: 'Python package for cavity-centric steric descriptors. Like morfeus and DBSTEP, it computes steric numbers from a supplied geometry; unlike DescriPyTor, the chemist does not define an orientational reference frame on the substituent axis.',
    paradigm: 'Physical / interpretable',
    groups: ['Sigman']
  },
  {
    id: 'paper_chemrefine_2026',
    label: 'ChemRefine: Automated Interoperable ML and Quantum Chemistry Platform',
    year: 2026,
    journal: 'Journal of Chemical Theory and Computation',
    doi: '10.1021/acs.jctc.5c01881',
    paper_type: 'research',
    relevance: 'catalysis-enabling methodology',
    derived_authors: ['Ian Migliaro', 'Mikayla G. S. Weiss', 'Alistair J. Sterling'],
    derived_topics: ['Automated featurization', 'Quantum chemistry workflows', 'Machine learning simulations', 'Interoperable platforms'],
    derived_methods: ['Automated QM workflows', 'Machine learning potentials', 'Interoperable simulation platform'],
    derived_workflows: ['Automated QM descriptor workflow'],
    chemistry: 'General molecular / organometallic simulation; automated QM and ML interoperability',
    data_regime: 'Workflow platform rather than a single catalytic dataset',
    validation: 'Software interoperability demonstrations across QM and ML engines',
    why: '2026 platform in the same automation layer as AQME/Auto-QChem. DescriPyTor cites it as adjacent infrastructure, not a chemist-guided frame.',
    summary: 'Open platform that chains quantum chemistry and machine-learning simulations. Relevant because DescriPyTor is a lighter, chemist-in-the-loop alternative: it does not try to own the full simulation stack, only the reference frame of each descriptor.',
    paradigm: 'Other / mixed',
    groups: ['Other']
  }
];

const similarity = [
  ['paper_harper_sterimol_2012', 'paper_paton_sterimol_2019', 8.5, 'Sterimol as a directional steric frame'],
  ['paper_harper_sterimol_2012', 'paper_santiago_milo_2016', 8.0, 'Sterimol meets Hammett-type models'],
  ['paper_harper_sterimol_2012', 'paper_smartpy_2025', 7.0, 'Sterimol lineage to cavity steric descriptors'],
  ['paper_harper_sterimol_2012', 'paper_corminboeuf_bidentate_2024', 5.5, 'Physical descriptors for enantioselectivity'],
  ['paper_milo_vibrations_2014', 'paper_milo_science_2015', 9.0, 'authors: Anat Milo, Matthew S. Sigman; site-anchored descriptors'],
  ['paper_milo_vibrations_2014', 'paper_milo_hie_2025', 6.5, 'authors: Anat Milo; interpretable catalytic descriptors'],
  ['paper_milo_science_2015', 'paper_santiago_milo_2016', 8.5, 'authors: Anat Milo, Matthew S. Sigman'],
  ['paper_milo_science_2015', 'paper_lustosa_milo_2022', 7.5, 'authors: Anat Milo; small-data mechanistic models'],
  ['paper_santiago_milo_2016', 'paper_santiago_mlr_2018', 8.0, 'authors: Celine B. Santiago, Matthew S. Sigman'],
  ['paper_santiago_mlr_2018', 'paper_reid_local_2025', 5.5, 'MLR / local reaction-space modeling'],
  ['paper_santiago_mlr_2018', 'paper_denmark_catalyst_selection_2024', 5.0, 'Interpretable selectivity models'],
  ['paper_paton_sterimol_2019', 'paper_bisphos_2025', 7.0, 'Conformer-dependent steric descriptors'],
  ['paper_paton_sterimol_2019', 'paper_aqme_2023', 7.5, 'authors: Robert S. Paton; Sterimol software stack'],
  ['paper_autoqchem_2022', 'paper_aqme_2023', 8.0, 'Automated QM descriptor pipelines'],
  ['paper_autoqchem_2022', 'paper_qmworkflow_2026', 6.5, 'Cheap/automated descriptor generation'],
  ['paper_autoqchem_2022', 'paper_kraken_2022', 5.0, 'Precomputed ligand/molecule descriptor infrastructure'],
  ['paper_lustosa_milo_2022', 'paper_milo_smalldata_2023', 8.5, 'authors: Anat Milo; small-data catalysis'],
  ['paper_lustosa_milo_2022', 'paper_lowdata_workflows_2025', 7.0, 'Small-n catalytic modeling'],
  ['paper_lustosa_milo_2022', 'paper_reid_local_2025', 5.5, 'What small catalytic datasets can support'],
  ['paper_aqme_2023', 'paper_robert_2024', 8.5, 'authors: Juan V. Alegre-Requena, Robert S. Paton'],
  ['paper_aqme_2023', 'paper_qmworkflow_2026', 7.0, 'Automated QM descriptor workflows'],
  ['paper_milo_smalldata_2023', 'paper_moleclip_2025', 6.5, 'authors: Anat Milo; small-data representations'],
  ['paper_milo_smalldata_2023', 'paper_probability_scope_2025', 6.0, 'authors: Anat Milo; small designed catalytic datasets'],
  ['paper_robert_2024', 'paper_lowdata_workflows_2025', 8.0, 'authors: David Dalmau, Juan V. Alegre-Requena; ROBERT'],
  ['paper_robert_2024', 'paper_bestpractices_2026', 7.5, 'authors: Juan V. Alegre-Requena; chemistry ML practice'],
  ['paper_smartpy_2025', 'paper_kraken_2022', 6.0, 'authors: Matthew S. Sigman; ligand steric descriptors'],
  ['paper_smartpy_2025', 'paper_paton_sterimol_2019', 6.5, 'Steric descriptor software for catalysis'],
  ['paper_chemrefine_2026', 'paper_aqme_2023', 6.5, 'Automated QM/ML platforms'],
  ['paper_chemrefine_2026', 'paper_qmworkflow_2026', 6.0, 'Interoperable QM descriptor workflows']
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

const miloIds = added.filter(p => (p.groups || []).includes('Milo')).map(p => p.id);
const edgeKey = e => `${e.relation}|${e.source}|${e.target}`;
const edges = new Set(graph.edges.map(edgeKey));
for (const id of miloIds) {
  const e = {source: 'program_anat_milo_work', target: id, relation: 'includes_work'};
  if (!edges.has(edgeKey(e))) {
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

graph.stories = {
  ...graph.stories,
  chemist_frames: {
    label: 'Chemist-guided descriptors',
    description: 'Where a descriptor is read: Sterimol, cavities, vibrations, and the AQME / Auto-QChem / ROBERT platforms DescriPyTor is written against.',
    keywords: ['sterimol', 'cavity', 'aqme', 'auto-qchem', 'robert', 'smartpy', 'chemrefine', 'physical-organic', 'descriptor pipeline', 'chemist-guided', 'vibrations', 'hammett']
  }
};

graph.meta = {
  ...graph.meta,
  updated: '2026-09-06',
  new_papers_added: (graph.meta.new_papers_added || 0) + added.length,
  paper_count: graph.nodes.filter(n => n.type === 'paper').length,
  note: 'Includes a DescriPyTor neighborhood: Milo descriptor papers plus Sterimol / AQME / Auto-QChem / ROBERT / SMARTpy platforms.'
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
