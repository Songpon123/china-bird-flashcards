export const familyKey=name=>String(name||'').replace(/\s*\(.*\)\s*$/,'').trim();
export function inGroup(bird,term){
 const genus=bird.scientific.split(' ')[0];
 return term.families.includes(familyKey(bird.family))&&(!term.includeGenera.length||term.includeGenera.includes(genus))&&!term.excludeGenera.includes(genus);
}
export function familyLabel(name,cards){
 const term=cards.find(t=>t.kind==='family'&&t.scientific===familyKey(name));
 return term?`${term.chinese} · ${term.scientific}`:name;
}
export function validateGroups(raw){
 if(raw?.schemaVersion!==1||!raw.meta?.membershipTaxonomy||!Array.isArray(raw.cards)||raw.cards.length>1000)throw new Error('Invalid family/group vocabulary');
 const ids=new Set();
 for(const c of raw.cards){
  if(!/^(family|group):[A-Za-z0-9._-]+$/.test(c.id)||ids.has(c.id))throw new Error('Invalid or duplicate term ID');
  if(!['family','group'].includes(c.kind)||!['chinese','pinyin','english','scientific','thai','scope','sourceUrl'].every(k=>typeof c[k]==='string'&&c[k]))throw new Error('Missing term names or provenance');
  for(const k of ['families','includeGenera','excludeGenera','aliases'])if(!Array.isArray(c[k])||c[k].some(v=>typeof v!=='string'))throw new Error('Invalid group membership rule');
  if(!c.families.length)throw new Error('Group needs a source family');
  ids.add(c.id);
 }
 return raw;
}
