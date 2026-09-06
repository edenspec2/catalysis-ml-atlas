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
  paper_resource_hydroformylation_2025: ['Abolhasani']
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
  paper_organocat_review_2024: 'Overview / mixed'
};

function chemistryClass(p){
  const t=`${p.chemistry} ${p.label}`.toLowerCase();
  if(/n2|ammonia|n2-to-nh3/.test(t))return 'CO2 / N2 small-molecule catalysis';
  if(/co2|frustrated lewis/.test(t))return 'CO2 / N2 small-molecule catalysis';
  if(/hydroformyl/.test(t))return 'Hydroformylation';
  if(/electro/.test(t))return 'Electrocatalysis';
  if(/biocatal|ene-reductase/.test(t))return 'Biocatalysis';
  if(/organo/.test(t))return 'Organocatalysis';
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

export function enrichGraph(graph, {metadata={}, authors={}} = {}){
  const g=structuredClone(graph);
  g.meta={...g.meta,title:'Catalysis ML Atlas v8',features_version:8,updated:'2026-09-06',enrichment:'chemistry_class, secondary_paradigms, representation_class, Crossref years/authors'};
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
  }

  g.stories={
    ...g.stories,
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
    }
  };
  g.meta.paper_count=g.nodes.filter(n=>n.type==='paper').length;
  g.meta.node_count=g.nodes.length;
  g.meta.metadata_edge_count=g.edges.length;
  return g;
}
