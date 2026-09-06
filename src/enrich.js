import {clean} from './literature.js';

export const REPRESENTATIONS = [
  'Reusable ligand library',
  'Physical / chemist descriptors',
  'Conformer / ensemble descriptors',
  'Catalyst-state / mechanistic',
  'Learned 3D / TS GNN',
  'Pretrained learned representation',
  'MLIP / physics acceleration',
  'Dataset / experimental loop',
  'Overview / mixed'
];

export const CHEMISTRY_CLASSES = [
  'Asymmetric hydrogenation / reduction',
  'C–H functionalization',
  'Cross-coupling',
  'Hydroformylation',
  'Asymmetric C–C / oxidation',
  'Organocatalysis',
  'Biocatalysis',
  'Main-group catalysis',
  'Electrocatalysis',
  'CO2 / N2 small-molecule catalysis',
  'Ligand space / homogeneous method',
  'Reaction mechanism / methodology'
];

export const STACK_LAYERS = [
  'Ground-state conformers',
  'TS search',
  'TS ensembles',
  'Thermochemistry',
  'Descriptors',
  'Supervised model',
  'Experiment selection',
  'MLIP / mechanism',
  'Overview'
];

const GROUP_PATCH = {
  paper_flower_2025: ['Coley'],
  paper_duarte_almeta_2025: ['Duarte'],
  paper_cernak_2026: ['Cernak'],
  paper_rajaraman_2025: ['Rajaraman'],
  paper_ai_homocat_review_2025: ['Nova'],
  paper_organocat_review_2024: ['Glorius'],
  paper_cbs_2024: ['Schreiner'],
  paper_hcat_2025: ['Woodward'],
  paper_bestpractices_2026: ['Alegre-Requena'],
  paper_mlips_dft_2026: ['Corminboeuf'],
  paper_resource_hydroformylation_2025: ['Abolhasani'],
  paper_aqme_2023: ['Paton', 'Alegre-Requena'],
  paper_robert_2024: ['Alegre-Requena', 'Paton'],
  paper_autoqchem_2022: ['Doyle'],
  paper_paton_sterimol_2019: ['Paton'],
  paper_harper_sterimol_2012: ['Sigman'],
  paper_santiago_mlr_2018: ['Sigman'],
  paper_smartpy_2025: ['Sigman'],
  paper_crest_2024: ['Grimme'],
  paper_autode_2021: ['Duarte'],
  paper_tstools_2024: ['Stuyver'],
  paper_racerts_2026: ['Jorner'],
  paper_goodvibes_2020: ['Paton', 'Alegre-Requena'],
  paper_thermomlip_2026: ['Stuyver'],
  paper_edbo_2021: ['Doyle'],
  paper_edboplus_2022: ['Doyle']
};

const ALIASES = {'M. Abolhasani': 'Milad Abolhasani', 'Z. Wang': 'Zhihao Wang'};

