export const clean = value => String(value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
export const doiKey = value => String(value??'').replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').trim().toLowerCase();
export const titleKey = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g,'');
export function publicationDate(item){
 const parts=(item['published-online']||item.published||item.issued)?.['date-parts']?.[0];
 if(!parts?.[0])return '';
 return parts.map((v,i)=>i?String(v).padStart(2,'0'):String(v)).join('-');
}
export function normalizeWork(item){
 const doi=doiKey(item.DOI),date=publicationDate(item);
 return {id:'doi:'+doi,doi,url:'https://doi.org/'+doi,label:clean(item.title?.[0]||'Untitled record'),year:Number(date.slice(0,4)),published_date:date,journal:clean(item['container-title']?.[0]||item.publisher||'Crossref record'),derived_authors:(item.author||[]).map(a=>clean([a.given,a.family].filter(Boolean).join(' ')||a.name)),paper_type:item.type==='posted-content'?'preprint':item.type||'unclassified',source:'Crossref',candidate:true,derived_methods:[],derived_topics:[],groups:[]};
}
const ml=/machine[- ]learning|deep[- ]learning|neural|artificial intelligence|data[- ]driven|bayesian|active[- ]learning|foundation model|language model|generative|self[- ]driving|autonomous|representation learning|informatics/i;
const chemistry=/cataly|ligand|chemical|chemistry|molecul|reaction|synthes|enzyme|quantum|material|electrochem/i;
const drugNoise=/protein[- ]ligand|ligand[- ]based drug|drug design|ligand binding|ligand docking|g-quadruplex|crystallographic|hit molecules|unbinding|ligand solvation|ligand atomic coordinates|map3k|molecular docking|kinase inhibitor/i;
const catalysisCore=/cataly|enantio|organometal|asymmetric|homogeneous|heterogeneous|cross[- ]coupl|hydrogenat|hydroformyl|c[-–]h |organocatal|biocatal|ligand select|ligand design|ligand optim|reaction optim|atroposelect|negishi|suzuki|buchwald|borylation|hydroformyl|transition[- ]metal|enantioselect/i;

