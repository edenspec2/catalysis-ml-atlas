import {readFile,writeFile} from 'node:fs/promises';
const graph=JSON.parse(await readFile('original/graph_catalysis_v7.json','utf8'));
const key=d=>d.toLowerCase().replace(/^https:\/\/doi\.org\//,'');
const ps=graph.nodes.filter(p=>p.type==='paper'&&p.doi),byDoi=new Map(ps.map(p=>[key(p.doi),p.id]));
const records={};
for(let i=0;i<ps.length;i+=50){
 const dois=ps.slice(i,i+50).map(p=>key(p.doi)).join('|');
 const r=await fetch('https://api.openalex.org/works?per-page=50&select=doi,cited_by_count&filter=doi:'+dois,{signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('OpenAlex '+r.status);
 for(const w of (await r.json()).results){const id=byDoi.get(key(w.doi));if(id)records[id]=w.cited_by_count}
}
await writeFile('public/citations.json',JSON.stringify({checked_at:new Date().toISOString(),source:'OpenAlex',records},null,1));
console.log('OpenAlex citations:',Object.keys(records).length,'of',ps.length,'papers with a DOI');
