import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {familyKey,inGroup,validateGroups} from '../app/taxonomy.mjs';
import {schedule,keyFor,validateBackup,validateDataset,matches} from '../app/core.mjs';
const dataset=JSON.parse(await readFile(new URL('../data/birds.json',import.meta.url)));
const groups=validateGroups(JSON.parse(await readFile(new URL('../data/groups.json',import.meta.url))));
test('ducks, geese and swans partition the source Anatidae without overlap',()=>{
 const partitions=['ducks','geese','swans'].map(id=>groups.cards.find(c=>c.id==='group:'+id));
 const birds=dataset.birds.filter(b=>b.family==='Anatidae');
 assert.equal(birds.length,54);
 for(const b of birds)assert.equal(partitions.filter(c=>inGroup(b,c)).length,1,b.scientific);
 assert.deepEqual(partitions.map(c=>birds.filter(b=>inGroup(b,c)).length),[38,13,3]);
 assert.equal(inGroup({family:'Anatidae',scientific:'Unknown species'},partitions[0]),false);
});
test('family terms preserve source membership, separate rank from informal groups, and search Thai/Pinyin',()=>{
 assert.equal(groups.cards.filter(c=>c.kind==='family').length,26);
 assert.equal(groups.cards.filter(c=>c.kind==='group').length,7);
 for(const c of groups.cards)assert.ok(dataset.birds.some(b=>inGroup(b,c)),c.id);
 const pigeon=groups.cards.find(c=>c.id==='family:Columbidae');
 assert.equal(dataset.birds.filter(b=>inGroup(b,pigeon)).length,31);
 assert.ok(matches(pigeon,'นกเขา'));assert.ok(matches(pigeon,'jiugeke'));
 assert.equal(familyKey('Upupidae(Hoopoes)'),'Upupidae');
});
test('full backups preserve group vocabulary, directional term progress, and old backup compatibility',()=>{
 const k=keyFor('family:Anatidae','zh-en');
 const raw={format:'china-bird-backup-v1',dataset,groupDataset:groups,state:{progress:{[k]:schedule(null,'good',1)},history:[],settings:{deck:'groups',direction:'zh-en'}}};
 const restored=validateBackup(raw);assert.equal(restored.state.settings.deck,'groups');assert.equal(restored.groupDataset.cards.length,33);assert.equal(restored.state.progress[k].reviews,1);
 delete raw.groupDataset;delete raw.state.settings.deck;assert.equal(validateBackup(raw).state.settings.deck,'species');
 assert.throws(()=>validateGroups({...groups,cards:[groups.cards[0],groups.cards[0]]}),/duplicate/);
 assert.throws(()=>validateDataset({...dataset,birds:[{...dataset.birds[0],id:'family:Anatidae'}]}),/reserved/);
});
