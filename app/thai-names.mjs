// Thai bird names from the Thai checklist (data/thai-names.json), keyed by stable card ID.
// The file is optional: cards work without it. Names are attached as non-enumerable fields,
// so they never enter saved datasets, CSV exports or backups.
const MATCHES=new Set(['scientific','english','reviewed']);
const text=(v,max)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():'';
export function validateThaiNames(raw){
 if(!raw||raw.schemaVersion!==1||!raw.names||typeof raw.names!=='object'||Array.isArray(raw.names))throw new Error('Invalid Thai names file');
 const names=new Map();
 for(const [id,e] of Object.entries(raw.names)){
  const thai=text(e?.thai,120);
  if(!/^[\w:.-]{1,80}$/.test(id)||!thai||!/[฀-๿]/.test(thai)||!MATCHES.has(e.match))continue;
  names.set(id,{thai,checklistScientific:text(e.checklistScientific,120),checklistEnglish:text(e.checklistEnglish,120),match:e.match,note:text(e.note,400)});
 }
 return {meta:raw.meta&&typeof raw.meta==='object'?raw.meta:{},names};
}
export function attachThaiNames(birds,thaiNames){
 for(const b of birds){
  const e=thaiNames?.names.get(b.id);
  if(e)Object.defineProperty(b,'thai',{value:e.thai,configurable:true,enumerable:false,writable:true});
  else if(Object.prototype.hasOwnProperty.call(b,'thai')&&!Object.prototype.propertyIsEnumerable.call(b,'thai'))delete b.thai;
 }
 return birds;
}
export function thaiDetails(b,thaiNames){
 const e=thaiNames?.names.get(b.id);if(!e)return '';
 const listed=[e.checklistEnglish,e.checklistScientific].filter(Boolean).join(', ');
 return `${e.thai}${listed?` · Thai checklist: ${listed}`:''}${e.note?` · ${e.note}`:''}`;
}