export function relevant(work,scope){
 const title=work.label;
 if(scope==='milo')return work.derived_authors.some(a=>/\banat\s+milo\b/i.test(a));
 if(!ml.test(title))return false;
 if(drugNoise.test(title)&&!/cataly|asymmetric|organometal|homogeneous|enantioselect/i.test(title))return false;
 if(scope==='catalysis')return catalysisCore.test(title);
 return chemistry.test(title);
}
export function uniqueWorks(works){
 const seen=new Set();
 return works.filter(w=>{
  const keys=[doiKey(w.doi),titleKey(w.label)].filter(Boolean);
  if(keys.some(k=>seen.has(k)))return false;
  keys.forEach(k=>seen.add(k));
  return true;
 });
}
export function paperText(p){
 return [p.label,p.full_title,p.chemistry,p.chemistry_class,p.paradigm,p.representation_class,p.stack_layer,p.data_size_bin,p.validation_type,p.why,p.summary,p.brief,p.ask_next,p.descriptytor_role,p.descriptytor_vs,p.journal,(p.derived_authors||[]).join(' '),(p.groups||[]).join(' '),(p.derived_methods||[]).join(' '),(p.derived_topics||[]).join(' '),(p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();
}
function focusMatch(p,focus,text){
 if(!focus)return true;
 if(focus==='milo')return (p.groups||[]).includes('Milo')||(p.derived_authors||[]).some(a=>/anat milo/i.test(a));
 if(focus==='descriptytor')return Number.isFinite(p.descriptytor_rank);
 if(focus==='stack')return ['Ground-state conformers','TS search','TS ensembles','Thermochemistry'].includes(p.stack_layer)||/crest|autode|ts-tools|racerts|goodvibes|thermomlip|\bedbo\b/.test(text);
 const re={small:/small.data|sparse|few.shot|low.data|transfer/,representation:/descriptor|representation|conformer|3d|ligand.space|ligand library/,autonomous:/autonom|bayesian|active.learning|self.driving|hte/,mechanism:/mechanis|mlip|interatomic|transition.state/}[focus];
 return !re||re.test(text);
}
export function sortByFocus(papers,focus){
 if(focus!=='descriptytor')return papers;
 return papers.slice().sort((a,b)=>(a.descriptytor_rank??999)-(b.descriptytor_rank??999)||String(b.year).localeCompare(String(a.year))||String(a.label).localeCompare(String(b.label)));
}
export function filterPapers(papers,{q='',focus='',year='',unread=false,read={},chemistry='',representation='',stack=''}={}){
 return papers.filter(p=>{
  const text=paperText(p);
  return(!q||text.includes(q.toLowerCase()))
   &&(!year||String(p.year)===String(year))
   &&(!unread||!read[p.id])
   &&(!chemistry||p.chemistry_class===chemistry)
   &&(!representation||p.representation_class===representation)
   &&(!stack||p.stack_layer===stack)
   &&focusMatch(p,focus,text);
 });
}
export function discoveryQueries(scope){return scope==='milo'?['Anat Milo']:scope==='chemistry'?['machine learning chemistry','molecular representation learning','generative chemistry','machine learning interatomic potentials']:['machine learning catalysis','ligand design machine learning','Bayesian reaction optimization','autonomous catalysis']}
export function crossrefURL(query,scope,days,now=new Date()){
 const until=now.toISOString().slice(0,10),start=new Date(now);start.setUTCDate(start.getUTCDate()-Number(days));
 const p=new URLSearchParams({[scope==='milo'?'query.author':'query.title']:query,filter:`from-pub-date:${start.toISOString().slice(0,10)},until-pub-date:${until}`,rows:'100',sort:'relevance',order:'desc',select:'DOI,title,author,container-title,published,published-online,issued,type,publisher'});
 return 'https://api.crossref.org/works?'+p;
}
export function looksLikeDoi(value){
 return /^10\.\d{4,9}\/\S+$/i.test(doiKey(value));
}
export function searchCrossrefURL(q, days=3650, now=new Date()){
 q=clean(q);
 if(looksLikeDoi(q))return 'https://api.crossref.org/works/'+encodeURIComponent(doiKey(q));
 const until=now.toISOString().slice(0,10),start=new Date(now);start.setUTCDate(start.getUTCDate()-Number(days||3650));
 const p=new URLSearchParams({query:q,filter:`from-pub-date:${start.toISOString().slice(0,10)},until-pub-date:${until}`,rows:'40',sort:'relevance',order:'desc',select:'DOI,title,author,container-title,published,published-online,issued,type,publisher'});
 return 'https://api.crossref.org/works?'+p;
}
export async function searchWorks({q='',days=3650,fetcher=fetch,now=new Date()}={}){
 q=clean(q);
 if(!q)throw Error('Enter a DOI, title, or author.');
 const r=await fetcher(searchCrossrefURL(q,days,now),{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Crossref is unavailable. Please try again shortly.');
 const data=await r.json();
 const items=looksLikeDoi(q)?(data.message?[data.message]:[]):data.message?.items;
 if(!Array.isArray(items))throw Error('Invalid Crossref response');
 const papers=uniqueWorks(items.map(normalizeWork).filter(w=>w.doi));
 return {papers,fetched_at:now.toISOString(),query:q,doi:looksLikeDoi(q)};
}
export async function discover({scope='catalysis',days=90,fetcher=fetch,now=new Date()}={}){
 const queries=discoveryQueries(scope),works=[];let failed=0;
 // Two in flight at most; a failing query does not discard successful results.
 for(let i=0;i<queries.length;i+=2){const settled=await Promise.allSettled(queries.slice(i,i+2).map(async q=>{const r=await fetcher(crossrefURL(q,scope,days,now),{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`Crossref ${r.status}`);const data=await r.json();if(!Array.isArray(data.message?.items))throw Error('Invalid Crossref response');return data.message.items.map(normalizeWork)}));for(const r of settled){if(r.status==='fulfilled')works.push(...r.value);else failed++}}
 if(failed===queries.length)throw Error('Crossref is unavailable. Please try again shortly.');
 const start=new Date(now);start.setUTCDate(start.getUTCDate()-Number(days));
 return {papers:uniqueWorks(works).filter(w=>w.doi&&relevant(w,scope)&&w.published_date>=start.toISOString().slice(0,10)&&w.published_date<=now.toISOString().slice(0,10)).sort((a,b)=>b.published_date.localeCompare(a.published_date)),fetched_at:now.toISOString(),failed,query_count:queries.length,scope,days:Number(days)};
}

export const ATLAS_REPO = 'edenspec2/catalysis-ml-atlas';
export const ATLAS_SITE = 'https://edenspec2.github.io/catalysis-ml-atlas/';
const CHEMS = ['Asymmetric hydrogenation / reduction','C–H functionalization','Cross-coupling','Hydroformylation','Asymmetric C–C / oxidation','Organocatalysis','Biocatalysis','Main-group catalysis','Electrocatalysis','CO2 / N2 small-molecule catalysis','Ligand space / homogeneous method','Reaction mechanism / methodology'];
const REPS = ['Reusable ligand library','Physical / chemist descriptors','Conformer / ensemble descriptors','Catalyst-state / mechanistic','Learned 3D / TS GNN','Pretrained learned representation','MLIP / physics acceleration','Dataset / experimental loop','Overview / mixed'];
const STACKS = ['Ground-state conformers','TS search','TS ensembles','Thermochemistry','Descriptors','Supervised model','Experiment selection','MLIP / mechanism','Overview'];
const SIZES = ['n < 50','50–200','200–1000','>1000','virtual / computational','n/a overview','unspecified'];
const VALS = ['prospective experimental','autonomous closed-loop','scaffold / OOD','cross-substrate','random split','retrospective','mixed / unspecified','n/a overview'];

function bibEscape(s){
 return String(s??'').replace(/[{}\\]/g,'\\$&').replace(/\s+/g,' ').trim();
}
export function bibtexKey(p){
 const last = String((p.derived_authors||[])[0]||'atlas').split(/\s+/).pop().replace(/[^A-Za-z]/g,'') || 'atlas';
 const year = p.year || 'nd';
 const slug = doiKey(p.doi||p.id||'x').replace(/[^a-z0-9]+/g,'').slice(-10);
 return `${last}${year}${slug}`;
}
export function toBibTeX(papers){
 const seen = new Set();
 return (papers||[]).map(p=>{
  let key = bibtexKey(p);
  while(seen.has(key)) key += 'x';
  seen.add(key);
  const authors = (p.derived_authors||[]).map(bibEscape).join(' and ') || 'Unknown';
  const fields = [
   ['author', authors],
   ['title', bibEscape(p.full_title||p.label)],
   p.journal ? ['journal', bibEscape(p.journal)] : null,
   p.year ? ['year', String(p.year)] : null,
   p.doi ? ['doi', doiKey(p.doi)] : null,
   (p.url||p.doi) ? ['url', p.url || ('https://doi.org/'+doiKey(p.doi))] : null
  ].filter(row => row && row[1]);
  return `@article{${key},\n`+fields.map(([k,v])=>`  ${k} = {${v}}`).join(',\n')+'\n}';
 }).join('\n\n');
}
export function proposeIssueBody(p={}){
 const doi = p.doi ? doiKey(p.doi) : '';
 const title = p.full_title || p.label || '';
 return [
  '## Propose for the curated atlas',
  '',
  'This is a **proposal**. It is not added to the shared atlas until a curator writes the scientific notes (summary, stack, n, validation, ask next).',
  '',
  `- **DOI:** ${doi || '(required)'}`,
  `- **Title:** ${title || '(from Crossref)'}`,
  `- **Year / journal:** ${[p.year, p.journal].filter(Boolean).join(' · ') || ''}`,
  `- **Why it belongs (one sentence):** ${p.why || ''}`,
  `- **Chemistry class:** ${p.chemistry_class || ''} _(pick: ${CHEMS.join('; ')})_`,
  `- **Stack layer:** ${p.stack_layer || ''} _(pick: ${STACKS.join('; ')})_`,
  `- **Representation:** ${p.representation_class || ''} _(pick: ${REPS.join('; ')})_`,
  `- **Data size (n):** ${p.data_size_bin || ''} _(pick: ${SIZES.join('; ')})_`,
  `- **Validation:** ${p.validation_type || ''} _(pick: ${VALS.join('; ')})_`,
  `- **vs DescriPyTor (optional):** ${p.descriptytor_role || ''} _(ancestor / same-lab / contrast-pool / contrast-library / contrast-cavity / complement)_`,
  '',
  'Keep PDFs in the group Zotero collection. Do not attach publisher PDFs to this issue.'
 ].join('\n');
}
export function proposeIssueURL(p={}){
 const title = '[paper] ' + (p.doi ? doiKey(p.doi) : (p.label || 'new DOI'));
 const u = new URL(`https://github.com/${ATLAS_REPO}/issues/new`);
 u.searchParams.set('labels', 'paper-proposal');
 u.searchParams.set('title', title);
 u.searchParams.set('body', proposeIssueBody(p));
 return u.href;
}
export function blankProposeURL(){
 return `https://github.com/${ATLAS_REPO}/issues/new?template=propose-paper.yml&labels=paper-proposal`;
}
export function exportShelf({saved={},read={},added={},notes={}, now=new Date()}={}){
 return {version:1, exported_at: now.toISOString(), saved, read, added, notes};
}
export function mergeShelf(current={}, incoming){
 if(!incoming || typeof incoming!=='object') throw Error('Not a catalysis atlas shelf file.');
 if(incoming.saved==null && incoming.read==null && incoming.added==null && incoming.notes==null) throw Error('Not a catalysis atlas shelf file.');
 const pick = (a,b) => ({...(a&&typeof a==='object'?a:{}), ...(b&&typeof b==='object'?b:{})});
 return {
  saved: pick(current.saved, incoming.saved),
  read: pick(current.read, incoming.read),
  added: pick(current.added, incoming.added),
  notes: pick(current.notes, incoming.notes)
 };
}