const REPRESENTATION = {
  paper_kraken_2022: 'Reusable ligand library',
  paper_bunny_2026: 'Reusable ligand library',
  paper_corminboeuf_bidentate_2024: 'Reusable ligand library',
  paper_bisphosphine_multiobjective_2023: 'Reusable ligand library',
  paper_kulik_space_2023: 'Reusable ligand library',
  paper_kulik_manybody_2024: 'Reusable ligand library',
  paper_bisphos_2025: 'Conformer / ensemble descriptors',
  paper_target_data_2025: 'Dataset / experimental loop',
  paper_minerva_2025: 'Dataset / experimental loop',
  paper_flexcat_2026: 'Dataset / experimental loop',
  paper_fastcat_2024: 'Dataset / experimental loop',
  paper_cernak_2026: 'Dataset / experimental loop',
  paper_ni_edbo_2024: 'Dataset / experimental loop',
  paper_pidko_rh_hte_2024: 'Dataset / experimental loop',
  paper_resource_hydroformylation_2025: 'Dataset / experimental loop',
  paper_pd_fluorination_2025: 'Physical / chemist descriptors',
  paper_sigman_gold_2026: 'Physical / chemist descriptors',
  paper_ch_oxidation_2025: 'Physical / chemist descriptors',
  paper_noxyl_2025: 'Physical / chemist descriptors',
  paper_denmark_2025: 'Physical / chemist descriptors',
  paper_denmark_catalyst_selection_2024: 'Physical / chemist descriptors',
  paper_hda_2025: 'Physical / chemist descriptors',
  paper_reid_local_2025: 'Physical / chemist descriptors',
  paper_sunoj_2026: 'Physical / chemist descriptors',
  paper_delta_phosphine_2024: 'Physical / chemist descriptors',
  paper_hyster_sigman_2023: 'Physical / chemist descriptors',
  paper_reid_2025: 'Catalyst-state / mechanistic',
  paper_milo_hie_2025: 'Catalyst-state / mechanistic',
  paper_pdni_transfer_2025: 'Catalyst-state / mechanistic',
  paper_transfer_nature_2026: 'Catalyst-state / mechanistic',
  paper_bismuth_2025: 'Catalyst-state / mechanistic',
  paper_sobo_2023: 'Catalyst-state / mechanistic',
  paper_cbs_2024: 'Catalyst-state / mechanistic',
  paper_rajaraman_2025: 'Catalyst-state / mechanistic',
  paper_hartwig_ru_2026: 'Learned 3D / TS GNN',
  paper_hartwig_libra_2026: 'Learned 3D / TS GNN',
  paper_hcat_2025: 'Learned 3D / TS GNN',
  paper_moleclip_2025: 'Pretrained learned representation',
  paper_flower_2025: 'Pretrained learned representation',
  paper_meta_selectivity_2025: 'Pretrained learned representation',
  paper_duarte_almeta_2025: 'MLIP / physics acceleration',
  paper_cats_2025: 'MLIP / physics acceleration',
  paper_rmlp_2025: 'MLIP / physics acceleration',
  paper_mlips_dft_2026: 'MLIP / physics acceleration',
  paper_compcat_ai_2026: 'MLIP / physics acceleration',
  paper_corminboeuf_flp_2026: 'Overview / mixed',
  paper_qmworkflow_2026: 'Overview / mixed',
  paper_lowdata_workflows_2025: 'Overview / mixed',
  paper_probability_scope_2025: 'Dataset / experimental loop',
  paper_shearilicine_2026: 'Physical / chemist descriptors',
  paper_palladaelectro_2024: 'Dataset / experimental loop',
  paper_latent_transfer_2024: 'Overview / mixed',
  paper_ai_homocat_review_2025: 'Overview / mixed',
  paper_bestpractices_2026: 'Overview / mixed',
  paper_organocat_review_2024: 'Overview / mixed',
  paper_harper_sterimol_2012: 'Physical / chemist descriptors',
  paper_milo_vibrations_2014: 'Physical / chemist descriptors',
  paper_milo_science_2015: 'Physical / chemist descriptors',
  paper_santiago_milo_2016: 'Physical / chemist descriptors',
  paper_santiago_mlr_2018: 'Physical / chemist descriptors',
  paper_paton_sterimol_2019: 'Conformer / ensemble descriptors',
  paper_autoqchem_2022: 'Physical / chemist descriptors',
  paper_lustosa_milo_2022: 'Physical / chemist descriptors',
  paper_aqme_2023: 'Physical / chemist descriptors',
  paper_milo_smalldata_2023: 'Overview / mixed',
  paper_robert_2024: 'Overview / mixed',
  paper_smartpy_2025: 'Physical / chemist descriptors',
  paper_chemrefine_2026: 'Overview / mixed',
  paper_crest_2024: 'Conformer / ensemble descriptors',
  paper_autode_2021: 'MLIP / physics acceleration',
  paper_tstools_2024: 'MLIP / physics acceleration',
  paper_racerts_2026: 'MLIP / physics acceleration',
  paper_goodvibes_2020: 'Physical / chemist descriptors',
  paper_thermomlip_2026: 'MLIP / physics acceleration',
  paper_edbo_2021: 'Dataset / experimental loop',
  paper_edboplus_2022: 'Dataset / experimental loop'
};

