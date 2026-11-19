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
  assert.deepEqual({chinese:b.chinese,scientific:b.scientific,english:b.english},c.now,c.id);
  if(c.now.scientific!==c.was.scientific)assert.ok(b.aliases.includes(c.was.scientific),`${b.scientific} keeps ${c.was.scientific}`);
  if(c.kind==='concept')assert.equal(b.taxonomyReview,true,b.scientific);
  assert.match(b.pinyin.normalize('NFD'),/[̀́̄̌]/,b.chinese);
 }
});

test('corrected cards name the birds recorded in China',()=>{
 const card=sci=>{const b=bySci.get(sci);assert.ok(b,sci);return [b.chinese,b.english];};
 assert.deepEqual(card('Pica serica'),['喜鹊','Oriental Magpie']);
 assert.deepEqual(card('Ardea coromanda'),['牛背鹭','Eastern Cattle Egret']);
 assert.deepEqual(card('Tyto javanica'),['仓鸮','Eastern Barn Owl']);
 assert.deepEqual(card('Butorides atricapilla'),['绿鹭','Little Heron']);
 assert.deepEqual(card('Porphyrio porphyrio'),['紫水鸡','Purple Swamphen']);
 assert.deepEqual(card('Fulvetta cinereiceps'),['灰头雀鹛','Grey-hooded Fulvetta']);
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

test('黑头䴓 uses the eBird common name and keeps its scientific name and eBird link',async()=>{
 const raw=JSON.parse(await read('data/birds.json')),dataset=validateDataset(raw),links=validateEBirdLinks(JSON.parse(await read('data/ebird-links.json')));
 const b=dataset.birds.find(x=>x.chinese==='黑头䴓');
 assert.equal(b.english,'Snowy-browed Nuthatch');assert.equal(b.scientific,'Sitta villosa');assert.equal(b.englishSource,'ebird-taxonomy');
 assert.match(b.nameMatch,/eBird common name \(snbnut1\).*Chinese Nuthatch/);
 assert.ok(raw.meta.sources.some(s=>s.id==='ebird-taxonomy'));
 assert.equal(ebirdReference(b,links).href,'https://ebird.org/species/snbnut1');
});
