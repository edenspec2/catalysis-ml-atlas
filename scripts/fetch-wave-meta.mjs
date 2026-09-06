import {writeFile} from 'node:fs/promises';

const UA = {'User-Agent': 'catalysis-atlas (mailto:edenspec2@gmail.com)'};
const dois = [
  '10.1038/s44160-022-00231-0','10.1038/s41570-025-00747-x','10.1038/s41929-025-01430-6','10.1039/d4dd00115j',
  '10.1016/j.matt.2024.04.022','10.1038/s44160-026-01053-0','10.1021/acscentsci.5c02418','10.1039/d4dd00225c',
  '10.1039/d3dd00096f','10.1039/d2re00005a','10.1039/d4re00138a','10.1002/aic.18316','10.1016/j.chempr.2026.103108',
  '10.1016/j.chempr.2026.103035','10.1126/science.adf6177','10.1002/anie.202313638','10.1021/jacs.3c03403',
  '10.1021/jacs.3c06674','10.1021/jacs.4c01352','10.1002/anie.202318487','10.1038/s42004-022-00698-0',
  '10.1021/acscatal.2c01970','10.1021/acscatal.2c04824','10.1021/acscatal.3c00611','10.1021/acs.organomet.3c00432',
  '10.1021/acs.jpclett.3c02828','10.1039/d5dd00220f','10.1073/pnas.2415658122','10.1039/d4dd00093e',
  '10.1039/d2sc06150c','10.1021/acscatal.6c04292','10.1002/advs.202301020','10.1021/acs.jctc.2c00331',
  '10.1002/ceur.70354','10.1039/d6cy00508j','10.1016/j.checat.2025.101458','10.1038/s41467-023-36823-3',
  '10.1007/s11244-021-01543-9','10.1038/s41929-022-00896-y','10.1039/d4fd00140k','10.1021/jacsau.5c01112',
  '10.1021/acs.jctc.5c01833','10.1039/d2dd00125j','10.1038/s43588-026-00954-6','10.1002/cmtd.202100107',
  '10.1021/acscatal.5c06431','10.1021/jacsau.5c01087','10.1021/acs.accounts.5c00155','10.1039/d2sc05089g',
  '10.1093/nsr/nwaf271','10.1016/j.trechm.2023.10.005','10.1016/j.aichem.2024.100068','10.1016/j.aichem.2023.100006',
  '10.1016/j.coche.2022.100832','10.1016/j.coche.2022.100820','10.1016/j.coche.2021.100781','10.1039/d5cc05274b',
  '10.1002/wcms.1730','10.1016/j.mtchem.2025.103051','10.1021/acscatal.5c06483','10.1088/2632-2153/ad9f22',
  '10.1039/d3cp00258f','10.1038/s41929-024-01275-5','10.1039/d2sc05089g','10.1021/jacs.2c08592',
  '10.1038/s44160-026-01084-7','10.1038/s44160-026-01120-6','10.1039/d5dd00086f','10.1039/d5re00400d',
  '10.1021/acs.orglett.6c02314'
];
const out=[];
for (const doi of [...new Set(dois)]) {
  try {
    const r=await fetch('https://api.crossref.org/works/'+encodeURIComponent(doi),{headers:UA,signal:AbortSignal.timeout(20000)});
    if(!r.ok){console.log('FAIL',doi,r.status);continue;}
    const m=(await r.json()).message;
    const title=(m.title&&m.title[0]||'').replace(/\s+/g,' ').trim();
    const year=(m['published-online']||m.published||m.issued)?.['date-parts']?.[0]?.[0];
    const journal=(m['container-title']&&m['container-title'][0])||m.publisher;
    const type=m.type;
    const authors=(m.author||[]).slice(0,8).map(a=>[a.given,a.family].filter(Boolean).join(' '));
    const cites=m['is-referenced-by-count']||0;
    console.log([year,type,cites,String(journal).slice(0,24),doi,title.slice(0,90)].join(' | '));
    out.push({doi,year,type,journal,title,authors,cites});
  } catch(e){console.log('ERR',doi,e.message)}
}
await writeFile('scripts/wave-meta.json',JSON.stringify(out,null,2));
console.log('ok',out.length);