const STACK_LAYER = {
  paper_crest_2024: 'Ground-state conformers',
  paper_autode_2021: 'TS search',
  paper_tstools_2024: 'TS search',
  paper_racerts_2026: 'TS ensembles',
  paper_goodvibes_2020: 'Thermochemistry',
  paper_thermomlip_2026: 'Thermochemistry',
  paper_edbo_2021: 'Experiment selection',
  paper_edboplus_2022: 'Experiment selection',
  paper_ni_edbo_2024: 'Experiment selection',
  paper_target_data_2025: 'Experiment selection',
  paper_minerva_2025: 'Experiment selection',
  paper_flexcat_2026: 'Experiment selection',
  paper_fastcat_2024: 'Experiment selection',
  paper_cernak_2026: 'Experiment selection',
  paper_pidko_rh_hte_2024: 'Experiment selection',
  paper_resource_hydroformylation_2025: 'Experiment selection',
  paper_palladaelectro_2024: 'Experiment selection',
  paper_probability_scope_2025: 'Experiment selection',
  paper_kraken_2022: 'Descriptors',
  paper_bunny_2026: 'Descriptors',
  paper_corminboeuf_bidentate_2024: 'Descriptors',
  paper_bisphosphine_multiobjective_2023: 'Descriptors',
  paper_kulik_space_2023: 'Descriptors',
  paper_kulik_manybody_2024: 'Descriptors',
  paper_bisphos_2025: 'Descriptors',
  paper_pd_fluorination_2025: 'Descriptors',
  paper_sigman_gold_2026: 'Descriptors',
  paper_ch_oxidation_2025: 'Descriptors',
  paper_noxyl_2025: 'Descriptors',
  paper_denmark_2025: 'Descriptors',
  paper_denmark_catalyst_selection_2024: 'Descriptors',
  paper_hda_2025: 'Descriptors',
  paper_reid_local_2025: 'Descriptors',
  paper_sunoj_2026: 'Descriptors',
  paper_delta_phosphine_2024: 'Descriptors',
  paper_hyster_sigman_2023: 'Descriptors',
  paper_harper_sterimol_2012: 'Descriptors',
  paper_milo_vibrations_2014: 'Descriptors',
  paper_milo_science_2015: 'Descriptors',
  paper_santiago_milo_2016: 'Descriptors',
  paper_santiago_mlr_2018: 'Descriptors',
  paper_paton_sterimol_2019: 'Descriptors',
  paper_autoqchem_2022: 'Descriptors',
  paper_lustosa_milo_2022: 'Descriptors',
  paper_aqme_2023: 'Descriptors',
  paper_smartpy_2025: 'Descriptors',
  paper_shearilicine_2026: 'Descriptors',
  paper_robert_2024: 'Descriptors',
  paper_chemrefine_2026: 'Descriptors',
  paper_reid_2025: 'Supervised model',
  paper_milo_hie_2025: 'Supervised model',
  paper_pdni_transfer_2025: 'Supervised model',
  paper_transfer_nature_2026: 'Supervised model',
  paper_bismuth_2025: 'Supervised model',
  paper_sobo_2023: 'Supervised model',
  paper_cbs_2024: 'Supervised model',
  paper_hartwig_ru_2026: 'Supervised model',
  paper_hartwig_libra_2026: 'Supervised model',
  paper_hcat_2025: 'Supervised model',
  paper_moleclip_2025: 'Supervised model',
  paper_flower_2025: 'Supervised model',
  paper_meta_selectivity_2025: 'Supervised model',
  paper_rajaraman_2025: 'MLIP / mechanism',
  paper_duarte_almeta_2025: 'MLIP / mechanism',
  paper_cats_2025: 'MLIP / mechanism',
  paper_rmlp_2025: 'MLIP / mechanism',
  paper_mlips_dft_2026: 'MLIP / mechanism',
  paper_compcat_ai_2026: 'MLIP / mechanism',
  paper_corminboeuf_flp_2026: 'Overview',
  paper_qmworkflow_2026: 'Overview',
  paper_lowdata_workflows_2025: 'Overview',
  paper_latent_transfer_2024: 'Overview',
  paper_ai_homocat_review_2025: 'Overview',
  paper_bestpractices_2026: 'Overview',
  paper_organocat_review_2024: 'Overview',
  paper_milo_smalldata_2023: 'Overview'
};

