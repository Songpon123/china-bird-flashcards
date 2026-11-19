import {validateGroups} from './taxonomy.mjs';
export const DAY=86400000;
export const DIRECTIONS=['zh-en','en-zh'];
export const keyFor=(id,direction)=>`${id}|${direction}`;
export function fold(text='') {
 return String(text).toLowerCase().replaceAll('u:','ü').replaceAll('v','ü').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
}
export function matches(bird,query) {
 // English names follow eBird (American spelling), so grey and gray find the same birds.
 const spell=s=>s.replaceAll('grey','gray');
 const hay=spell(fold([bird.chinese,bird.pinyin,bird.english,bird.scientific,bird.family,bird.order,bird.thai||'',...bird.aliases].join(' ')));
 return spell(fold(query)).split(' ').every(term=>hay.includes(term)||hay.replaceAll(' ','').includes(term));
}
export function initialProgress(){return {reviews:0,lapses:0,streak:0,interval:0,ease:2.5,due:0,lastReview:0};}
export function schedule(previous,rating,now=Date.now()) {
 if(!['again','hard','good','easy'].includes(rating))throw new Error('Unknown rating');
 const p={...initialProgress(),...previous};
 let interval,ease=p.ease,streak=p.streak;
 // First answers (and the first answer after Again) use 1 / 2 / 4 / 7 days. Later answers grow
 // from the previous interval and never drop below those floors, so Hard < Good < Easy.
 const base=p.reviews&&p.streak>0?p.interval:0;
 if(rating==='again'){interval=1;ease=Math.max(1.3,ease-0.2);streak=0;}
 if(rating==='hard'){interval=base?Math.max(2,base*1.2):2;ease=Math.max(1.3,ease-0.15);streak++;}
 if(rating==='good'){interval=base?Math.max(4,base*ease):4;streak++;}
 if(rating==='easy'){interval=base?Math.max(7,base*ease*1.3):7;ease+=0.15;streak++;}
 interval=Math.min(36500,Math.round(interval*1440)/1440);
 return {reviews:p.reviews+1,lapses:p.lapses+(rating==='again'?1:0),streak,interval,ease:Math.min(4,ease),due:now+interval*DAY,lastReview:now};
}
export function stateOf(p,now=Date.now()){
 if(!p?.reviews)return 'new';
 if(p.due<=now)return 'due';
 return p.interval>=21?'mature':'learning';
}
export function localDay(timestamp){const d=new Date(timestamp);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
// Stable pseudo-random order: the same seed gives the same order on every reload,
// and a new seed (the Shuffle button) mixes the cards again. No seed keeps list order.
export function shuffleKey(seed,id){
 let h=2166136261;const s=`${seed}:${id}`;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
 h^=h>>>16;h=Math.imul(h,2246822507)>>>0;h^=h>>>13;return h>>>0;
}
export function shuffleOrder(items,seed){
 if(!seed)return items;
 return items.map(item=>[shuffleKey(seed,item.id),item]).sort((a,b)=>a[0]-b[0]||(a[1].id<b[1].id?-1:1)).map(([,item])=>item);
}
export function makeQueue(birds,progress,direction,{now=Date.now(),newLimit=20,history=[],seed=''}={}){
 const ready=shuffleOrder(birds.filter(b=>b.english&&b.chinese&&b.pinyin),seed);
 const introduced=new Set(history.filter(h=>h.direction===direction&&h.wasNew&&localDay(h.at)===localDay(now)).map(h=>h.id)).size;
 const due=ready.filter(b=>progress[keyFor(b.id,direction)]?.reviews&&progress[keyFor(b.id,direction)].due<=now).sort((a,b)=>progress[keyFor(a.id,direction)].due-progress[keyFor(b.id,direction)].due);
 const fresh=ready.filter(b=>!progress[keyFor(b.id,direction)]?.reviews).slice(0,Math.max(0,newLimit-introduced));
 return [...due,...fresh];
}
export function parseCSV(text){
 text=String(text).replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){cell+='"';i++;}
   else if(quoted){quoted=false;if(text[i+1]&&!['\r','\n',','].includes(text[i+1]))throw new Error('Unexpected text after quoted CSV field');}
   else {if(cell)throw new Error('Unexpected quote in CSV field');quoted=true;}
  } else if(!quoted&&(c===','||c==='\n'||c==='\r')){
   row.push(cell);cell='';
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[];}
  }else cell+=c;
 }
 if(quoted)throw new Error('Unclosed CSV quote');
 row.push(cell);if(row.some(Boolean))rows.push(row);
 if(!rows.length)throw new Error('Empty CSV');
 const headers=rows.shift().map(h=>h.trim());
 if(new Set(headers).size!==headers.length)throw new Error('Duplicate CSV column');
 return rows.map((r,i)=>{if(r.length!==headers.length)throw new Error(`CSV row ${i+2}: wrong column count`);return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
}
export const CSV_FIELDS=['id','chinese','pinyin','english','scientific','order','family','aliases','sourceId','taxonomyReview','pinyinStatus','nameMatch','englishSource','matchedScientific'];
export function toCSV(birds){
 const quote=v=>'"'+String(Array.isArray(v)?JSON.stringify(v):v??'').replaceAll('"','""')+'"';
 return '\uFEFF'+[CSV_FIELDS.join(','),...birds.map(b=>CSV_FIELDS.map(f=>quote(b[f])).join(','))].join('\r\n');
}
const clean=s=>String(s??'').normalize('NFC').replace(/\s+/g,' ').trim();
export function validateDataset(input){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.birds)||!input.birds.length)throw new Error('Expected a schemaVersion 1 dataset with birds');
 if(input.birds.length>25000)throw new Error('Maximum 25,000 species');
 const m=input.meta;
 for(const f of ['title','version','taxonomy','scope','license','sourceUrl'])if(!clean(m?.[f]))throw new Error(`Dataset metadata needs ${f}`);
 if(!/^https?:\/\//.test(m.sourceUrl))throw new Error('Source URL must use http or https');
 const ids=new Set(),scientifics=new Set();
 const birds=input.birds.map((r,i)=>{
  const b={};
  for(const f of CSV_FIELDS)b[f]=clean(r[f]);
  for(const f of ['id','chinese','pinyin','scientific','order','family','sourceId'])if(!b[f])throw new Error(`Row ${i+1}: missing ${f}`);
  if(Object.values(b).some(s=>s.length>12000))throw new Error(`Row ${i+1}: field too long`);
  if(!/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(b.scientific))throw new Error(`Row ${i+1}: expected a species binomial`);
  if(!/^[\p{Script=Latin}\p{M}\s'’-]+$/u.test(b.pinyin)||!/[\u0300\u0301\u0304\u030c]/.test(b.pinyin.normalize('NFD')))throw new Error(`Row ${i+1}: Pinyin must use Latin syllables with tone marks, not Chinese characters or tone numbers`);
  if(!/^[a-zA-Z0-9:._-]+$/.test(b.id))throw new Error(`Row ${i+1}: unsupported ID characters`);
  if(/^(family|group):/.test(b.id))throw new Error(`Row ${i+1}: family: and group: IDs are reserved for vocabulary terms`);
  if(ids.has(b.id)||scientifics.has(b.scientific.toLowerCase()))throw new Error(`Row ${i+1}: duplicate ID or scientific name`);
  ids.add(b.id);scientifics.add(b.scientific.toLowerCase());
  if(Array.isArray(r.aliases))b.aliases=r.aliases.map(clean).filter(Boolean);
  else if(b.aliases.startsWith('[')){try{b.aliases=JSON.parse(b.aliases);if(!Array.isArray(b.aliases)||b.aliases.some(a=>typeof a!=='string'))throw 0;b.aliases=b.aliases.map(clean).filter(Boolean);}catch{throw new Error(`Row ${i+1}: aliases must be a JSON array or separated by |`);}}
  else b.aliases=b.aliases.split('|').map(clean).filter(Boolean);
  b.aliases=[...new Set(b.aliases.filter(a=>a!==b.scientific&&a!==b.chinese&&a!==b.english))];
  b.taxonomyReview=r.taxonomyReview===true||r.taxonomyReview==='true';
  b.pinyinStatus=b.pinyinStatus||'imported-unreviewed';
  return b;
 });
 // Aliases can be historical concepts. Reject ambiguous scientific aliases rather than merging taxa.
 const canonical=new Map(birds.map(b=>[b.scientific.toLowerCase(),b.id]));
 const owners=new Map();
 for(const b of birds)for(const a of b.aliases){
  if(!/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(a))continue;
  const k=a.toLowerCase();
  if(canonical.has(k)&&canonical.get(k)!==b.id)throw new Error(`Conflicting scientific alias: ${a}`);
  if(owners.has(k)&&owners.get(k)!==b.id)throw new Error(`Ambiguous scientific alias: ${a}`);
  owners.set(k,b.id);
 }
 return {schemaVersion:1,meta:{...m},birds};
}
export function planUpdate(oldDataset,newDataset){
 const oldById=new Map(oldDataset.birds.map(b=>[b.id,b]));
 const oldBySci=new Map(oldDataset.birds.map(b=>[b.scientific.toLowerCase(),b]));
 const incoming=new Set(newDataset.birds.map(b=>b.id));
 const plan={added:[],changed:[],unchanged:[],removed:oldDataset.birds.filter(b=>!incoming.has(b.id)),conflicts:[]};
 for(const b of newDataset.birds){
  const prev=oldById.get(b.id),sameName=oldBySci.get(b.scientific.toLowerCase());
  if(sameName&&sameName.id!==b.id)plan.conflicts.push(`${b.scientific}: changed ID. Restore ${sameName.id} or supply an explicit, reviewed migration outside the app.`);
  if(prev&&prev.scientific!==b.scientific&&!b.aliases.includes(prev.scientific))plan.conflicts.push(`${b.id}: renamed scientific name must retain ${prev.scientific} as an alias.`);
  if(prev&&oldDataset.meta.taxonomy!==newDataset.meta.taxonomy)plan.conflicts.push(`${b.id}: taxonomy changed. Review taxon concepts and retain IDs only after a separate, documented migration.`);
  (prev?(JSON.stringify(prev)===JSON.stringify(b)?plan.unchanged:plan.changed):plan.added).push(b);
 }
 return plan;
}
export function validateBackup(raw){
 if(raw?.format!=='china-bird-backup-v1')throw new Error('Not a China Bird Flashcards backup');
 const dataset=validateDataset(raw.dataset),state=raw.state;
 if(!state||!state.progress||!Array.isArray(state.history)||state.history.length>100000)throw new Error('Invalid backup state');
 const progress={};
 for(const [k,p] of Object.entries(state.progress)){
  if(!/^[a-zA-Z0-9:._-]+\|(zh-en|en-zh)$/.test(k))throw new Error('Invalid progress key');
  for(const f of ['reviews','lapses','streak','interval','ease','due','lastReview'])if(typeof p[f]!=='number'||!Number.isFinite(p[f])||p[f]<0)throw new Error('Invalid progress values');
  if(p.ease<1.3||p.ease>4||p.interval>36500)throw new Error('Invalid schedule');
  progress[k]={...p};
 }
 const history=state.history.map(h=>{
  if(!h||typeof h.id!=='string'||!DIRECTIONS.includes(h.direction)||!['again','hard','good','easy'].includes(h.rating)||!Number.isFinite(h.at)||h.at<0)throw new Error('Invalid review history');
  return {id:h.id,direction:h.direction,rating:h.rating,at:h.at,wasNew:!!h.wasNew};
 });
 const s=state.settings||{};
 const settings={direction:DIRECTIONS.includes(s.direction)?s.direction:'zh-en',deck:s.deck==='groups'?'groups':'species',newLimit:Number.isFinite(s.newLimit)?Math.max(0,Math.min(500,Math.floor(s.newLimit))):20,showPinyin:!!s.showPinyin,voice:typeof s.voice==='string'?s.voice:'',shuffleSeed:typeof s.shuffleSeed==='string'&&/^[a-z0-9]{1,32}$/i.test(s.shuffleSeed)?s.shuffleSeed:''};
 return {dataset,state:{progress,history,settings},...(raw.groupDataset?{groupDataset:validateGroups(raw.groupDataset)}:{})};
}
