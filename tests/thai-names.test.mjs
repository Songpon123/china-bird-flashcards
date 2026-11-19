import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateDataset,matches,toCSV} from '../app/core.mjs';
import {validateThaiNames,attachThaiNames,thaiDetails} from '../app/thai-names.mjs';
const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));

test('Thai names file matches cards one to one and keeps checked examples',async()=>{
 const raw=await read('data/thai-names.json'),birds=(await read('data/birds.json')).birds,byId=new Map(birds.map(b=>[b.id,b]));
 const thai=validateThaiNames(raw);
 assert.equal(thai.names.size,812);assert.equal(raw.meta.cardCount,812);
 assert.deepEqual(raw.meta.counts,{scientific:745,english:64,reviewed:3});
 assert.equal(new Set([...thai.names.values()].map(e=>e.checklistScientific)).size,812,'each checklist species is used once');
 for(const [id,e] of thai.names){assert.ok(byId.has(id),id);assert.match(e.thai,/^[฀-๿ ,]+$/u);if(e.match==='scientific')assert.equal(byId.get(id).scientific,e.checklistScientific);}
 const byChinese=c=>thai.names.get(birds.find(b=>b.chinese===c).id);
 assert.equal(byChinese('喜鹊').thai,'นกสาลิกาปากดำ');assert.equal(byChinese('戴胜').thai,'นกกะรางหัวขวาน');
 assert.equal(byChinese('牛背鹭').thai,'นกยางควาย');assert.equal(byChinese('牛背鹭').match,'english');
 assert.equal(byChinese('绿鹭').thai,'นกยางเขียว');assert.equal(byChinese('绿鹭').match,'reviewed');assert.ok(byChinese('绿鹭').note);
 // Not on the Thai checklist, or listed there without a Thai name.
 for(const c of ['蒙古沙鸻','弄岗穗鹛','黄爪隼','松鸦','白头鵙鹛'])assert.equal(byChinese(c),undefined,c);
});

test('Thai names attach without entering saved data, and are searchable',async()=>{
 const dataset=validateDataset(await read('data/birds.json')),thai=validateThaiNames(await read('data/thai-names.json'));
 attachThaiNames(dataset.birds,thai);
 const magpie=dataset.birds.find(b=>b.chinese==='喜鹊');
 assert.equal(magpie.thai,'นกสาลิกาปากดำ');assert.ok(matches(magpie,'สาลิกา'));assert.ok(!matches(magpie,'นกยาง'));
 assert.ok(!JSON.stringify(dataset).includes('นก'),'Thai names stay out of saved datasets and backups');
 assert.ok(!toCSV(dataset.birds).includes('นก'),'Thai names stay out of CSV exports');
 assert.match(thaiDetails(magpie,thai),/^นกสาลิกาปากดำ · Thai checklist: Oriental Magpie, Pica serica$/);
 attachThaiNames(dataset.birds,null);assert.equal(magpie.thai,undefined);
});

test('Thai names validation rejects malformed files and skips bad entries',()=>{
 for(const bad of [null,{},{schemaVersion:2,names:{}},{schemaVersion:1,names:[]}])assert.throws(()=>validateThaiNames(bad),/Thai names/);
 const thai=validateThaiNames({schemaVersion:1,names:{'colcn:a':{thai:'นกทดสอบ',match:'scientific'},'colcn:b':{thai:'Not Thai',match:'scientific'},'colcn:c':{thai:'นก',match:'guess'},'bad id!':{thai:'นก',match:'english'}}});
 assert.deepEqual([...thai.names.keys()],['colcn:a']);
});