function chemistryClass(p){
  const t=`${p.chemistry} ${p.label}`.toLowerCase();
  if(/n2|ammonia|n2-to-nh3/.test(t))return 'CO2 / N2 small-molecule catalysis';
  if(/co2|frustrated lewis/.test(t))return 'CO2 / N2 small-molecule catalysis';
  if(/hydroformyl/.test(t))return 'Hydroformylation';
  if(/electrocatal|electrochem/.test(t))return 'Electrocatalysis';
  if(/biocatal|ene-reductase/.test(t))return 'Biocatalysis';
  if(/organocatal/.test(t))return 'Organocatalysis';
  if(/bismuth|frustrated/.test(t))return 'Main-group catalysis';
  if(/fluorination|suzuki|buchwald|c–n|c-n|cross[- ]coupl|arylation|negishi/.test(t))return 'Cross-coupling';
  if(/c–h|c-h|borylation|deuteration|hydrogen isotope|hat |methylene/.test(t))return 'C–H functionalization';
  if(/hydrogenat|cbs reduction|enol tosylate|ketone hydrogenation/.test(t))return 'Asymmetric hydrogenation / reduction';
  if(/dihydroxylation|aldol|diels|alkene|gold\(i\)/.test(t))return 'Asymmetric C–C / oxidation';
  if(/mechanism|methodology|overview|best practices|computational catalysis|molecular ml|transition-metal complex/.test(t))return 'Reaction mechanism / methodology';
  if(/ligand|homogeneous|phosphine|tmc/.test(t))return 'Ligand space / homogeneous method';
  return 'Reaction mechanism / methodology';
}

function dataSizeBin(p){
  const t=String(p.data_regime||'').toLowerCase();
  if(/perspective|n\/a|overview|review/.test(t))return 'n/a overview';
  if(/virtual|computational|dft ligands|ml-predicted/.test(t)&&!/\bhte\b|experimental/.test(t))return 'virtual / computational';
  const nums=[...t.matchAll(/(\d[\d,]*)/g)].map(m=>Number(m[1].replace(/,/g,''))).filter(n=>n>3);
  const n=Math.max(0,...nums);
  if(/50,688|50688/.test(t)||n>1000)return '>1000';
  if(n>=200)return '200–1000';
  if(n>=50)return '50–200';
  if(n>0&&n<50||/few-shot|sparse|low-data|limited experimental|small data/.test(t))return 'n < 50';
  if(/hte|96-well|batch/.test(t))return '200–1000';
  return 'unspecified';
}

function validationType(p){
  const t=String(p.validation||'').toLowerCase();
  if(/n\/a|perspective/.test(t))return 'n/a overview';
  if(/closed-loop|autonomous/.test(t))return 'autonomous closed-loop';
  if(/prospective/.test(t))return 'prospective experimental';
  if(/ood|extrapolat|distinct from training|cross-metal|cross-ligand|cross-reaction/.test(t))return 'scaffold / OOD';
  if(/cross-substrate|complex targets/.test(t))return 'cross-substrate';
  if(/random split/.test(t))return 'random split';
  if(/retrospective|case stud/.test(t))return 'retrospective';
  return 'mixed / unspecified';
}

function stackLayer(p){
  if(STACK_LAYER[p.id])return STACK_LAYER[p.id];
  if(p.stack_layer)return p.stack_layer;
  const t=`${p.label} ${p.representation_class||''} ${p.paradigm||''} ${(p.derived_methods||[]).join(' ')} ${(p.derived_workflows||[]).join(' ')} ${p.paper_type||''}`.toLowerCase();
  if(/review|perspective|viewpoint/.test(p.paper_type||'')||p.representation_class==='Overview / mixed')return 'Overview';
  if(/racerts|ts ensemble|transition-state conformer/.test(t))return 'TS ensembles';
  if(/autode|ts-tools|ts search|transition-state search|\bneb\b/.test(t))return 'TS search';
  if(/crest|goat|conformer sampling|conformer–rotamer|ground-state conformer/.test(t))return 'Ground-state conformers';
  if(/goodvibes|thermomlip|quasi-harmonic|thermochem/.test(t))return 'Thermochemistry';
  if(/\bedbo\b|bayesian optimization|experiment selection|closed-loop|self-driving|\bhte\b/.test(t)||p.representation_class==='Dataset / experimental loop')return 'Experiment selection';
  if(/mlip|interatomic/.test(t)||p.representation_class==='MLIP / physics acceleration')return 'MLIP / mechanism';
  if(['Physical / chemist descriptors','Conformer / ensemble descriptors','Reusable ligand library'].includes(p.representation_class))return 'Descriptors';
  return 'Supervised model';
}

