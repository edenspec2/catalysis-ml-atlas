
import {discover,filterPapers,doiKey,searchWorks,toBibTeX,toReadingLog,proposeIssueURL,exportShelf,mergeShelf} from './literature.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>{try{const u=new URL(s);return /^https?:$/.test(u.protocol)?u.href:'#'}catch{return '#'}};
function load(k,f){try{return JSON.parse(localStorage.getItem('cml:'+k))??f}catch{return f}}
function persist(k,v){try{localStorage.setItem('cml:'+k,JSON.stringify(v))}catch{toast('Storage unavailable. Changes last only for this session.')}}
let timer;function toast(s){$('#toast').textContent=s;clearTimeout(timer);timer=setTimeout(()=>$('#toast').textContent='',4000)}
const state={view:'library',focus:'',table:load('table',false),papers:[],feed:null,saved:load('saved',{}),added:load('added',{}),read:load('read',{}),notes:load('notes',{}),projects:load('projects',{}),project:'',compare:[],active:null,loading:false,known:{},inspectSort:{key:'year',dir:'desc'}};
const byId=new Map(),dois=new Set();
const find=id=>byId.get(id)||state.added[id]||state.known[id]||state.saved[id];
const inCorpus=p=>!!p.doi&&dois.has(doiKey(p.doi));
const libraryPapers=()=>state.papers.concat(Object.values(state.added).filter(p=>p.doi&&!inCorpus(p)));
const thumb=src=>src.replace('figures/','figures/thumb/').replace(/\.\w+$/,'.webp');
function smooth(change){
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(change);else change();
}
function stampAdded(p){
 return {...p,type:'paper',added:true,candidate:true,full_title:p.full_title||p.label,summary:p.summary||((p.derived_authors||[]).slice(0,3).join(', ')+(p.derived_authors?.length?' · ':'')+'Crossref record added on this device; not yet curated.'),brief:p.brief||'Added from Crossref',ask_next:p.ask_next||'Read it and decide whether it belongs in the shared curated atlas.',use_for:p.use_for||'Personal shelf only until it is curated.'};
}
const day=(d,o={day:'numeric',month:'short',year:'numeric'})=>new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',o);
const date=p=>p.published_date?.length===10?day(p.published_date):p.published_date||p.year;
const icon=n=>'<svg class="i" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const button=(attr,id,label,selected=false)=>'<button '+attr+'="'+esc(id)+'" class="'+(selected?'selected':'')+'" aria-pressed="'+selected+'">'+label+'</button>';
const ORDER=['Reusable ligand library','Physical / chemist descriptors','Conformer / ensemble descriptors','Catalyst-state / mechanistic','Learned 3D / TS GNN','Pretrained learned representation','MLIP / physics acceleration','Dataset / experimental loop','Overview / mixed'];
const CHEMS=['Asymmetric hydrogenation / reduction','C–H functionalization','Cross-coupling','Hydroformylation','Asymmetric C–C / oxidation','Organocatalysis','Biocatalysis','Main-group catalysis','Electrocatalysis','CO2 / N2 small-molecule catalysis','Ligand space / homogeneous method','Reaction mechanism / methodology'];
const STACKS=['Ground-state conformers','TS search','TS ensembles','Thermochemistry','Descriptors','Supervised model','Experiment selection','MLIP / mechanism','Overview'];
const SIZE_ORD={'n < 50':0,'50–200':1,'200–1000':2,'>1000':3,'virtual / computational':4,'n/a overview':5,'unspecified':6};
const PAGE_VIEWS=['library','saved','read','compare','latest','board'];
const TITLES={saved:'To Read',read:'Read',latest:'Find Papers',board:'Overview'};
function setView(view){
 if(!PAGE_VIEWS.includes(view))view='library';
 state.view=view;
 try{history.replaceState(null,'',view==='library'?(location.pathname+location.search||'./'):'#'+view)}catch{}
}
const queued=()=>Object.values(state.saved).filter(p=>!state.read[p.id]);
const finished=()=>Object.keys(state.read).filter(id=>state.read[id]).map(find).filter(Boolean).sort((a,b)=>String(readDate(b)).localeCompare(String(readDate(a))));
const readDate=p=>typeof state.read[p.id]==='string'?state.read[p.id]:'';
function fillSelects(){
 const chem=$('#chemistry'),year=$('#year');
 const years=[...new Set(state.papers.map(p=>String(p.year)).filter(y=>/^\d{4}$/.test(y)))].sort((a,b)=>b.localeCompare(a));
 year.innerHTML='<option value="">All years</option>'+years.map(y=>'<option>'+esc(y)+'</option>').join('');
 chem.innerHTML='<option value="">All chemistry</option>'+[...new Set(state.papers.map(p=>p.chemistry_class).filter(Boolean))].sort().map(c=>'<option>'+esc(c)+'</option>').join('');
 document.querySelectorAll('[data-focus] .n').forEach(n=>n.textContent=filterPapers(libraryPapers(),{focus:n.parentElement.dataset.focus}).length);
}
function tally(ps,key){
 const m=new Map();
 for(const p of ps){
  const raw=typeof key==='function'?key(p):p[key];
  for(const v of (Array.isArray(raw)?raw:[raw])){const name=v&&v!=='Other'?v:'unspecified';m.set(name,(m.get(name)||0)+1)}
 }
 return [...m.entries()].sort((a,b)=>b[1]-a[1]).map(([name,n])=>({name,n}));
}
function bars(rows,max){
 const m=max||Math.max(1,...rows.map(r=>r.n));
 return '<div class="bars">'+rows.map(r=>'<div class="bar-row"><span>'+esc(r.name)+'</span><span class="bar-track"><i style="width:'+Math.max(6,Math.round(100*r.n/m))+'%"></i></span><b>'+r.n+'</b></div>').join('')+'</div>';
}
function card(p){
 const id=p.id,isNew=p.added||p.candidate,read=!!state.read[id],queue=!!state.saved[id]&&!read;
 const summary=isNew?((p.derived_authors||[]).slice(0,3).join(', ')+((p.derived_authors||[]).length>3?' et al.':'')):(p.summary||p.why||'');
 const meta=[date(p),p.journal,isNew?'':p.chemistry_class,readDate(p)?'Read '+day(readDate(p),{day:'numeric',month:'short'}):''].filter(Boolean).join(' · ');
 const add=!isNew||inCorpus(p)?'':button('data-add',id,state.added[id]?'Added ✓':'Add',!!state.added[id]);
 const fig=p.figure?.src&&!isNew?`<button type="button" class="fig fig-card" data-fig="${esc(id)}" aria-label="Open figure"><img src="${esc(thumb(p.figure.src))}" alt="" loading="lazy" decoding="async"></button>`:'';
 return '<article class="paper'+(read?' done':'')+'" data-id="'+esc(id)+'"><button class="circle'+(read?' on':'')+'" data-read="'+esc(id)+'" aria-pressed="'+read+'" aria-label="Mark as read">'+icon('check')+'</button><div class="row-main"><h3>'+button('data-detail',id,esc(p.full_title||p.label))+'</h3><p class="meta">'+esc(meta)+'</p>'+(state.notes[id]?'<p class="note-line">'+esc(state.notes[id])+'</p>':'<p class="summary">'+esc(summary)+'</p>')+'</div>'+fig+add+'<button class="flag'+(queue?' on':'')+'" data-save="'+esc(id)+'" aria-pressed="'+queue+'" aria-label="To read">'+icon('bookmark')+'</button></article>';
}
const rows=ps=>'<div class="cards">'+ps.map(card).join('')+'</div>';
function byMonth(ps){
 const groups=new Map();
 for(const p of ps){const k=readDate(p)?day(readDate(p),{month:'long',year:'numeric'}):'Earlier';groups.set(k,[...(groups.get(k)||[]),p])}
 return [...groups].map(([k,v])=>'<h2 class="month">'+esc(k)+'</h2>'+rows(v)).join('');
}
function listSource(){
 if(state.project&&state.view==='library')return (state.projects[state.project]||[]).map(find).filter(Boolean);
 return state.view==='latest'?(state.feed?.papers||[]):state.view==='saved'?queued():state.view==='read'?finished():libraryPapers();
}
function visiblePapers(){
 if(state.view==='compare')return state.compare.map(find).filter(Boolean);
 return filterPapers(listSource(),filters());
}
function downloadFile(name,text,type){
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));
 a.download=name;
 a.rel='noopener';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportBib(){
 const ps=visiblePapers();
 if(!ps.length){toast('No papers in this list to export.');return}
 downloadFile('catalysis-ml-atlas.bib',toBibTeX(ps),'application/x-bibtex');
 toast('BibTeX for '+ps.length+' paper'+(ps.length===1?'':'s')+'.');
}
function exportNotes(){
 const ps=visiblePapers().filter(p=>state.read[p.id]||state.notes[p.id]);
 if(!ps.length){toast('No read papers or notes in this list yet.');return}
 downloadFile('reading-notes.md',toReadingLog(ps,{read:state.read,notes:state.notes}),'text/markdown');
 toast('Reading notes for '+ps.length+' paper'+(ps.length===1?'':'s')+'.');
}
function exportMyShelf(){
 downloadFile('catalysis-ml-atlas-shelf.json',JSON.stringify(exportShelf({saved:state.saved,read:state.read,added:state.added,notes:state.notes,projects:state.projects}),null,2),'application/json');
 toast('Backup saved. Restore it on another browser.');
}
async function importMyShelf(file){
 try{
  const incoming=JSON.parse(await file.text());
  const next=mergeShelf({saved:state.saved,read:state.read,added:state.added,notes:state.notes,projects:state.projects},incoming);
  state.saved=next.saved;state.read=next.read;state.added=next.added;state.notes=next.notes;state.projects=next.projects;
  persist('saved',state.saved);persist('read',state.read);persist('added',state.added);persist('notes',state.notes);persist('projects',state.projects);
  render();
  toast('Backup restored.');
 }catch(err){toast(err.message||'Could not read that file.')}
}
function filters(){
 if(state.view==='latest')return {};
 return{q:$('#search').value.trim(),focus:state.focus,year:$('#year').value,chemistry:$('#chemistry').value}
}
const anyFilter=()=>$('#search').value||state.focus||$('#year').value||$('#chemistry').value;
function clearFilters(){$('#search').value='';state.focus='';$('#year').value='';$('#chemistry').value='';render()}
function counts(){
 $('#all-count').textContent=libraryPapers().length;$('#saved-count').textContent=queued().length;$('#read-count').textContent=finished().length;$('#compare-count').textContent=state.compare.length;
 $('#compare-item').hidden=!state.compare.length&&state.view!=='compare';
 $('#projects').innerHTML=Object.keys(state.projects).map(name=>{
  const on=state.project===name&&state.view==='library';
  return '<div class="side-row"><button class="side-item'+(on?' active':'')+'" data-project="'+esc(name)+'"'+(on?' aria-current="page"':'')+'><span class="label">'+esc(name)+'</span><span class="n">'+state.projects[name].length+'</span></button>'+(on?'<button class="round" data-rename-project="'+esc(name)+'" aria-label="Rename project '+esc(name)+'">'+icon('edit')+'</button><button class="round" data-drop-project="'+esc(name)+'" aria-label="Delete project '+esc(name)+'">'+icon('close')+'</button>':'')+'</div>';
 }).join('');
}
function emptyState(){
 if(state.loading)return '<div class="empty">'+icon('find')+'<h3>Looking for papers…</h3></div>';
 if(anyFilter())return '<div class="empty">'+icon('find')+'<h3>No papers match</h3><button id="clear-filters">Clear filters</button></div>';
 if(state.project)return '<div class="empty">'+icon('all')+'<h3>No papers here yet</h3><p>Open a paper and tick this project.</p></div>';
 const copy={saved:['bookmark','Nothing to read yet','Tap the bookmark on a paper to keep it here.'],read:['done','No read papers yet','Tap the circle beside a paper when you finish it. It lands here by month, with your note.'],latest:['find','Search for a paper','Paste a DOI or a title above.']}[state.view]||['all','No papers','This list is empty.'];
 return '<div class="empty">'+icon(copy[0])+'<h3>'+copy[1]+'</h3><p>'+copy[2]+'</p></div>';
}
function render(){
 const v=state.view;document.body.dataset.view=v;counts();
 document.querySelectorAll('[data-view],[data-focus]').forEach(b=>{
  const on=b.dataset.focus?b.dataset.focus===state.focus&&v==='library':b.dataset.view===v&&!(v==='library'&&(state.focus||state.project));
  b.classList.toggle('active',on);
  if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 });
 document.querySelectorAll('[data-table]').forEach(b=>b.classList.toggle('selected',(b.dataset.table==='1')===!!state.table));
 $('#reading').hidden=v==='compare';$('#comparison').hidden=v!=='compare';$('#discovery').hidden=v!=='latest';
 if(v==='compare'){compare();return}
 const ps=filterPapers(listSource(),filters());
 $('#list-title').textContent=TITLES[v]||state.project||(state.focus?$('[data-focus="'+state.focus+'"] .label').textContent:'All Papers');
 $('#result-count').textContent=ps.length;
 if(v==='board'){board(ps);return}
 if(state.table&&v!=='latest'){inspect(ps);$('#clear-filters')?.addEventListener('click',clearFilters);return}
 const month=new Date().toISOString().slice(0,7),notes=ps.filter(p=>state.notes[p.id]).length;
 $('#source-note').textContent=v==='read'&&ps.length?ps.filter(p=>readDate(p).startsWith(month)).length+' this month · '+notes+' with notes':v==='latest'?'Crossref records stay on this device unless you propose them.':'';
 $('#results').innerHTML=!ps.length?emptyState():v==='read'?byMonth(ps):rows(ps);
 $('#clear-filters')?.addEventListener('click',clearFilters);
}
function ring(read,queue,total){
 const c=2*Math.PI*46,len=n=>total?c*n/total:0;
 const arc=(cls,n,start)=>n?'<circle class="'+cls+'" cx="60" cy="60" r="46" stroke-dasharray="'+len(n)+' '+c+'" stroke-dashoffset="'+(-start)+'"/>':'';
 return '<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="'+read+' read and '+queue+' to read, of '+total+' papers"><g transform="rotate(-90 60 60)"><circle class="track" cx="60" cy="60" r="46"/>'+arc('to-read',queue,len(read))+arc('done',read,0)+'</g><text x="60" y="60">'+Math.round(100*read/(total||1))+'%</text><text class="sub" x="60" y="76">read</text></svg>';
}
function yearChart(ps){
 const count={};
 for(const p of ps){const y=Number(p.year);if(y)count[y]=(count[y]||0)+1}
 const known=Object.keys(count).map(Number);if(!known.length)return '';
 const lo=Math.min(...known),hi=Math.max(...known),W=640,H=150,base=H-22,step=W/(hi-lo+1),bar=Math.min(26,step*.62),top=Math.max(...known.map(y=>count[y]));
 let marks='';
 for(let y=lo;y<=hi;y++){
  const n=count[y]||0,h=n?Math.max(3,(base-20)*n/top):0,x=(y-lo+.5)*step-bar/2,t=base-h,r=Math.min(4,bar/2,h),mid=x+bar/2;
  marks+='<g'+(n?' data-year="'+y+'"':'')+'><title>'+y+': '+n+' paper'+(n===1?'':'s')+'</title><rect class="hit" x="'+(mid-step/2)+'" width="'+step+'" height="'+H+'"/>'+(n?'<path d="M'+x+' '+base+'V'+(t+r)+'Q'+x+' '+t+' '+(x+r)+' '+t+'H'+(x+bar-r)+'Q'+(x+bar)+' '+t+' '+(x+bar)+' '+(t+r)+'V'+base+'Z"/>':'')+(n===top||y===hi?'<text class="val" x="'+mid+'" y="'+(t-6)+'">'+n+'</text>':'')+(y===hi||(y%5===0&&hi-y>2)?'<text x="'+mid+'" y="'+(H-6)+'">'+y+'</text>':'')+'</g>';
 }
 return '<svg class="years" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Papers per year, '+lo+' to '+hi+'"><line x1="0" x2="'+W+'" y1="'+base+'" y2="'+base+'"/>'+marks+'</svg>';
}
function board(ps){
 const chemN=Object.fromEntries(tally(ps,'chemistry_class').map(x=>[x.name,x.n]));
 const repN=Object.fromEntries(tally(ps,'representation_class').map(x=>[x.name,x.n]));
 const reps=ORDER.filter(r=>r!=='Overview / mixed');
 const cells=new Map();
 for(const p of ps){const k=p.chemistry_class+'|'+p.representation_class;cells.set(k,(cells.get(k)||0)+1)}
 const cell=(c,r)=>cells.get(c+'|'+r)||0;
 const maxCell=Math.max(1,...CHEMS.flatMap(c=>reps.map(r=>cell(c,r))));
 const gaps=CHEMS.flatMap(c=>reps.map(r=>({c,r,n:cell(c,r)}))).filter(x=>x.n===0&&(chemN[x.c]||0)>=2&&(repN[x.r]||0)>=2).slice(0,6);
 const heat='<div class="table-wrap" tabindex="0" role="region" aria-label="Chemistry by representation counts"><table class="heat"><thead><tr><th>Chemistry \\ representation</th>'+reps.map(r=>'<th>'+esc(r).replace(' / ',' /<br>')+'</th>').join('')+'</tr></thead><tbody>'+CHEMS.filter(c=>chemN[c]).map(c=>'<tr><th>'+esc(c)+'</th>'+reps.map(r=>{const n=cell(c,r);const a=n?Math.max(.12,n/maxCell):0;return '<td class="'+(n?'filled':'empty')+'" style="--a:'+a+'">'+(n||'·')+'</td>'}).join('')+'</tr>').join('')+'</tbody></table></div>';
 const prompts=gaps.length?gaps.map(g=>'<li><button type="button" class="gap" data-chem="'+esc(g.c)+'" data-rep="'+esc(g.r)+'"><b>'+esc(g.c)+'</b> has no <b>'+esc(g.r)+'</b> paper yet.</button></li>').join(''):'<li>This selection is too small to show empty cells.</li>';
 $('#source-note').textContent='Counts cover this atlas, not the whole literature.';
 const nRead=ps.filter(p=>state.read[p.id]).length,nQueue=ps.filter(p=>state.saved[p.id]&&!state.read[p.id]).length,nNotes=ps.filter(p=>state.notes[p.id]).length;
 const key=[['done','Read',nRead],['to-read','To read',nQueue],['','With notes',nNotes],['','Papers',ps.length]].map(([c,k,v])=>'<div class="stat"><b>'+v+'</b><span><i class="'+c+'"></i>'+esc(k)+'</span></div>').join('');
 $('#results').innerHTML='<div class="overview"><section class="progress">'+ring(nRead,nQueue,ps.length)+'<div class="stats">'+key+'</div></section><section class="by-year"><h3>By year</h3>'+yearChart(ps)+'</section></div><div class="board-grid"><section><h3>Stack layer</h3>'+bars(tally(ps,'stack_layer'))+'</section><section><h3>Data size</h3>'+bars(tally(ps,'data_size_bin'))+'</section><section><h3>How it was checked</h3>'+bars(tally(ps,'validation_type'))+'</section></div><h3>Chemistry × representation</h3>'+heat+'<h3>Open cells worth arguing</h3><ul class="gap-list">'+prompts+'</ul>';
}
function inspectSortValue(p,key){
 if(key==='year')return Number(p.year)||0;
 if(key==='n')return SIZE_ORD[p.data_size_bin]??9;
 if(key==='layer')return STACKS.indexOf(p.stack_layer);
 if(key==='paper')return String(p.full_title||p.label||'').toLowerCase();
 if(key==='validation')return String(p.validation_type||'');
 if(key==='chemistry')return String(p.chemistry_class||'');
 return '';
}
function inspectCell(p,id){
 if(id==='year')return p.year||'';
 if(id==='paper')return esc(p.label)+'<div class="muted">'+esc(p.journal||'')+'</div>';
 if(id==='n')return p.data_size_bin||'—';
 if(id==='validation')return p.validation_type||'—';
 if(id==='layer')return p.stack_layer||'—';
 if(id==='chemistry')return p.chemistry_class||'—';
 return '—';
}
function inspect(ps){
 const {key,dir}=state.inspectSort;
 const list=ps.slice().sort((a,b)=>{
  const av=inspectSortValue(a,key),bv=inspectSortValue(b,key);
  const cmp=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv));
  return (dir==='desc'?-1:1)*cmp||String(b.year).localeCompare(String(a.year))||String(a.label).localeCompare(String(b.label));
 });
 const cols=[['year','Year'],['paper','Paper'],['n','Data'],['validation','Checked'],['layer','Stack layer'],['chemistry','Chemistry']];
 const mark=id=>id===key?(dir==='desc'?' ▾':' ▴'):'';
 $('#source-note').textContent='Data and validation labels come from the curated notes; they are not new measurements.';
 $('#results').innerHTML=ps.length?'<div class="table-wrap inspect-wrap" tabindex="0" role="region" aria-label="Paper table"><table class="inspect"><thead><tr>'+cols.map(([id,label])=>'<th data-sort="'+id+'" aria-sort="'+(id===key?(dir==='desc'?'descending':'ascending'):'none')+'"><button type="button" data-sort="'+id+'">'+esc(label)+mark(id)+'</button></th>').join('')+'</tr></thead><tbody>'+list.map(p=>'<tr data-detail="'+esc(p.id)+'" tabindex="0" class="'+(state.read[p.id]?'done':'')+'">'+cols.map(([id])=>'<td>'+(id==='paper'?inspectCell(p,id):esc(inspectCell(p,id)))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':emptyState();
}
function openFigure(id){
 const p=find(id);if(!p?.figure?.src)return;
 $('#figbox-img').src=p.figure.src;
 $('#figbox-img').alt=p.figure.caption||'Figure 1';
 $('#figbox-cap').textContent=(p.full_title||p.label)+' · '+(p.figure.caption||'Figure 1');
 if(!$('#figbox').open)$('#figbox').showModal();
}
function projectChips(id){
 const names=Object.keys(state.projects);
 return names.length?'<div class="chips" role="group" aria-label="Projects">'+names.map(name=>button('data-assign',name,esc(name),state.projects[name].includes(id))).join('')+'</div>':'';
}
function assign(name,id){
 const p=find(id),list=state.projects[name];if(!p||!list)return;
 if(list.includes(id))list.splice(list.indexOf(id),1);else list.push(id);
 if(!inCorpus(p)&&!state.added[id]){state.added[id]=stampAdded(p);persist('added',state.added)}
 persist('projects',state.projects);render();details(id);
}
// Authors weigh least: otherwise prolific groups fill every list.
const TIES=[['derived_workflows',3],['derived_topics',2],['derived_methods',2],['derived_authors',.5]];
function similar(p){
 return state.papers.filter(q=>q.id!==p.id).map(q=>{
  const why=[];let score=0;
  for(const [field,weight] of TIES){const hit=(q[field]||[]).filter(x=>(p[field]||[]).includes(x));score+=weight*hit.length;why.push(...hit)}
  for(const field of ['chemistry_class','representation_class'])if(q[field]&&q[field]===p[field]){score++;why.push(q[field])}
  return {q,score,why};
 }).filter(s=>s.score).sort((a,b)=>b.score-a.score||(b.q.year-a.q.year)).slice(0,5);
}
function relatedHTML(p){
 const list=similar(p);
 return list.length?'<section class="related"><h3>Papers like this</h3>'+list.map(({q,why})=>'<button type="button" data-detail="'+esc(q.id)+'"><span>'+esc(q.full_title||q.label)+'</span><small>'+esc(why.slice(0,3).join(' · '))+'</small></button>').join('')+'</section>':'';
}
function details(id){
 const p=find(id);if(!p)return;state.active=id;
 const isNew=p.candidate,read=!!state.read[id],queue=!!state.saved[id]&&!read;
 const fig=p.figure?.src?`<button type="button" class="fig fig-lg" data-fig="${esc(p.id)}"><img src="${esc(p.figure.src)}" alt="${esc(p.figure.caption||'Figure 1')}" loading="eager"></button>`:'';
 const main=isNew?[['Authors',(p.derived_authors||[]).join(', ')],['Assessment','Not yet curated. Read the original paper to judge chemistry, data and validation.']]:[['Summary',p.summary],['Why it matters',p.why],['Ask next',p.ask_next]];
 const more=isNew?[['Record type',p.paper_type]]:[['Use this when',p.use_for],['Chemistry',p.chemistry||p.chemistry_class],['Stack layer',p.stack_layer],['Representation',p.representation_class],['Data',[p.data_size_bin,p.data_regime].filter(Boolean).join(' · ')],['Validation',[p.validation_type,p.validation].filter(Boolean).join(' · ')],['Methods',(p.derived_methods||[]).join(' · ')],['Authors',(p.derived_authors||[]).join(', ')],['Workflow',(p.derived_workflows||[]).join(' → ')],['Topics',(p.derived_topics||[]).join(' · ')]];
 const dl=rows=>rows.filter(([,v])=>v).map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('');
 const when=readDate(p)?'Read '+day(readDate(p)):read?'Read':'';
 $('#detail-body').innerHTML='<h2>'+esc(p.full_title||p.label)+'</h2><p class="muted">'+esc(date(p))+' · '+esc(p.journal)+'</p><div class="sheet-actions"><a class="primary" href="'+esc(url(p.url))+'" target="_blank" rel="noopener">Open paper ↗</a><div class="seg" role="group" aria-label="Reading status">'+button('data-save',id,'To Read',queue)+button('data-read',id,read?'Read ✓':'Read',read)+'</div><span class="muted">'+esc(when)+'</span></div><label class="note-box"><span>My notes</span><textarea id="paper-note" rows="4" placeholder="What did you take from this paper?">'+esc(state.notes[id]||'')+'</textarea></label>'+projectChips(id)+fig+'<dl>'+dl(main)+'</dl>'+relatedHTML(p)+'<details class="more"><summary>More about this paper</summary><dl>'+dl(more)+'<dt>DOI</dt><dd>'+esc(p.doi||'Not verified')+'</dd></dl><div class="sheet-links">'+(inCorpus(p)?'':button('data-add',id,state.added[id]?'Remove from my library':'Add to my library',!!state.added[id]))+(p.doi&&!inCorpus(p)?'<a href="'+esc(proposeIssueURL(p))+'" target="_blank" rel="noopener">Propose for the shared atlas ↗</a>':'')+button('data-compare',id,state.compare.includes(id)?'Remove from Compare':'Add to Compare',state.compare.includes(id))+'</div></details>';
 const wasOpen=$('#detail').open;
 if(!wasOpen){$('#detail').showModal();$('#detail').scrollTop=0}
 $('#paper-note')?.addEventListener('input',e=>{
  const v=e.target.value;if(v)state.notes[id]=v;else delete state.notes[id];persist('notes',state.notes);
 });
}
function compare(){
 const ps=state.compare.map(find).filter(Boolean);
 const fields=[['Summary',p=>p.summary],['Published',p=>date(p)],['Stack layer',p=>p.stack_layer],['Representation',p=>p.representation_class||p.derived_methods?.join(', ')],['Chemistry',p=>p.chemistry||p.chemistry_class],['Data size',p=>p.data_size_bin],['Data',p=>p.data_regime],['Validation type',p=>p.validation_type],['Validation',p=>p.validation],['Why it matters',p=>p.why],['Ask next',p=>p.ask_next]];
 $('#comparison').innerHTML='<div class="title-row"><h1>Compare</h1><div class="tools">'+(ps.length?'<button id="clear-compare">Clear</button>':'')+'</div></div><p class="muted">Up to four papers. Missing evidence means unassessed, not absent.</p>'+(ps.length?'<div class="table-wrap" tabindex="0" role="region" aria-label="Paper comparison"><table><thead><tr><th></th>'+ps.map(p=>'<th>'+esc(p.full_title||p.label)+'<br>'+button('data-compare',p.id,'Remove')+'</th>').join('')+'</tr></thead><tbody>'+fields.map(([name,fn])=>'<tr><th>'+name+'</th>'+ps.map(p=>'<td>'+esc(fn(p)||'Not assessed')+'</td>').join('')+'</tr>').join('')+'<tr><th>Original source</th>'+ps.map(p=>'<td><a target="_blank" rel="noopener" href="'+esc(url(p.url))+'">Read paper ↗</a></td>').join('')+'</tr></tbody></table></div>':'<div class="empty"><h3>Nothing to compare</h3><p>Open a paper, then Add to Compare under More about this paper.</p></div>');
 $('#clear-compare')?.addEventListener('click',()=>{state.compare=[];setView('library');render()});
}
function reconcile(feed){for(const p of feed.papers)state.known[p.id]=p;const curated=new Map(state.papers.filter(p=>p.doi).map(p=>[doiKey(p.doi),p]));return {...feed,papers:feed.papers.map(p=>curated.get(doiKey(p.doi))||p)}}
let request=0;
async function searchNow(){
 const q=$('#find').value.trim();
 if(!q){toast('Enter a DOI, title, or author.');return}
 const id=++request;
 state.loading=true;$('#find-go').disabled=true;$('#feed-status').textContent='Searching Crossref…';render();
 try{const feed=await searchWorks({q,days:3650});if(id!==request)return;state.feed=reconcile(feed);$('#feed-status').textContent=feed.papers.length+' results'}
 catch(err){if(id!==request)return;$('#feed-status').textContent=err.message||'Search failed. Try a DOI.'}
 finally{if(id===request){state.loading=false;$('#find-go').disabled=false;render()}}
}
async function refresh(){
 const id=++request,scope=$('#scope').value,days=90,key='feed:'+scope+':'+days;
 state.loading=true;$('#refresh').disabled=true;$('#feed-status').textContent='Checking Crossref…';
 const cached=load(key,null);state.feed=cached?reconcile(cached):null;render();
 try{const feed=await discover({scope,days});if(id!==request)return;persist(key,feed);state.feed=reconcile(feed);$('#feed-status').textContent=feed.papers.length+' papers from the last 90 days'+(feed.failed?' · some searches failed, refresh to retry':'')}
 catch{if(id!==request)return;if(!state.feed&&scope==='catalysis'){try{const r=await fetch('feed-snapshot.json');if(r.ok)state.feed=reconcile(await r.json())}catch{}}$('#feed-status').textContent=state.feed?'Offline. Showing a snapshot from '+new Date(state.feed.fetched_at).toLocaleDateString('en-GB')+'.':'Could not reach Crossref. Refresh to retry.'}
 finally{if(id===request){state.loading=false;$('#refresh').disabled=false;render()}}
}
function toggleRead(id){
 const p=find(id);if(!p)return;
 if(state.read[id])delete state.read[id];
 else{
  state.read[id]=new Date().toISOString().slice(0,10);delete state.saved[id];
  if(!inCorpus(p)&&!state.added[id]){state.added[id]=stampAdded(p);persist('added',state.added)}
 }
 persist('read',state.read);persist('saved',state.saved);
}
function toggleQueued(id){
 const p=find(id);if(!p)return;
 if(state.saved[id]&&!state.read[id])delete state.saved[id];
 else{state.saved[id]=p;delete state.read[id]}
 persist('saved',state.saved);persist('read',state.read);
}
// Update the row in place so the tick animates; lists that lose the row redraw once it has played.
function statusChanged(b,id){
 const row=b.closest('.paper');
 if($('#detail').open||!row){render();if($('#detail').open)details(state.active);return}
 const read=!!state.read[id],queue=!!state.saved[id]&&!read;
 row.classList.toggle('done',read);row.querySelector('.circle').classList.toggle('on',read);row.querySelector('.flag').classList.toggle('on',queue);
 row.querySelector('.circle').setAttribute('aria-pressed',read);row.querySelector('.flag').setAttribute('aria-pressed',queue);
 counts();
 if(state.view==='saved'||state.view==='read')setTimeout(render,340);
}
// Hover preview: thumb shows at once as the background, the full figure loads over it.
let peekTimer,peeked=null;
// Abstracts are fetched live from OpenAlex and never stored in the repo.
const abstracts=new Map();
function abstractOf(doi){
 if(!abstracts.has(doi))abstracts.set(doi,fetch('https://api.openalex.org/works/doi:'+encodeURIComponent(doi)+'?select=abstract_inverted_index').then(r=>r.ok?r.json():null).then(w=>{
  const words=[];for(const [word,at] of Object.entries(w?.abstract_inverted_index||{}))for(const i of at)words[i]=word;
  return words.join(' ').replace(/^High Resolution Image Download MS PowerPoint Slide\s*/,'');
 }).catch(()=>''));
 return abstracts.get(doi);
}
function placePeek(row,x){
 const box=$('#peek'),r=row.getBoundingClientRect(),H=box.offsetHeight;
 box.style.left=Math.max(8,Math.min(innerWidth-448,x+16))+'px';
 box.style.top=(r.bottom+H+8<innerHeight?r.bottom+6:Math.max(8,r.top-H-6))+'px';
}
function hidePeek(){clearTimeout(peekTimer);peeked=null;$('#peek').hidden=true}
document.addEventListener('mouseover',e=>{
 if(!window.matchMedia?.('(hover: hover)').matches)return;
 const row=e.target.closest('.paper,tr[data-detail]');
 if(row&&row===peeked)return;
 hidePeek();
 const p=row&&find(row.dataset.id||row.dataset.detail);
 const hasFig=p?.figure?.src&&!p.candidate;
 if(!hasFig&&!p?.summary&&!p?.doi)return;
 peeked=row;
 peekTimer=setTimeout(()=>{
  const box=$('#peek'),img=box.firstChild,text=box.lastChild;
  img.removeAttribute('src');
  box.classList.toggle('text',!hasFig);
  if(hasFig){
   img.style.backgroundImage='url("'+thumb(p.figure.src)+'")';
   img.src=p.figure.src;
   text.textContent=p.figure.kind==='toc'?'Graphical abstract':p.figure.caption||'Figure 1';
  }else{
   text.textContent=p.summary||'';
   if(p.doi)abstractOf(p.doi).then(a=>{if(a&&peeked===row){text.textContent=a;placePeek(row,e.clientX)}});
  }
  box.hidden=false;
  placePeek(row,e.clientX);
 },220);
});
addEventListener('scroll',hidePeek,{passive:true});
document.addEventListener('click',e=>{
 hidePeek();
 document.querySelectorAll('details.menu[open]').forEach(d=>{if(!d.contains(e.target)||e.target.closest('button'))d.open=false});
 const fig=e.target.closest('[data-fig]');
 if(fig){openFigure(fig.dataset.fig);return}
 const year=e.target.closest('[data-year]');
 if(year){state.focus='';$('#year').value=year.dataset.year;setView('library');smooth(render);return}
 const sort=e.target.closest('[data-sort]');
 if(sort){
  const key=sort.dataset.sort;
  state.inspectSort={key,dir:state.inspectSort.key===key&&state.inspectSort.dir==='asc'?'desc':'asc'};
  render();return
 }
 const row=e.target.closest('tr[data-detail],.paper');
 if(row&&!e.target.closest('button,a')){details(row.dataset.detail||row.dataset.id);return}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.detail){details(b.dataset.detail);$('#detail').scrollTop=0;return}
 if(b.dataset.assign){assign(b.dataset.assign,state.active);return}
 if(b.dataset.project){state.project=b.dataset.project;state.focus='';setView('library');smooth(()=>{render();window.scrollTo({top:0})});return}
 if(b.dataset.renameProject){
  const old=b.dataset.renameProject,name=prompt('Rename project',old)?.trim();
  if(!name||name===old)return;
  state.projects[name]=[...new Set([...(state.projects[name]||[]),...state.projects[old]])];delete state.projects[old];
  state.project=name;persist('projects',state.projects);render();return
 }
 if(b.dataset.dropProject){if(confirm('Delete the project "'+b.dataset.dropProject+'"? Its papers stay in the library.')){delete state.projects[b.dataset.dropProject];state.project='';persist('projects',state.projects);render()}return}
 if(b.dataset.save){toggleQueued(b.dataset.save);statusChanged(b,b.dataset.save);return}
 if(b.dataset.read){toggleRead(b.dataset.read);statusChanged(b,b.dataset.read);return}
 if(b.dataset.add){const p=find(b.dataset.add);if(!p||inCorpus(p))return;if(state.added[p.id])delete state.added[p.id];else state.added[p.id]=stampAdded(p);persist('added',state.added);render();if($('#detail').open)details(state.active);return}
 if(b.dataset.compare){const id=b.dataset.compare;if(state.compare.includes(id))state.compare=state.compare.filter(x=>x!==id);else if(state.compare.length<4)state.compare.push(id);else toast('Compare up to four papers. Remove one first.');render();if($('#detail').open)details(state.active);return}
 if(b.classList.contains('gap')){
  state.focus='';$('#chemistry').value=b.dataset.chem;setView('library');render();return
 }
 if(b.dataset.table){state.table=b.dataset.table==='1';persist('table',state.table);smooth(render);return}
 if(b.dataset.focus){state.focus=b.dataset.focus;state.project='';setView('library');smooth(()=>{render();window.scrollTo({top:0})});return}
 if(b.dataset.view){state.focus='';state.project='';setView(b.dataset.view);smooth(()=>{render();window.scrollTo({top:0})});if(state.view==='latest'&&!state.feed)refresh()}
});
for(const id of ['#year','#chemistry'])$(id).addEventListener('change',render);
let typing;$('#search').addEventListener('input',()=>{clearTimeout(typing);typing=setTimeout(render,80)});
$('#new-project').addEventListener('keydown',e=>{
 const name=e.target.value.trim();if(e.key!=='Enter'||!name)return;
 state.projects[name]||=[];persist('projects',state.projects);e.target.value='';state.project=name;state.focus='';setView('library');render();
});
$('#refresh').onclick=refresh;$('#scope').onchange=refresh;
$('#find-go').onclick=searchNow;$('#find').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchNow()}});
$('#export-bib').addEventListener('click',exportBib);
$('#export-notes').addEventListener('click',exportNotes);
$('#export-shelf').addEventListener('click',exportMyShelf);
$('#import-shelf').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importMyShelf(f);e.target.value='';});
document.addEventListener('keydown',e=>{
 if(e.key!=='Enter')return;
 const row=e.target.closest('tr[data-detail]');
 if(row){e.preventDefault();details(row.dataset.detail)}
});
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();$('#close-detail').onclick=()=>$('#detail').close();
$('#close-fig').addEventListener('click',()=>$('#figbox').close());
for(const id of ['#detail','#figbox','#help-dialog'])$(id).addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();if(e.target===e.currentTarget&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))e.currentTarget.close()});
// Project lists arrive in the URL fragment, which browsers never send to the server.
function importLink(){
 const m=location.hash.match(/^#projects=(.+)/);if(!m)return;
 history.replaceState(null,'',location.pathname+location.search);
 try{
  const incoming=JSON.parse(atob(m[1]));
  if(!confirm('Add these projects to this browser?\n\n'+Object.keys(incoming).join('\n')))return;
  // Incoming first, so a re-ranked link reorders lists already in this browser.
  state.projects=mergeShelf({projects:incoming},{projects:state.projects}).projects;
  persist('projects',state.projects);
 }catch{toast('That project link could not be read.')}
}
async function init(){try{const r=await fetch('papers.json');if(!r.ok)throw Error();state.papers=(await r.json()).sort((a,b)=>(b.published_date||String(b.year)).localeCompare(a.published_date||String(a.year))||a.label.localeCompare(b.label));for(const p of state.papers){byId.set(p.id,p);if(p.doi)dois.add(doiKey(p.doi))}importLink();const h=decodeURIComponent(location.hash.slice(1));if(PAGE_VIEWS.includes(h))state.view=h;fillSelects();render();if(h&&find(h))details(h);if(state.view==='latest'&&!state.feed)refresh()}catch{$('#results').innerHTML='<div class="empty">The library could not load. <button id="retry">Try again</button></div>';$('#retry').onclick=init}}
init();
