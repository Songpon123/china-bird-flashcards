import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DAY,keyFor,matches,schedule,stateOf,makeQueue,shuffleOrder,toCSV,parseCSV,validateDataset,planUpdate,validateBackup,localDay} from '../app/core.mjs';
const raw=JSON.parse(await readFile(new URL('../data/birds.json',import.meta.url)));
const dataset=validateDataset(raw);
const now=new Date(2026,10,18,12).getTime();
test('bundled data preserves every accepted source species, with honest coverage counts',()=>{
 assert.equal(dataset.birds.length,1445);assert.equal(new Set(dataset.birds.map(b=>b.id)).size,1445);
 assert.equal(raw.meta.report.bundledSpecies,1445);assert.equal(raw.meta.report.allChinaCurrentComplete,false);
 assert.equal(dataset.birds.filter(b=>b.english).length,raw.meta.report.studyReady);
 for(const b of dataset.birds){assert.match(b.id,/^colcn:/);assert.ok(b.chinese&&b.pinyin&&b.scientific);assert.doesNotMatch(b.pinyin,/[\u3400-\u9fff]/);}
});
test('Pinyin includes tone marks and search accepts tone-free, compact and v/u: input',()=>{
 const bird=dataset.birds.find(b=>b.scientific==='Anas platyrhynchos');
 assert.equal(bird.pinyin,'lǜ tóu yā');assert.ok(matches(bird,'lvtouya'));assert.ok(matches(bird,'lu: tou'));assert.ok(matches(bird,'Mallard'));assert.ok(matches(bird,'绿头'));
});
test('review intervals, lapses, maturity and directional independence',()=>{
 const a=schedule(null,'again',now);assert.equal(a.due,now+DAY);assert.equal(a.lapses,1);assert.equal(a.streak,0);
 // First answers: Again 1 day, Hard 2, Good 4, Easy 7.
 assert.deepEqual(['again','hard','good','easy'].map(r=>schedule(null,r,now).interval),[1,2,4,7]);
 const g=schedule(null,'good',now);assert.equal(g.interval,4);const g2=schedule(g,'good',now+4*DAY);assert.equal(g2.interval,10);
 const g3=schedule(g2,'good',now+14*DAY);assert.equal(g3.interval,25);
 // Later answers keep Hard < Good < Easy, and Again restarts from the first-answer intervals.
 for(const prev of [g,g2,g3,{...g3,ease:1.3}]){const [h,gd,e]=['hard','good','easy'].map(r=>schedule(prev,r,now).interval);assert.ok(h<gd&&gd<e,`${h} ${gd} ${e}`);}
 const lapse=schedule(g3,'again',now);assert.equal(lapse.interval,1);assert.equal(schedule(lapse,'good',now+DAY).interval,4);assert.equal(stateOf({...g,due:now},now),'due');assert.equal(stateOf({...g,interval:25,due:now+DAY},now),'mature');
 const progress={[keyFor('bird','zh-en')]:g};assert.equal(progress[keyFor('bird','en-zh')],undefined);
});
test('due queue prioritizes reviews, excludes future/missing fields and respects daily new cap',()=>{
 const birds=dataset.birds.filter(b=>b.english).slice(0,5),progress={};progress[keyFor(birds[0].id,'zh-en')]=schedule(null,'good',now);
 progress[keyFor(birds[1].id,'zh-en')]={...schedule(null,'good',now-DAY),due:now-1};
 const q=makeQueue([...birds,{...birds[0],id:'missing',english:''}],progress,'zh-en',{now,newLimit:2,history:[{id:'earlier',wasNew:true,direction:'zh-en',at:now}]});
 assert.deepEqual(q.map(b=>b.id),[birds[1].id,birds[2].id]);
 assert.equal(makeQueue(birds,{},'zh-en',{now,newLimit:0}).length,0);
});
test('a shuffle seed mixes new cards across families, stays stable, and keeps due reviews first',()=>{
 const ready=dataset.birds.filter(b=>b.english);
 assert.deepEqual(shuffleOrder(ready,'').map(b=>b.id),ready.map(b=>b.id));
 const a=shuffleOrder(ready,'abc123').map(b=>b.id),again=shuffleOrder(ready,'abc123').map(b=>b.id),b=shuffleOrder(ready,'xyz789').map(b=>b.id);
 assert.deepEqual(a,again);assert.notDeepEqual(a,b);assert.deepEqual([...a].sort(),ready.map(x=>x.id).sort());
 const fresh=makeQueue(ready,{},'zh-en',{now,newLimit:20,seed:'abc123'});
 assert.equal(fresh.length,20);
 assert.ok(new Set(fresh.map(x=>x.family)).size>=12,'20 new cards should come from many families');
 const progress={[keyFor(ready[0].id,'zh-en')]:{...schedule(null,'good',now-DAY),due:now-1}};
 assert.equal(makeQueue(ready,progress,'zh-en',{now,newLimit:5,seed:'abc123'})[0].id,ready[0].id);
 const restored=validateBackup({format:'china-bird-backup-v1',dataset:raw,state:{progress:{},history:[],settings:{shuffleSeed:'abc123'}}});
 assert.equal(restored.state.settings.shuffleSeed,'abc123');
 assert.equal(validateBackup({format:'china-bird-backup-v1',dataset:raw,state:{progress:{},history:[],settings:{shuffleSeed:'<bad>'}}}).state.settings.shuffleSeed,'');
});
test('CSV round trip preserves aliases, commas, quotes and metadata-independent records',()=>{
 const birds=[{...dataset.birds[0],english:'Name, with "quotes"',aliases:['old name','a,b','"quoted"']}];
 const parsed=validateDataset({...dataset,birds:parseCSV(toCSV(birds))});assert.deepEqual(parsed.birds,birds);
 assert.throws(()=>parseCSV('id,id\n1,2'),/Duplicate/);assert.throws(()=>parseCSV('id,name\n1,"unclosed'),/Unclosed/);
 assert.throws(()=>parseCSV('id,name\n1,hi,extra'),/column count/);
});
test('imports reject duplicate IDs, scientific names and conflicting scientific aliases',()=>{
 assert.throws(()=>validateDataset({...dataset,birds:[dataset.birds[0],dataset.birds[0]]}),/duplicate/);
 assert.throws(()=>validateDataset({...dataset,birds:[{...dataset.birds[0],aliases:[dataset.birds[1].scientific]},dataset.birds[1]]}),/Conflicting/);
 assert.throws(()=>validateDataset({...dataset,meta:{...dataset.meta,license:''}}),/license/);
 assert.throws(()=>validateDataset({...dataset,birds:[{...dataset.birds[0],pinyin:'shu4 ma2 que4'}]}),/tone marks/);
});
test('update preserves IDs and detects unsafe renames, ID replacement and taxonomy migration',()=>{
 const previous={...dataset,birds:dataset.birds.slice(0,2)};
 const next=structuredClone(previous);next.birds[0].english='Updated name';
 let plan=planUpdate(previous,next);assert.equal(plan.changed.length,1);assert.equal(plan.conflicts.length,0);
 next.birds[0].id='other-id';assert.match(planUpdate(previous,next).conflicts[0],/changed ID/);
 next.birds[0].id=previous.birds[0].id;next.birds[0].scientific='Example renamed';next.birds[0].aliases=[];assert.match(planUpdate(previous,next).conflicts[0],/retain/);
 next.birds[0].aliases=[previous.birds[0].scientific];assert.equal(planUpdate(previous,next).conflicts.length,0);
 next.meta.taxonomy='Another taxonomy';assert.equal(planUpdate(previous,next).conflicts.length,2);
});
test('full backup validates archived schedules, zero new limit, and rejects corrupted history',()=>{
 const state={progress:{[keyFor('archived','en-zh')]:schedule(null,'good',now)},history:[{id:'archived',direction:'en-zh',rating:'good',at:now,wasNew:true}],settings:{direction:'en-zh',newLimit:0,showPinyin:true}};
 const saved=validateBackup({format:'china-bird-backup-v1',dataset,state});assert.equal(saved.state.settings.newLimit,0);assert.equal(saved.state.history.length,1);
 assert.equal(saved.state.progress[keyFor('archived','en-zh')].due,now+4*DAY);
 const bad=structuredClone(state);bad.progress[keyFor('archived','en-zh')].due=-1;assert.throws(()=>validateBackup({format:'china-bird-backup-v1',dataset,state:bad}),/Invalid progress/);
 const badHistory={...state,history:[{at:now,id:'a',rating:'made-up',direction:'en-zh'}]};assert.throws(()=>validateBackup({format:'china-bird-backup-v1',dataset,state:badHistory}),/history/);
});
