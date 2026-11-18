// Dictionary facts stay separate from the bird taxonomy and the review schedule.
export function validateNameGuide(raw){
 if(raw?.schemaVersion!==1||!raw.meta?.version||!raw.characters||!raw.compounds||!Array.isArray(raw.notes)||!Array.isArray(raw.unitWords)||!Array.isArray(raw.meta.sources))throw new Error('Invalid name guide');
 const sources=new Set(raw.meta.sources.map(s=>s.id));
 for(const [character,record] of Object.entries(raw.characters)){
  if([...character].length!==1||!Array.isArray(record.entries)||!record.entries.length)throw new Error('Invalid character entry');
  for(const e of record.entries)if(!e.pinyin||!Array.isArray(e.definitions)||!e.definitions.length||!sources.has(e.source))throw new Error('Character definition needs attribution');
 }
 for(const n of raw.notes)if(!n.match||!n.kind||!n.thai||!n.english||!n.sources?.length||n.sources.some(s=>!sources.has(s)))throw new Error('Name note needs evidence');
 return raw;
}
const readingKey=value=>String(value||'').normalize('NFC').toLowerCase();
export function characterEntries(record,reading=''){
 const entries=record?.entries||[];
 // Preserve all senses; put an exact contextual reading before other readings.
 const rank=e=>[
  !reading?0:e.pinyin.normalize('NFC')===String(reading).normalize('NFC')?0:readingKey(e.pinyin)===readingKey(reading)?1:2,
  Number(/^variant|^old variant/.test(e.definitions[0])),
  Number(/^surname\b/.test(e.definitions[0])||e.pinyin[0]!==e.pinyin[0].toLowerCase()),
 ];
 return [...entries].sort((a,b)=>{const x=rank(a),y=rank(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];});
}
export function nameAnalysis(bird,guide){
 const name=String(bird.chinese||'').normalize('NFC'),characters=[...name],syllables=String(bird.pinyin||'').trim().split(/\s+/);
 const aligned=syllables.length===characters.length;
 const units=[],used=new Set(),unitAt=[];
 // Only curated compounds are segmented: arbitrary dictionary substrings can
 // mean something quite unrelated to the name (e.g. 背信 inside two modifiers).
 for(let i=0;i<characters.length;){
  const remainder=characters.slice(i).join('');
  const word=guide.unitWords.find(w=>remainder.startsWith(w));
  if(word){
   if(!used.has(word)){units.push({word,...guide.compounds[word]});used.add(word);}
   // Characters of a place name or other opaque word take the word's meaning, not their own.
   const unit=guide.compounds[word]?.kind==='name'?{word,...guide.compounds[word]}:null;
   for(let k=0;k<[...word].length;k++)unitAt[i+k]=unit;
   i+=[...word].length;
  }
  else i++;
 }
 // X氏 = “X's”: X is part of a person's name, so its dictionary meaning does not apply.
 // The person is not identified here (see the personal-name caution).
 for(let j=1;j<characters.length;j++){
  if(characters[j]!=='氏'||unitAt[j-1]||unitAt[j]||!guide.personalNameUnit)continue;
  const unit={word:characters[j-1]+'氏',kind:'name',entries:[],...guide.personalNameUnit,pinyin:aligned?`${syllables[j-1]} ${syllables[j]}`:''};
  unitAt[j-1]=unitAt[j]=unit;units.push(unit);
 }
 return {
  characters:characters.map((character,i)=>({character,reading:aligned?syllables[i]:'',...guide.characters[character],entries:characterEntries(guide.characters[character],aligned?syllables[i]:''),unit:unitAt[i]||null})),
  units,dictionary:guide.compounds[name]||null,
  notes:guide.notes.filter(n=>n.exact?name===n.match:name.includes(n.match)),
  hasPersonalNameMarker:name.includes('氏'),
  missing:[...new Set(characters.filter(c=>!guide.characters[c]))],
 };
}