function secondaryParadigms(p){
  const text=`${p.label} ${(p.derived_topics||[]).join(' ')} ${(p.derived_methods||[]).join(' ')} ${p.why}`.toLowerCase();
  const all=[];
  const rules=[
    ['Physical / interpretable',/descriptor|interpretable|statistical model|linear regression|steric|electronic/],
    ['3D / deep learning',/3d|graph neural|deep learning|gnn/],
    ['Mechanistic ML',/mechanis|intermediate|catalyst-state|transition.state/],
    ['Ligand-space / screening',/ligand library|virtual ligand|screening|chemical.space/],
    ['Bayesian / active learning',/bayesian|active learning|acquisition/],
    ['Autonomous / HTE',/autonom|hte|self-driving|closed-loop/],
    ['Transfer / few-shot',/transfer|few-shot|meta-learning|sparse/],
    ['MLIP / TS acceleration',/mlip|interatomic|metadynamics|transition-state search/],
    ['Inverse / generative',/inverse|generative|flow matching/]
  ];
  for(const [name,re] of rules)if(name!==p.paradigm&&re.test(text))all.push(name);
  return all.slice(0,3);
}

function authorId(name){
  return 'author_'+clean(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}

function authorNode(name){
  return {id:authorId(name),label:name,type:'author',paper_type:'',relevance:'',journal:'',year:'',url:'',doi:'',chemistry:'',data_regime:'',validation:'',why:'',focus:'',summary:'',steps:[],group:'author'};
}

function clip(s, n){
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

export function paperSummary(p){
  if (p.summary && String(p.summary).trim().length > 40) return clip(p.summary, 360);
  const chem = (p.chemistry || p.chemistry_class || '').split(';')[0].trim();
  const methods = (p.derived_methods || []).slice(0, 2).join(', ');
  const rep = p.representation_class && p.representation_class !== 'Overview / mixed' ? p.representation_class.toLowerCase() : '';
  const head = [chem, rep ? `using ${rep}` : '', methods ? `(${methods})` : ''].filter(Boolean).join(' ');
  const data = p.data_regime ? `Data: ${p.data_regime}.` : '';
  const val = p.validation ? `Checked by ${p.validation.replace(/^./, c => c.toLowerCase())}.` : '';
  const why = p.why || '';
  return clip([head ? head + '.' : '', data, val, why].filter(Boolean).join(' '), 360);
}

function paperBrief(p){
  return clip(p.why || (p.chemistry || '').split(';')[0] || p.representation_class || p.paradigm || '', 110);
}

function askNext(p){
  const v = p.validation_type, d = p.data_size_bin, rep = p.representation_class;
  const overview = /review|perspective|viewpoint/i.test(p.paper_type || '') || v === 'n/a overview';
  if (overview) return 'Which reaction in your lab is the first place this overview would actually change an experiment?';
  if (v === 'random split') return 'Would this ranking survive a held-out ligand scaffold, metal, or elementary step?';
  if (v === 'retrospective') return 'What prospective experiment would you run before trusting this ranking at the bench?';
  if (d === 'n < 50' || /few-shot|sparse|low-data|limited experimental/i.test(String(p.data_regime || ''))) return 'What is the cheapest next labeled example that would falsify the current model?';
  if (v === 'prospective experimental' || v === 'autonomous closed-loop') return 'Can the same loop move to a new reaction class without rebuilding the representation?';
  if (rep === 'Learned 3D / TS GNN' || rep === 'MLIP / physics acceleration') return 'Where would this 3D or physics model fail for ligands you actually use?';
  if (rep === 'Reusable ligand library') return 'What chemistry is missing from this library that you would add first?';
  if (v === 'scaffold / OOD') return 'How far does the OOD claim go — new metal, new denticity, or a new elementary step?';
  if (v === 'cross-substrate') return 'Would the same representation still hold if the catalytic intermediate changed?';
  return 'With ten more experiments, would you grow the dataset, change the representation, or open a new substrate class?';
}

function useFor(p){
  const rep = p.representation_class;
  if (rep === 'Reusable ligand library') return 'When you need a shared ligand space instead of a one-off descriptor set.';
  if (rep === 'Physical / chemist descriptors') return 'When you want an interpretable steric/electronic model you can argue with.';
  if (rep === 'Conformer / ensemble descriptors') return 'When a single conformer is probably lying about the ligand.';
  if (rep === 'Catalyst-state / mechanistic') return 'When free-ligand descriptors are not the species that makes the selectivity.';
  if (rep === 'Learned 3D / TS GNN') return 'When geometry of the enantiodetermining state is the thing you want the model to see.';
  if (rep === 'Pretrained learned representation') return 'When you are testing whether a learned embedding transfers into catalysis.';
  if (rep === 'MLIP / physics acceleration') return 'When the bottleneck is exploring mechanisms or TS space, not fitting a yield model.';
  if (rep === 'Dataset / experimental loop') return 'When the paper is really about how the data were chosen, not only the final fit.';
  return 'Use as orientation, then jump to a primary study in the same chemistry.';
}

function tally(items, key){
  const m = new Map();
  for (const it of items) {
    const raw = typeof key === 'function' ? key(it) : it[key];
    for (const v of (Array.isArray(raw) ? raw : [raw])) {
      const name = v && v !== 'Other' ? v : 'unspecified';
      m.set(name, (m.get(name) || 0) + 1);
    }
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({name, n}));
}

export function buildInsights(papers){
  const reps = REPRESENTATIONS.filter(r => r !== 'Overview / mixed');
  const heatmap = [];
  const chemCount = Object.fromEntries(tally(papers, 'chemistry_class').map(x => [x.name, x.n]));
  const repCount = Object.fromEntries(tally(papers, 'representation_class').map(x => [x.name, x.n]));
  for (const chemistry of CHEMISTRY_CLASSES) {
    for (const representation of reps) {
      const n = papers.filter(p => p.chemistry_class === chemistry && p.representation_class === representation).length;
      heatmap.push({chemistry, representation, n});
    }
  }
  const gaps = heatmap.filter(c => c.n === 0 && (chemCount[c.chemistry] || 0) >= 2 && (repCount[c.representation] || 0) >= 2);
  const hard = papers.filter(p => ['prospective experimental', 'autonomous closed-loop', 'scaffold / OOD'].includes(p.validation_type));
  const small = papers.filter(p => p.data_size_bin === 'n < 50');
  const reviews = papers.filter(p => /review|perspective|viewpoint/i.test(p.paper_type || '') || p.data_size_bin === 'n/a overview');
  return {
    years: tally(papers, p => String(p.year || 'unknown')),
    representations: tally(papers, 'representation_class'),
    chemistry: tally(papers, 'chemistry_class'),
    data_size: tally(papers, 'data_size_bin'),
    validation: tally(papers, 'validation_type'),
    stack: tally(papers, 'stack_layer'),
    groups: tally(papers, p => (p.groups || []).filter(g => g !== 'Other')[0] || 'Other / mixed'),
    heatmap,
    gaps,
    stats: {
      papers: papers.length,
      prospective: hard.length,
      small: small.length,
      reviews: reviews.length,
      unspecified_data: papers.filter(p => p.data_size_bin === 'unspecified').length
    }
  };
}

export function enrichGraph(graph, {metadata={}, authors={}, figures={}} = {}){
  const g=structuredClone(graph);
  g.meta={...g.meta,title:'Catalysis ML Atlas v12',features_version:12,updated:'2026-09-06',enrichment:'Inspect table, stack layers, computational-stack papers'};
  const byId=new Map(g.nodes.map(n=>[n.id,n]));
  const labelAuthors=new Map(g.nodes.filter(n=>n.type==='author').map(n=>[n.label.toLowerCase(),n]));
  const edgeKey=e=>e.relation+'|'+e.source+'|'+e.target;
  const edges=new Set(g.edges.map(edgeKey));

  for(const p of g.nodes.filter(n=>n.type==='paper')){
    const meta=metadata.records?.[p.id];
    if(meta?.published_date){
      p.published_date=meta.published_date;
      const y=Number(String(meta.published_date).slice(0,4));
      if(y)p.year=y;
      p.full_title=meta.title||p.full_title;
      p.metadata_source=meta.source;
      p.metadata_checked_at=metadata.checked_at;
    }
    const extra=authors.records?.[p.id]?.authors;
    if(Array.isArray(extra)&&extra.length){
      p.derived_authors=[...new Set(extra.map(a=>ALIASES[a]||clean(a)).filter(Boolean))];
    }
    for(const name of p.derived_authors||[]){
      let node=labelAuthors.get(name.toLowerCase());
      if(!node){
        node=authorNode(name);
        if(!byId.has(node.id)){g.nodes.push(node);byId.set(node.id,node)}
        labelAuthors.set(name.toLowerCase(),byId.get(node.id)||node);
        node=byId.get(node.id)||node;
      }
      const e={relation:'authored',source:node.id,target:p.id};
      if(!edges.has(edgeKey(e))){g.edges.push(e);edges.add(edgeKey(e))}
    }
    if(GROUP_PATCH[p.id]){
      p.groups=[...new Set([...(p.groups||[]).filter(x=>x!=='Other'),...GROUP_PATCH[p.id]])];
    }
    p.chemistry_class=chemistryClass(p);
    p.representation_class=REPRESENTATION[p.id]||'Overview / mixed';
    p.secondary_paradigms=secondaryParadigms(p);
    p.data_size_bin=dataSizeBin(p);
    p.validation_type=validationType(p);
    p.stack_layer=stackLayer(p);
    p.summary=paperSummary(p);
    p.brief=paperBrief(p);
    p.ask_next=askNext(p);
    p.use_for=useFor(p);
    const fig=figures.records?.[p.id];
    if(fig?.src)p.figure={src:fig.src,caption:fig.caption||(fig.kind==='toc'?'Graphical abstract':'Figure 1'),kind:fig.kind||'figure1',source:fig.source||''};
  }

  g.stories={
    ...g.stories,
    chemist_frames:{
      label:'Chemist-guided descriptors',
      description:'Where a descriptor is read: Sterimol, cavities, vibrations, and the AQME / Auto-QChem / ROBERT platforms DescriPyTor sits against.',
      keywords:['sterimol','cavity','aqme','auto-qchem','robert','smartpy','chemrefine','physical-organic','descriptor pipeline','chemist-guided','vibrations','hammett']
    },
    representation:{
      label:'Representation battle',
      description:'Free-ligand libraries vs ensemble descriptors vs catalyst-state features vs 3D/TS learned representations.',
      representations:[
        'Reusable ligand library',
        'Physical / chemist descriptors',
        'Conformer / ensemble descriptors',
        'Catalyst-state / mechanistic',
        'Learned 3D / TS GNN',
        'Pretrained learned representation'
      ]
    },
    computational_stack:{
      label:'Computational stack',
      description:'Structures → conformers → TS search → TS ensembles → thermochemistry → descriptors → model → experiment selection. CREST/GOAT are ground-state; racerTS is TS ensembles. EDBO is experiment selection, not supervised ML.',
      ids:[
        'paper_crest_2024','paper_autode_2021','paper_tstools_2024','paper_racerts_2026',
        'paper_goodvibes_2020','paper_thermomlip_2026','paper_edbo_2021','paper_edboplus_2022',
        'paper_ni_edbo_2024','paper_aqme_2023','paper_robert_2024','paper_autoqchem_2022',
        'paper_paton_sterimol_2019','paper_duarte_almeta_2025','paper_rmlp_2025','paper_cats_2025',
        'paper_minerva_2025','paper_flexcat_2026','paper_pidko_rh_hte_2024'
      ]
    }
  };
  const papers=g.nodes.filter(n=>n.type==='paper');
  g.insights=buildInsights(papers);
  g.meta.paper_count=papers.length;
  g.meta.node_count=g.nodes.length;
  g.meta.metadata_edge_count=g.edges.length;
  return g;
}
