
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {JSDOM} from 'jsdom';import vm from 'node:vm';import {discover,filterPapers,doiKey,normalizeWork,relevant,uniqueWorks,crossrefURL,titleKey} from '../src/literature.js';
test('DOI normalization and deduplication',()=>{assert.equal(doiKey('https://doi.org/10.ABC/XYZ'),'10.abc/xyz');assert.equal(uniqueWorks([{doi:'10.ABC/x'},{doi:'10.abc/X'}]).length,1);assert.equal(uniqueWorks([{doi:'10.a/1',label:'Same Title'},{doi:'10.b/2',label:'Same Title'}]).length,1);assert.ok(titleKey('Hello, World!'))});
test('catalysis discovery drops protein/drug ligand papers and keeps catalytic ligand work',()=>{
 const keep=normalizeWork({title:['Bayesian Optimization for Accelerated Ligand Selection in Atroposelective Negishi Coupling'],DOI:'10.keep/1'});
 const drop=normalizeWork({title:['Transferable Collective Variable to accelerate Protein-Ligand Unbinding via Machine Learning'],DOI:'10.drop/1'});
 const drug=normalizeWork({title:['Machine Learning in Ligand-based Drug Design'],DOI:'10.drop/2'});
 assert.equal(relevant(keep,'catalysis'),true);
 assert.equal(relevant(drop,'catalysis'),false);
 assert.equal(relevant(drug,'catalysis'),false);
});
test('discovery excludes unrelated and future work, tolerates partial failure',async()=>{let i=0;const data={DOI:'10.test/1',title:['Machine learning for catalytic reactions'],published:{'date-parts':[[2026,9,1]]}};const result=await discover({now:new Date('2026-09-06'),fetcher:async()=>{if(i++===0)throw Error();return {ok:true,json:async()=>({message:{items:[data,{...data,DOI:'10.test/future',published:{'date-parts':[[2026,10,1]]}},{...data,DOI:'10.test/other',title:['Machine learning for EFL teachers']}]}})}}});assert.equal(result.failed,1);assert.equal(result.papers.length,1)});
test('all-provider failure is surfaced',async()=>{await assert.rejects(discover({fetcher:async()=>{throw Error('offline')}}),/unavailable/)});
test('Milo filtering requires Anat Milo, not other Milo authors',()=>{assert.equal(relevant(normalizeWork({author:[{given:'Anat',family:'Milo'}]}),'milo'),true);assert.equal(relevant(normalizeWork({author:[{given:'Peter',family:'Milo'}]}),'milo'),false)});
test('feed query uses date bounds and relevance before local date sort',()=>{const u=new URL(crossrefURL('ligand machine learning','catalysis',30,new Date('2026-09-06')));assert.equal(u.searchParams.get('filter'),'from-pub-date:2026-08-07,until-pub-date:2026-09-06');assert.equal(u.searchParams.get('sort'),'relevance')});
test('corpus integrity and preserved atlas',async()=>{const g=JSON.parse(await readFile('dist/graph.json','utf8'));const ps=g.nodes.filter(p=>p.type==='paper');assert.equal(ps.length,55);assert.equal(new Set(ps.filter(p=>p.doi).map(p=>doiKey(p.doi))).size,54);assert.equal(ps.filter(p=>p.published_date).length,54);assert.equal(ps.filter(p=>p.chemistry_class&&p.representation_class).length,55);assert.ok(filterPapers(ps,{focus:'milo'}).length>=4);assert.ok(filterPapers(ps,{representation:'Learned 3D / TS GNN'}).length>=3);const ids=new Set(g.nodes.map(n=>n.id));for(const e of g.edges){assert.ok(ids.has(e.source));assert.ok(ids.has(e.target))}const h=await readFile('dist/atlas.html','utf8');const js=await readFile('dist/atlas.js','utf8');const css=await readFile('dist/style.css','utf8');assert.ok(!h.includes('https://unpkg.com'));assert.ok(js.includes('autoRotate = false'));assert.ok(css.includes('#side{display:grid'));assert.ok(h.includes('id="chemistry"'));assert.ok(h.includes('Color: representation'));assert.ok(h.includes('src="atlas.js"'));assert.ok(!h.includes('ALL_NODES='));new vm.Script(js)});
test('reading UI: search, filter, details, save, read, compare and discovery failure',async()=>{
 const html=await readFile('src/index.html','utf8'),graph=JSON.parse(await readFile('dist/graph.json','utf8'));
 const dom=new JSDOM(html,{url:'https://atlas.test/',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.discover=async()=>{throw Error('offline')};w.filterPapers=filterPapers;w.doiKey=doiKey;
 w.fetch=async path=>({ok:true,json:async()=>String(path).includes('graph.json')?graph:{papers:[],fetched_at:'2026-09-06T00:00:00Z'}});
 w.eval((await readFile('src/app.js','utf8')).replace(/^\s*import .*?;\s*/,''));
 await new Promise(r=>setTimeout(r,20));
 const q=s=>w.document.querySelector(s);assert.equal(w.document.querySelectorAll('.paper').length,55);
 q('#focus').value='milo';q('#focus').dispatchEvent(new w.Event('change'));assert.ok(w.document.querySelectorAll('.paper').length>=4);
 const id=q('[data-detail]').dataset.detail;q('[data-detail]').click();assert.equal(q('#detail').open,true);assert.ok(q('#detail-body').textContent.includes('Validation'));
 q('#detail-body [data-save]').click();assert.equal(q('#saved-count').textContent,'1');assert.ok(w.localStorage.getItem('cml:saved').includes(id));
 q('#detail-body [data-read]').click();assert.ok(w.localStorage.getItem('cml:read').includes(id));
 q('#detail-body [data-compare]').click();q('#close-detail').click();q('[data-view="compare"]').click();assert.ok(q('#comparison table').textContent.includes('Validation'));
 q('[data-view="latest"]').click();await new Promise(r=>setTimeout(r,20));assert.ok(q('#feed-status').textContent.includes('snapshot'));assert.equal(q('#refresh').disabled,false);
 dom.window.close();
});

