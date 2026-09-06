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
 return [p.label,p.full_title,p.chemistry,p.chemistry_class,p.paradigm,p.representation_class,p.why,p.summary,p.brief,p.ask_next,p.journal,(p.derived_authors||[]).join(' '),(p.groups||[]).join(' '),(p.derived_methods||[]).join(' '),(p.derived_topics||[]).join(' '),(p.secondary_paradigms||[]).join(' ')].join(' ').toLowerCase();
}
export function filterPapers(papers,{q='',focus='',year='',unread=false,read={},chemistry='',representation=''}={}){
 return papers.filter(p=>{
  const text=paperText(p);
  return(!q||text.includes(q.toLowerCase()))
   &&(!year||String(p.year)===String(year))
   &&(!unread||!read[p.id])
   &&(!chemistry||p.chemistry_class===chemistry)
   &&(!representation||p.representation_class===representation)
   &&(!focus||(focus==='milo'?((p.groups||[]).includes('Milo')||(p.derived_authors||[]).some(a=>/anat milo/i.test(a))):({small:/small.data|sparse|few.shot|low.data|transfer/,representation:/descriptor|representation|conformer|3d|ligand.space|ligand library/,autonomous:/autonom|bayesian|active.learning|self.driving|hte/,mechanism:/mechanis|mlip|interatomic|transition.state/}[focus]?.test(text))));
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
