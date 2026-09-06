
import {mkdir,readFile,writeFile,cp,copyFile} from 'node:fs/promises';
import {enrichGraph} from '../src/enrich.js';
await mkdir('dist/vendor',{recursive:true});
await cp('src','dist',{recursive:true});await cp('public','dist',{recursive:true});
const source=JSON.parse(await readFile('original/graph_catalysis_v7.json','utf8'));
const metadata=JSON.parse(await readFile('public/metadata.json','utf8'));
const authors=JSON.parse(await readFile('public/authors.json','utf8'));
const graph=enrichGraph(source,{metadata,authors});
await writeFile('dist/graph.json',JSON.stringify(graph));
for(const [src,dst] of [['three/build/three.min.js','three.min.js'],['3d-force-graph/dist/3d-force-graph.min.js','3d-force-graph.min.js'],['three-spritetext/dist/three-spritetext.min.js','three-spritetext.min.js']])await copyFile('node_modules/'+src,'dist/vendor/'+dst);
const cols=['id','year','published_date','label','full_title','doi','url','paradigm','secondary_paradigms','representation_class','chemistry_class','chemistry','data_size_bin','data_regime','validation_type','validation'];
await writeFile('dist/papers.csv',cols.join(',')+'\n'+graph.nodes.filter(p=>p.type==='paper').map(p=>cols.map(k=>'"'+String(Array.isArray(p[k])?p[k].join('; '):p[k]??'').replaceAll('"','""')+'"').join(',')).join('\n'));
await writeFile('dist/.nojekyll','');
const papers=graph.nodes.filter(p=>p.type==='paper');
console.log('Built',papers.length,'papers;',graph.nodes.length,'nodes; representations',new Set(papers.map(p=>p.representation_class)).size);
