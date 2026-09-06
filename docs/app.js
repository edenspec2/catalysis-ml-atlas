
import {discover,filterPapers,doiKey,searchWorks,sortByFocus} from './literature.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>{try{const u=new URL(s);return /^https?:$/.test(u.protocol)?u.href:'#'}catch{return '#'}};
function load(k,f){try{return JSON.parse(localStorage.getItem('cml:'+k))??f}catch{return f}}
function persist(k,v){try{localStorage.setItem('cml:'+k,JSON.stringify(v))}catch{toast('Storage unavailable. Changes last only for this session.')}}
let timer;function toast(s){$('#toast').textContent=s;clearTimeout(timer);timer=setTimeout(()=>$('#toast').textContent='',4000)}
const state={view:'library',papers:[],feed:null,saved:load('saved',{}),added:load('added',{}),read:load('read',{}),compare:[],active:null,loading:false,known:{},inspectSort:{key:'layer',dir:'asc'}};
const find=id=>state.papers.find(p=>p.id===id)||state.added[id]||state.feed?.papers.find(p=>p.id===id)||state.saved[id]||state.known[id];
const curated=()=>state.papers.filter(p=>!p.added);
const inCorpus=p=>curated().some(c=>c.doi&&p.doi&&doiKey(c.doi)===doiKey(p.doi));
function libraryPapers(){
 const have=new Set(curated().map(p=>doiKey(p.doi)).filter(Boolean));
 return curated().concat(Object.values(state.added).filter(p=>p.doi&&!have.has(doiKey(p.doi))));
}
function stampAdded(p){
 return {...p,type:'paper',added:true,candidate:true,full_title:p.full_title||p.label,summary:p.summary||((p.derived_authors||[]).slice(0,3).join(', ')+(p.derived_authors?.length?' · ':'')+'Crossref record added on this device; not yet curated.'),brief:p.brief||'Added from Crossref',ask_next:p.ask_next||'Read it and decide whether it belongs in the shared curated atlas.',use_for:p.use_for||'Personal shelf only until it is curated.'};
}
const date=p=>!p.published_date?p.year+' · exact date unverified':p.published_date.length===10?new Date(p.published_date+'T12:00:00Z').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):p.published_date;
const button=(attr,id,label,selected=false)=>'<button '+attr+'="'+esc(id)+'" class="'+(selected?'selected':'')+'" aria-pressed="'+selected+'">'+label+'</button>';
const ORDER=['Reusable ligand library','Physical / chemist descriptors','Conformer / ensemble descriptors','Catalyst-state / mechanistic','Learned 3D / TS GNN','Pretrained learned representation','MLIP / physics acceleration','Dataset / experimental loop','Overview / mixed'];
const CHEMS=['Asymmetric hydrogenation / reduction','C–H functionalization','Cross-coupling','Hydroformylation','Asymmetric C–C / oxidation','Organocatalysis','Biocatalysis','Main-group catalysis','Electrocatalysis','CO2 / N2 small-molecule catalysis','Ligand space / homogeneous method','Reaction mechanism / methodology'];
const STACKS=['Ground-state conformers','TS search','TS ensembles','Thermochemistry','Descriptors','Supervised model','Experiment selection','MLIP / mechanism','Overview'];
const SIZE_ORD={'n < 50':0,'50–200':1,'200–1000':2,'>1000':3,'virtual / computational':4,'n/a overview':5,'unspecified':6};
const VS_ROLE={ancestor:'Ancestor','same-lab':'Same lab','contrast-pool':'Contrast · pool','contrast-library':'Contrast · library','contrast-cavity':'Contrast · cavity',complement:'Complement'};
const vsFocus=()=>$('#focus')?.value==='descriptytor';
function fillSelects(){
 const chem=$('#chemistry'),rep=$('#representation'),year=$('#year'),stack=$('#stack');
 if(year){
  const keep=year.value;
  const years=[...new Set(state.papers.map(p=>String(p.year)).filter(y=>/^\d{4}$/.test(y)))].sort((a,b)=>b.localeCompare(a));
  year.innerHTML='<option value="">All years</option>'+years.map(y=>'<option>'+esc(y)+'</option>').join('');
  if(keep&&[...year.options].some(o=>o.value===keep))year.value=keep;
 }
 if(!chem||chem.options.length>1)return;
 [...new Set(state.papers.map(p=>p.chemistry_class).filter(Boolean))].sort().forEach(c=>chem.insertAdjacentHTML('beforeend','<option>'+esc(c)+'</option>'));
 ORDER.filter(r=>state.papers.some(p=>p.representation_class===r)).forEach(r=>rep.insertAdjacentHTML('beforeend','<option>'+esc(r)+'</option>'));
 if(stack)STACKS.filter(s=>state.papers.some(p=>p.stack_layer===s)).forEach(s=>stack.insertAdjacentHTML('beforeend','<option>'+esc(s)+'</option>'));
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
function facts(p){
 const items=[['n',p.data_size_bin],['Checked',p.validation_type],['Layer',p.stack_layer]].filter(([,v])=>v);
 if(vsFocus()&&p.descriptytor_rank)items.unshift(['Rank','#'+p.descriptytor_rank],['Vs DescriPyTor',VS_ROLE[p.descriptytor_role]||p.descriptytor_role]);
 return items.length?'<div class="facts">'+items.map(([k,v])=>'<span class="fact"><i>'+esc(k)+'</i>'+esc(v)+'</span>').join('')+'</div>':'';
}
function card(p){
 const summary=p.added||p.candidate?(p.derived_authors.slice(0,3).join(', ')+(p.derived_authors.length>3?' et al.':'')||p.summary||'Author metadata unavailable'):(p.summary||p.why||'');
 const chips=p.added||(p.candidate&&!inCorpus(p))?['Crossref · not assessed']:[p.representation_class||p.paradigm,p.chemistry_class,p.stack_layer,...(p.groups||[]).filter(g=>g!=='Other')].filter(Boolean);
 const badge=inCorpus(p)&&!p.added?'CURATED':p.added?'ADDED':p.paper_type==='preprint'?'PREPRINT':'CANDIDATE';
 const add=inCorpus(p)?'':button('data-add',p.id,state.added[p.id]?'Remove from my library':'Add to my library',!!state.added[p.id]);
 const fig=p.figure?.src&&!p.added&&!p.candidate?`<button type="button" class="fig fig-card" data-fig="${esc(p.id)}"><img src="${esc(p.figure.src)}" alt="${esc(p.figure.caption||'Figure 1')}" loading="lazy"></button>`:'';
 const vs=vsFocus()&&p.descriptytor_vs?'<p class="prompt">'+esc(p.descriptytor_vs)+'</p>':'';
 return '<article class="paper"><div class="paper-top"><span>'+esc(date(p))+'<br>'+esc(p.journal)+'</span><span class="badge">'+badge+'</span></div>'+fig+'<h3>'+button('data-detail',p.id,esc(p.full_title||p.label))+'</h3>'+(p.added||p.candidate?'':facts(p))+vs+'<p class="summary">'+esc(summary)+'</p><div class="tags">'+chips.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div><div class="actions">'+button('data-detail',p.id,'Details')+'<a href="'+esc(url(p.url))+'" target="_blank" rel="noopener">Paper ↗</a>'+add+button('data-save',p.id,state.saved[p.id]?'Saved ✓':'Save',!!state.saved[p.id])+button('data-compare',p.id,state.compare.includes(p.id)?'Comparing ✓':'Compare',state.compare.includes(p.id))+'</div>'+(state.read[p.id]?'<p class="read-status">Marked as read ✓</p>':'')+'</article>';
}
function filters(){
 if(state.view==='latest')return {q:'',focus:'',year:'',unread:false,read:{},chemistry:'',representation:'',stack:''};
 return{q:$('#search').value.trim(),focus:$('#focus').value,year:$('#year').value,unread:$('#unread').checked,read:state.read,chemistry:$('#chemistry')?.value||'',representation:$('#representation')?.value||'',stack:$('#stack')?.value||''}
}
function render(){
 $('#saved-count').textContent=Object.keys(state.saved).length;$('#compare-count').textContent=state.compare.length;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);b.setAttribute('aria-current',b.dataset.view===state.view?'page':'false')});
 $('#reading').hidden=state.view==='compare'||state.view==='representations';$('#comparison').hidden=state.view!=='compare'&&state.view!=='representations';$('#discovery').hidden=state.view!=='latest';
 if(state.view==='compare'){compare();return}
 if(state.view==='representations'){representations();return}
 const source=state.view==='latest'?(state.feed?.papers||[]):state.view==='saved'?Object.values(state.saved):libraryPapers();
 const ps=sortByFocus(filterPapers(source,filters()),filters().focus);
 if(state.view==='board'){board(ps);return}
 if(state.view==='inspect'){inspect(ps);return}
 const extra=Object.keys(state.added).length;
 $('#list-title').textContent={library:'Your research library',latest:'Find and add papers',saved:'Your saved reading'}[state.view];$('#result-count').textContent=ps.length+' papers';
 $('#source-note').textContent=state.view==='library'?(vsFocus()?'Ranked against the DescriPyTor idea: chemist-chosen axes on small catalytic n, not a fixed QM pool or a reaction-agnostic library.':curated().length+' curated papers in the shared atlas'+(extra?' · '+extra+' added on this device':'')+' · not an exhaustive literature search'):state.view==='saved'?'Saved on this device. Reading state is not synced between browsers.':'Crossref search. Title/DOI lookup can miss records; added papers stay on this device.';
 $('#results').innerHTML=ps.length?'<div class="cards">'+ps.map(card).join('')+'</div>':'<div class="empty"><h3>'+(state.loading?'Looking for papers…':'No papers in this view')+'</h3><p>'+(state.view==='saved'?'Save papers from the Library or Discover latest.':state.view==='latest'?'Search a DOI or title, or browse recent catalysis ML papers.':'Try a broader focus, clear the search, or increase the date window.')+'</p><button id="clear-filters">Clear filters</button></div>';
 $('#clear-filters')?.addEventListener('click',()=>{$('#search').value='';$('#focus').value='';$('#year').value='';$('#chemistry').value='';$('#representation').value='';if($('#stack'))$('#stack').value='';$('#unread').checked=false;render()});
}
function board(ps){
 const hard=ps.filter(p=>['prospective experimental','autonomous closed-loop','scaffold / OOD'].includes(p.validation_type)).length;
 const small=ps.filter(p=>p.data_size_bin==='n < 50').length;
 const reviews=ps.filter(p=>/review|perspective|viewpoint/i.test(p.paper_type||'')||p.data_size_bin==='n/a overview').length;
 const chemN=Object.fromEntries(tally(ps,'chemistry_class').map(x=>[x.name,x.n]));
 const repN=Object.fromEntries(tally(ps,'representation_class').map(x=>[x.name,x.n]));
 const reps=ORDER.filter(r=>r!=='Overview / mixed');
 const maxCell=Math.max(1,...ps.map(p=>1),...CHEMS.flatMap(c=>reps.map(r=>ps.filter(p=>p.chemistry_class===c&&p.representation_class===r).length)));
 const gaps=CHEMS.flatMap(c=>reps.map(r=>({c,r,n:ps.filter(p=>p.chemistry_class===c&&p.representation_class===r).length}))).filter(x=>x.n===0&&(chemN[x.c]||0)>=2&&(repN[x.r]||0)>=2).slice(0,10);
 const years=tally(ps,p=>String(p.year||'unknown')).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
 const heat='<div class="table-wrap" tabindex="0" role="region" aria-label="Chemistry by representation counts"><table class="heat"><thead><tr><th>Chemistry \\ representation</th>'+reps.map(r=>'<th>'+esc(r.replace(' / ',' /<br>'))+'</th>').join('')+'</tr></thead><tbody>'+CHEMS.filter(c=>chemN[c]).map(c=>'<tr><th>'+esc(c)+'</th>'+reps.map(r=>{const n=ps.filter(p=>p.chemistry_class===c&&p.representation_class===r).length;const a=n?Math.max(.12,n/maxCell):0;return '<td class="'+(n?'filled':'empty')+'" style="--a:'+a+'">'+(n||'·')+'</td>'}).join('')+'</tr>').join('')+'</tbody></table></div>';
 const prompts=gaps.length?gaps.map(g=>'<li><button type="button" class="gap" data-chem="'+esc(g.c)+'" data-rep="'+esc(g.r)+'"><b>'+esc(g.c)+'</b> has no <b>'+esc(g.r)+'</b> paper in this slice. '+(chemN[g.c]||0)+' papers sit in other representations.</button></li>').join(''):'<li>This slice is too small to show empty cells. Clear a filter.</li>';
 const next=ps.filter(p=>p.ask_next).slice(0,6).map(p=>'<li>'+button('data-detail',p.id,esc(p.label))+'<span class="muted">'+esc(p.ask_next)+'</span></li>').join('');
 $('#list-title').textContent='Brainstorm board';
 $('#result-count').textContent=ps.length+' papers in slice';
 $('#source-note').textContent='Counts include curated papers plus any you added on this device. Empty cells are coverage of this atlas, not of the whole literature.';
 $('#results').innerHTML='<div class="stats">'+[['Papers in slice',ps.length],['Prospective / OOD / closed-loop',hard],['n < 50 datasets',small],['Reviews / overviews',reviews]].map(([k,v])=>'<div class="stat"><b>'+v+'</b><span>'+esc(k)+'</span></div>').join('')+'</div><div class="board-grid"><section><h3>Papers by year</h3>'+bars(years)+'</section><section><h3>Stack layer</h3>'+bars(tally(ps,'stack_layer'))+'</section><section><h3>Representation</h3>'+bars(tally(ps,'representation_class'))+'</section><section><h3>Data size</h3>'+bars(tally(ps,'data_size_bin'))+'</section><section><h3>How it was checked</h3>'+bars(tally(ps,'validation_type'))+'</section></div><h3>Chemistry × representation</h3><p class="muted">Number of papers in this slice. A dot is an empty cell — a possible experiment, not a proof that the literature is empty.</p>'+heat+'<h3>Open cells worth arguing</h3><ul class="gap-list">'+prompts+'</ul><h3>Questions to take to the board</h3><ul class="next-list">'+next+'</ul>';
}
function inspectSortValue(p,key){
 if(key==='year')return Number(p.year)||0;
 if(key==='n')return SIZE_ORD[p.data_size_bin]??9;
 if(key==='layer')return STACKS.indexOf(p.stack_layer);
 if(key==='rank')return p.descriptytor_rank??999;
 if(key==='paper')return String(p.full_title||p.label||'').toLowerCase();
 if(key==='validation')return String(p.validation_type||'');
 if(key==='representation')return String(p.representation_class||'');
 if(key==='chemistry')return String(p.chemistry_class||'');
 if(key==='group')return String((p.groups||[]).filter(g=>g!=='Other')[0]||'');
 if(key==='role')return VS_ROLE[p.descriptytor_role]||p.descriptytor_role||'';
 if(key==='vs')return String(p.descriptytor_vs||'');
 return '';
}
function inspectCell(p,id){
 if(id==='rank')return p.descriptytor_rank?'#'+p.descriptytor_rank:'—';
 if(id==='year')return p.year||'';
 if(id==='paper')return esc(p.label)+'<div class="muted">'+esc(p.journal||'')+'</div>';
 if(id==='vs')return p.descriptytor_vs||'—';
 if(id==='role')return VS_ROLE[p.descriptytor_role]||p.descriptytor_role||'—';
 if(id==='n')return p.data_size_bin||'—';
 if(id==='validation')return p.validation_type||'—';
 if(id==='layer')return p.stack_layer||'—';
 if(id==='representation')return p.representation_class||'—';
 if(id==='chemistry')return p.chemistry_class||'—';
 if(id==='group')return (p.groups||[]).filter(g=>g!=='Other')[0]||'—';
 return '—';
}
function inspect(ps){
 const vs=vsFocus();
 if(vs&&state.inspectSort.key==='layer')state.inspectSort={key:'rank',dir:'asc'};
 if(!vs&&state.inspectSort.key==='rank')state.inspectSort={key:'layer',dir:'asc'};
 const {key,dir}=state.inspectSort;
 const rows=ps.slice().sort((a,b)=>{
  const av=inspectSortValue(a,key),bv=inspectSortValue(b,key);
  const cmp=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv));
  return (dir==='desc'?-1:1)*cmp||(a.descriptytor_rank??999)-(b.descriptytor_rank??999)||String(b.year).localeCompare(String(a.year))||String(a.label).localeCompare(String(b.label));
 });
 const cols=vs?[['rank','Rank'],['year','Year'],['paper','Paper'],['vs','vs DescriPyTor'],['role','Role'],['n','n'],['validation','Validation'],['group','Group']]:[['year','Year'],['paper','Paper'],['n','n'],['validation','Validation'],['layer','Stack layer'],['representation','Representation'],['chemistry','Chemistry'],['group','Group']];
 const mark=id=>id===key?(dir==='desc'?' ▾':' ▴'):'';
 $('#list-title').textContent=vs?'Inspect vs DescriPyTor':'Inspect the evidence';
 $('#result-count').textContent=ps.length+' papers';
 $('#source-note').textContent=vs?'Rank 1 is the paper you argue with first. Ancestor / same-lab / contrast / complement is relative to chemist-chosen axes on small catalytic n.':'Sort any column. Tap a row for notes. n and validation are inherited labels, not new measurements. CREST is ground-state; racerTS is TS ensembles; EDBO is experiment selection.';
 $('#results').innerHTML=ps.length?'<div class="table-wrap inspect-wrap" tabindex="0" role="region" aria-label="Paper inspection table"><table class="inspect'+(vs?' descriptytor':'')+'"><thead><tr>'+cols.map(([id,label])=>'<th data-sort="'+id+'" aria-sort="'+(id===key?(dir==='desc'?'descending':'ascending'):'none')+'"><button type="button" data-sort="'+id+'">'+esc(label)+mark(id)+'</button></th>').join('')+'</tr></thead><tbody>'+rows.map(p=>'<tr data-detail="'+esc(p.id)+'" tabindex="0">'+cols.map(([id])=>'<td'+(id==='vs'?' class="vs"':'')+'>'+(id==='paper'?inspectCell(p,id):esc(inspectCell(p,id)))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<div class="empty"><h3>No papers in this slice</h3><p>Clear a filter to inspect the atlas.</p><button id="clear-filters">Clear filters</button></div>';
 $('#clear-filters')?.addEventListener('click',()=>{$('#search').value='';$('#focus').value='';$('#year').value='';$('#chemistry').value='';$('#representation').value='';if($('#stack'))$('#stack').value='';$('#unread').checked=false;render()});
}
function openFigure(id){
 const p=find(id);if(!p?.figure?.src||!$('#figbox'))return;
 $('#figbox-img').src=p.figure.src;
 $('#figbox-img').alt=p.figure.caption||'Figure 1';
 $('#figbox-cap').textContent=(p.full_title||p.label)+' · '+(p.figure.caption||'Figure 1');
 if(!$('#figbox').open)$('#figbox').showModal();
}
function details(id){
 const p=find(id);if(!p)return;state.active=id;
 const fig=p.figure?.src?`<button type="button" class="fig fig-lg" data-fig="${esc(p.id)}"><img src="${esc(p.figure.src)}" alt="${esc(p.figure.caption||'Figure 1')}" loading="eager"></button><p class="fig-cap">${esc(p.figure.caption||'Figure 1')}</p>`:'';
 const fields=p.candidate?[['Authors',p.derived_authors.join(', ')],['Record type',p.paper_type],['Research assessment','Not yet curated. Read the original paper to assess chemistry, data, validation and limitations.']]:[['Summary',p.summary],['Why it matters',p.why],['vs DescriPyTor',p.descriptytor_vs],['DescriPyTor role',p.descriptytor_rank?(VS_ROLE[p.descriptytor_role]||p.descriptytor_role)+' · rank '+p.descriptytor_rank:''],['Use this when',p.use_for],['Ask next',p.ask_next],['Chemistry class',p.chemistry_class],['Chemistry',p.chemistry],['Stack layer',p.stack_layer],['Representation',p.representation_class],['Also in',(p.secondary_paradigms||[]).join(' · ')],['Data size',p.data_size_bin],['Data regime',p.data_regime],['Validation type',p.validation_type],['Validation',p.validation],['Methods / representation',(p.derived_methods||[]).join(' · ')],['Authors',(p.derived_authors||[]).join(', ')],['Research workflow',(p.derived_workflows||[]).join(' → ')],['Topics',(p.derived_topics||[]).join(' · ')]];
 $('#detail-body').innerHTML='<h2>'+esc(p.full_title||p.label)+'</h2><p class="muted">'+esc(date(p))+' · '+esc(p.journal)+'</p>'+fig+'<div class="actions"><a class="primary" href="'+esc(url(p.url))+'" target="_blank" rel="noopener">Read original paper ↗</a>'+(inCorpus(p)?'':button('data-add',id,state.added[id]?'Remove from my library':'Add to my library'))+button('data-save',id,state.saved[id]?'Saved ✓':'Save paper')+button('data-read',id,state.read[id]?'Mark unread':'Mark as read')+button('data-compare',id,state.compare.includes(id)?'Remove comparison':'Add to compare')+'</div><dl>'+fields.filter(([,v])=>v).map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('')+'<dt>DOI</dt><dd>'+esc(p.doi||'Not verified in the original corpus')+'</dd><dt>Provenance</dt><dd>'+(p.added||p.candidate?'Crossref publisher metadata. Candidate relevance uses the search you ran; no scientific assessment has been added unless this DOI is already in the curated atlas.':'Research interpretation comes from the v7 handoff, with Crossref years/authors overlaid. Summaries are composed from those notes, not new abstracts. '+(p.metadata_source?'Title and publication date resolved through Crossref.':'Exact title and publication date have not been resolved.'))+'</dd></dl>'+(p.metadata_source?'<a href="'+esc(url(p.metadata_source))+'" target="_blank" rel="noopener">Metadata source ↗</a>':'');
 if(!$('#detail').open)$('#detail').showModal();$('#detail').scrollTop=0;
}
function compare(){
 const ps=state.compare.map(find).filter(Boolean);
 const fields=[['Summary',p=>p.summary],['Published',p=>date(p)],['vs DescriPyTor',p=>p.descriptytor_vs],['DescriPyTor role',p=>p.descriptytor_rank?(VS_ROLE[p.descriptytor_role]||p.descriptytor_role)+' · rank '+p.descriptytor_rank:''],['Research direction',p=>p.paradigm],['Also in',p=>(p.secondary_paradigms||[]).join(', ')],['Stack layer',p=>p.stack_layer],['Representation',p=>p.representation_class||p.derived_methods?.join(', ')],['Chemistry class',p=>p.chemistry_class],['Chemistry',p=>p.chemistry],['Data size',p=>p.data_size_bin],['Data regime',p=>p.data_regime],['Validation type',p=>p.validation_type],['Validation',p=>p.validation],['Why it matters',p=>p.why],['Ask next',p=>p.ask_next],['Use this when',p=>p.use_for],['Workflow',p=>p.derived_workflows?.join(' → ')]];
 $('#comparison').innerHTML='<div class="results-line"><h2>Compare the evidence</h2>'+(ps.length?'<button id="clear-compare">Clear comparison</button>':'')+'</div><p class="muted">Compare up to four papers. Scroll sideways on your phone. Missing evidence means unassessed, not absent.</p>'+(ps.length?'<div class="table-wrap" tabindex="0" role="region" aria-label="Paper comparison"><table><thead><tr><th>Scientific question</th>'+ps.map(p=>'<th>'+esc(p.full_title||p.label)+'<br>'+button('data-compare',p.id,'Remove')+'</th>').join('')+'</tr></thead><tbody>'+fields.map(([name,fn])=>'<tr><th>'+name+'</th>'+ps.map(p=>'<td>'+esc(fn(p)||'Not assessed')+'</td>').join('')+'</tr>').join('')+'<tr><th>Original source</th>'+ps.map(p=>'<td><a target="_blank" rel="noopener" href="'+esc(url(p.url))+'">Read paper ↗</a></td>').join('')+'</tr></tbody></table></div>':'<div class="empty">Choose Compare on papers in the Library, Discover latest, or Saved views.</div>');
 $('#clear-compare')?.addEventListener('click',()=>{state.compare=[];render()});
}
function representations(){
 const rows=ORDER.map(rep=>{
  const ps=libraryPapers().filter(p=>p.representation_class===rep);
  if(!ps.length)return '';
  const sizes=[...new Set(ps.map(p=>p.data_size_bin).filter(Boolean))].join(' · ');
  const val=[...new Set(ps.map(p=>p.validation_type).filter(Boolean))].join(' · ');
  const chem=[...new Set(ps.map(p=>p.chemistry_class).filter(Boolean))].slice(0,4).join(' · ');
  return '<tr><th>'+esc(rep)+'<br><span class="muted">'+ps.length+' papers</span></th><td>'+esc(chem||'—')+'</td><td>'+esc(sizes||'—')+'</td><td>'+esc(val||'—')+'</td><td>'+ps.slice(0,4).map(p=>button('data-detail',p.id,esc(p.label))).join('<br>')+'</td></tr>';
 }).join('');
 $('#comparison').innerHTML='<div class="results-line"><h2>Which catalyst representation?</h2><a class="primary" href="atlas.html">Open in 3D atlas</a></div><p class="muted">Compare reusable ligand libraries, chemist descriptors, conformer ensembles, catalyst-state features, and 3D/TS learned models. Dataset size and validation are inherited notes, not new measurements.</p><div class="table-wrap" tabindex="0" role="region" aria-label="Representation comparison"><table><thead><tr><th>Representation</th><th>Chemistry</th><th>Data size</th><th>Validation</th><th>Example papers</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function reconcile(feed){for(const p of feed.papers)state.known[p.id]=p;const curated=new Map(state.papers.filter(p=>p.doi).map(p=>[doiKey(p.doi),p]));return {...feed,papers:feed.papers.map(p=>curated.get(doiKey(p.doi))||p)}}
let request=0;
async function searchNow(){
 const q=$('#find').value.trim();
 if(!q){toast('Enter a DOI, title, or author.');return}
 const id=++request;
 state.loading=true;$('#find-go').disabled=true;$('#feed-status').textContent='Searching Crossref…';render();
 try{const feed=await searchWorks({q,days:3650});if(id!==request)return;state.feed=reconcile(feed);$('#feed-status').textContent=(feed.doi?'DOI lookup':'Search for “'+feed.query+'”')+' · '+feed.papers.length+' records. Add a paper to keep it in your library on this device.'}
 catch(err){if(id!==request)return;$('#feed-status').textContent=err.message||'Search failed. Try a DOI.'}
 finally{if(id===request){state.loading=false;$('#find-go').disabled=false;render()}}
}
async function refresh(){
 const id=++request,scope=$('#scope').value,days=Number($('#window').value),key='feed:'+scope+':'+days;
 state.loading=true;$('#refresh').disabled=true;$('#feed-status').textContent='Checking Crossref for recent publications…';
 const cached=load(key,null);state.feed=cached?reconcile(cached):null;render();
 try{const feed=await discover({scope,days});if(id!==request)return;persist(key,feed);state.feed=reconcile(feed);$('#feed-status').textContent='Checked '+new Date(feed.fetched_at).toLocaleString()+' · '+feed.papers.length+' matching papers'+(feed.failed?' · Partial results: '+feed.failed+' of '+feed.query_count+' searches unavailable. Refresh to retry.':'')}
 catch{if(id!==request)return;if(!state.feed&&scope==='catalysis'&&days===90){try{const r=await fetch('feed-snapshot.json');if(r.ok)state.feed=reconcile(await r.json())}catch{}}$('#feed-status').textContent=state.feed?'Live check failed. Showing a snapshot from '+new Date(state.feed.fetched_at).toLocaleString()+'. Refresh to retry.':'Live check failed. Your curated Library is still available. Refresh to retry.'}
 finally{if(id===request){state.loading=false;$('#refresh').disabled=false;render()}}
}
document.addEventListener('click',e=>{
 const fig=e.target.closest('[data-fig]');
 if(fig){openFigure(fig.dataset.fig);return}
 const sort=e.target.closest('[data-sort]');
 if(sort&&state.view==='inspect'){
  const key=sort.dataset.sort;
  state.inspectSort={key,dir:state.inspectSort.key===key&&state.inspectSort.dir==='asc'?'desc':'asc'};
  render();return
 }
 const row=e.target.closest('tr[data-detail]');
 if(row&&!e.target.closest('button,a')){details(row.dataset.detail);return}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.detail){details(b.dataset.detail);return}
 if(b.dataset.save){const p=find(b.dataset.save);if(!p)return;if(state.saved[p.id])delete state.saved[p.id];else state.saved[p.id]=p;persist('saved',state.saved);render();if($('#detail').open)details(state.active);return}
 if(b.dataset.add){const p=find(b.dataset.add);if(!p||inCorpus(p))return;if(state.added[p.id])delete state.added[p.id];else state.added[p.id]=stampAdded(p);persist('added',state.added);toast(state.added[p.id]?'Added to your library on this device.':'Removed from your library.');render();if($('#detail').open)details(state.active);return}
 if(b.dataset.read){state.read[b.dataset.read]=!state.read[b.dataset.read];persist('read',state.read);render();details(b.dataset.read);return}
 if(b.dataset.compare){const id=b.dataset.compare;if(state.compare.includes(id))state.compare=state.compare.filter(x=>x!==id);else if(state.compare.length<4)state.compare.push(id);else toast('Compare up to four papers. Remove one first.');render();if($('#detail').open)details(state.active);return}
 if(b.classList.contains('gap')){
  $('#chemistry').value=b.dataset.chem;$('#representation').value='';state.view='library';render();toast('Library filtered to '+b.dataset.chem+'. The empty cell is '+b.dataset.rep+'.');return
 }
 if(b.dataset.view){state.view=b.dataset.view;render();if(state.view==='latest'&&!state.feed)refresh()}
});
for(const id of ['search','focus','year','unread','chemistry','representation','stack'])$('#'+id).addEventListener(id==='search'?'input':'change',()=>{
 if(id==='focus'){
  if($('#focus').value==='descriptytor')state.inspectSort={key:'rank',dir:'asc'};
  else if(state.inspectSort.key==='rank')state.inspectSort={key:'layer',dir:'asc'};
 }
 render();
});
$('#refresh').onclick=refresh;$('#scope').onchange=refresh;$('#window').onchange=refresh;
$('#find-go').onclick=searchNow;$('#find').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchNow()}});
document.addEventListener('keydown',e=>{
 if(e.key!=='Enter')return;
 const row=e.target.closest('tr[data-detail]');
 if(row){e.preventDefault();details(row.dataset.detail)}
});
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();$('#close-detail').onclick=()=>$('#detail').close();
$('#close-fig')?.addEventListener('click',()=>$('#figbox')?.close());
$('#figbox')?.addEventListener('click',e=>{if(e.target.id==='figbox')$('#figbox').close()});
async function init(){try{const r=await fetch('graph.json');if(!r.ok)throw Error();const graph=await r.json();state.papers=graph.nodes.filter(p=>p.type==='paper').sort((a,b)=>(b.published_date||String(b.year)).localeCompare(a.published_date||String(a.year))||a.label.localeCompare(b.label));state.papers.forEach(p=>{if(p.figure?.src){const i=new Image();i.src=p.figure.src}});fillSelects();render()}catch{$('#results').innerHTML='<div class="empty">The library could not load. <button id="retry">Try again</button></div>';$('#retry').onclick=init}}
init();
