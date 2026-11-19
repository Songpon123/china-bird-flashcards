import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateDataset} from '../app/core.mjs';
import {validateEBirdLinks,ebirdReference} from '../app/ebird.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url));
const raw=JSON.parse(await read('data/birds.json'));
const dataset=validateDataset(raw);
const byId=new Map(dataset.birds.map(b=>[b.id,b]));
const bySci=new Map(dataset.birds.map(b=>[b.scientific,b]));
const {corrections}=JSON.parse(await read('source-notices/name-corrections-2026-11.json'));
const pack=validateEBirdLinks(JSON.parse(await read('data/ebird-links.json')));

test('reviewed name corrections are applied to the same card IDs, keeping the previous scientific name',()=>{
 assert.equal(corrections.length,48);
 assert.equal(raw.meta.report.nameCorrections.total,corrections.length);
 for(const c of corrections){
  const b=byId.get(c.id);
  assert.ok(b,c.id);
  assert.deepEqual({chinese:b.chinese,scientific:b.scientific},{chinese:c.now.chinese,scientific:c.now.scientific},c.id);
  // English names follow eBird; the corrected AviList English name is kept in the card's name-matching note.
  assert.equal(b.english,pack.byScientific[b.scientific].english,c.id);
  if(b.english!==c.now.english)assert.ok(b.nameMatch.endsWith(`IOC/AviList: ${c.now.english}`),c.id);
  if(c.now.scientific!==c.was.scientific)assert.ok(b.aliases.includes(c.was.scientific),`${b.scientific} keeps ${c.was.scientific}`);
  if(c.kind==='concept')assert.equal(b.taxonomyReview,true,b.scientific);
  assert.match(b.pinyin.normalize('NFD'),/[̀́̄̌]/,b.chinese);
 }
});

test('corrected cards name the birds recorded in China',()=>{
 const card=sci=>{const b=bySci.get(sci);assert.ok(b,sci);return [b.chinese,b.english];};
 assert.deepEqual(card('Pica serica'),['喜鹊','Oriental Magpie']);
 assert.deepEqual(card('Ardea coromanda'),['牛背鹭','Eastern Cattle-Egret']);
 assert.deepEqual(card('Tyto javanica'),['仓鸮','Eastern Barn Owl']);
 assert.deepEqual(card('Butorides atricapilla'),['绿鹭','Little Heron']);
 assert.deepEqual(card('Porphyrio porphyrio'),['紫水鸡','Gray-headed Swamphen']);
 assert.deepEqual(card('Fulvetta cinereiceps'),['灰头雀鹛','Gray-hooded Fulvetta']);
 // The pipit names were swapped; both cards keep their own scientific identity.
 assert.deepEqual(card('Anthus richardi'),['理氏鹨',"Richard's Pipit"]);
 assert.deepEqual(card('Anthus rufulus'),['田鹨','Paddyfield Pipit']);
 for(const old of ['Pica pica','Bubulcus ibis','Tyto alba','Butorides striata','Brachypteryx montana'])assert.equal(bySci.has(old),false,old);
});

test('no Chinese name, scientific name or alias points to two cards after the corrections',()=>{
 const chinese=dataset.birds.map(b=>b.chinese);
 assert.equal(new Set(chinese).size,chinese.length);
 for(const b of dataset.birds)for(const a of b.aliases)assert.equal(bySci.has(a)&&a!==b.scientific,false,`${b.scientific} alias ${a}`);
});

test('eBird references follow the corrected names, including the China population of broad species',async()=>{
 assert.equal(ebirdReference(bySci.get('Pica serica'),pack).href,'https://ebird.org/species/orimag1');
 const swamphen=ebirdReference(bySci.get('Porphyrio porphyrio'),pack);
 assert.equal(swamphen.href,'https://ebird.org/species/purswa3');assert.match(swamphen.message,/Porphyrio poliocephalus/);
 assert.equal(ebirdReference(bySci.get('Pericrocotus flammeus'),pack).href,'https://ebird.org/species/scamin1');
 // Northern Goshawk was split; China's 苍鹰 is the Eurasian Goshawk.
 const goshawk=bySci.get('Astur gentilis');
 assert.deepEqual([goshawk.chinese,goshawk.english],['苍鹰','Eurasian Goshawk']);
 assert.equal(ebirdReference(goshawk,pack).href,'https://ebird.org/species/norgos1');
 // Genus moves are found through the current AviList combination, added as an alias.
 const {aliasAdditions}=JSON.parse(await read('source-notices/name-corrections-2026-11.json'));
 assert.equal(aliasAdditions.length,15);
 for(const x of aliasAdditions){
  const b=byId.get(x.id);assert.ok(b.aliases.includes(x.alias),x.alias);
  assert.equal(ebirdReference(b,pack).href,`https://ebird.org/species/${x.cornellCode}`,b.chinese);
 }
});

test('English names follow eBird for every card, including taxa eBird includes in a broader species',async()=>{
 const changes=JSON.parse(await read('source-notices/english-names-ebird.json')),manual=JSON.parse(await read('source-notices/english-names-manual.json'));
 assert.deepEqual(changes.counts,{ebird:1435,changed:241,broaderEBirdSpecies:10,noEBirdMatch:0});
 assert.equal(manual.names.length,10);
 for(const b of dataset.birds){
  const row=pack.byScientific[b.scientific];
  if(row){assert.equal(b.english,row.english,b.chinese);assert.equal(b.englishSource,'ebird-taxonomy',b.chinese);}
  else assert.fail(`${b.chinese} has no eBird reference`);
 }
 assert.equal(dataset.birds.filter(b=>b.english).length,1445,'every card is study-ready');
 const card=c=>dataset.birds.find(b=>b.chinese===c);
 assert.equal(card('黑头䴓').english,'Snowy-browed Nuthatch');assert.equal(card('黑头䴓').scientific,'Sitta villosa');
 assert.match(card('黑头䴓').nameMatch,/English from eBird \(snbnut1\); IOC\/AviList: Chinese Nuthatch$/);
 assert.equal(card('戴胜').english,'Common Hoopoe');assert.equal(card('原鸽').english,'Rock Pigeon');assert.equal(card('大山雀').english,'Asian Tit');
 assert.equal(ebirdReference(card('黑头䴓'),pack).href,'https://ebird.org/species/snbnut1');
 assert.ok(raw.meta.sources.some(s=>s.id==='ebird-taxonomy'));
 // Taxa eBird includes in a broader species take that species' name and link to it as a name-based reference.
 for(const x of manual.names){
  const b=byId.get(x.id),ref=ebirdReference(b,pack);
  assert.equal(b.english,x.english,x.chinese);assert.equal(b.scientific,x.scientific,x.chinese);assert.equal(b.taxonomyReview,true,x.chinese);
  assert.equal(ref.href,`https://ebird.org/species/${x.ebirdCode}`,x.chinese);assert.equal(ref.kind,'common-name',x.chinese);
  assert.match(b.nameMatch,new RegExp(`eBird includes this taxon in ${x.ebirdScientific}`),x.chinese);
 }
 assert.deepEqual(['小白腰雨燕','中亚夜鹰','休氏白喉林莺','漠白喉林莺','四川林鸮'].map(c=>card(c).english),['Little Swift','Eurasian Nightjar','Lesser Whitethroat','Lesser Whitethroat','Ural Owl']);
});
