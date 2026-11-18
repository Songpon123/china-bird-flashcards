const normal=value=>String(value||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g,'');
const codePattern=/^[a-z0-9]{2,20}$/;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateEBirdLinks(raw){
 if(raw?.schemaVersion!==1||!raw.meta?.version||!raw.byScientific||Array.isArray(raw.byScientific)||Object.keys(raw.byScientific).length>20000)throw new Error('Invalid eBird link references');
 for(const [name,row] of Object.entries(raw.byScientific)){
  if(!name||!codePattern.test(row.code)||!['scientific','alias','common-name'].includes(row.method)||!['scientific','english','sourceEnglish'].every(k=>typeof row[k]==='string')||!row.scientific||!row.english)throw new Error('Invalid eBird species reference');
 }
 return raw;
}
export function ebirdReference(bird,pack){
 if(!bird||bird.kind)return null;
 const fallback={kind:'lookup',href:'https://ebird.org/explore',label:'Find on eBird ↗',message:`Search Explore Species for ${bird.english||bird.scientific}. No direct species match is confirmed in this edition.`};
 const row=pack?.byScientific?.[bird.scientific];
 if(!row||!codePattern.test(row.code)||row.method==='common-name'&&normal(bird.english)!==normal(row.sourceEnglish)||row.method==='alias'&&!bird.aliases?.includes(row.scientific))return fallback;
 return {kind:row.method,href:'https://ebird.org/species/'+row.code,label:'View on eBird ↗',message:row.method==='common-name'?`Name-based reference: ${row.english} · ${row.scientific}. Names and species limits may differ on eBird.`:row.scientific!==bird.scientific?`eBird: ${row.english} · ${row.scientific}. Names and species limits may differ.`:'Photos, sounds, maps and species information on eBird.'};
}
export function renderEBirdReference(bird,pack,{revealed=false}={}){
 if(!revealed)return '';
 const ref=ebirdReference(bird,pack);if(!ref)return '';
 return `<div class="ebird-reference"><a class="secondary ebird-link" href="${esc(ref.href)}" target="_blank" rel="noopener noreferrer">${esc(ref.label)}</a><p>${esc(ref.message)}</p></div>`;
}
