import {readFile,writeFile} from 'node:fs/promises';
import {publicationDate,clean,discover} from '../src/literature.js';
const graph=JSON.parse(await readFile('original/graph_catalysis_v7.json','utf8'));
const ps=graph.nodes.filter(p=>p.type==='paper'&&p.doi),metadata={checked_at:new Date().toISOString(),records:{},failures:[]};
for(let i=0;i<ps.length;i+=2){await Promise.all(ps.slice(i,i+2).map(async p=>{try{const r=await fetch('https://api.crossref.org/works/'+encodeURIComponent(p.doi),{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(String(r.status));const item=(await r.json()).message;metadata.records[p.id]={title:clean(item.title?.[0]),published_date:publicationDate(item),doi:item.DOI,source:'https://api.crossref.org/works/'+encodeURIComponent(p.doi)};}catch(e){metadata.failures.push({id:p.id,error:e.message})}}))}
await writeFile('public/metadata.json',JSON.stringify(metadata,null,2));
console.log('Crossref metadata:',Object.keys(metadata.records).length,'resolved;',metadata.failures.length,'unresolved');
const feed=await discover();await writeFile('public/feed-snapshot.json',JSON.stringify(feed,null,2));console.log('Recent candidates:',feed.papers.length,'partial queries:',feed.failed);
