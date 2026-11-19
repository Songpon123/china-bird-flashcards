import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateNameGuide,nameAnalysis,characterEntries} from '../app/name-guide.mjs';
import {renderNameAnalysis} from '../app/name-guide-ui.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url));
const birds=JSON.parse(await read('data/birds.json')).birds;
const groups=JSON.parse(await read('data/groups.json')).cards;
const guide=validateNameGuide(JSON.parse(await read('data/name-guide.json')));
test('every bundled name character has a sourced meaning; coverage counts and retained input hashes agree',async()=>{
 const chars=new Set([...birds,...groups].flatMap(b=>[...b.chinese]));
 assert.equal(chars.size,475);assert.equal(guide.meta.characterCount,chars.size);
 for(const b of [...birds,...groups])assert.deepEqual(nameAnalysis(b,guide).missing,[],b.chinese);
 assert.equal(Object.values(guide.characters).filter(c=>c.entries.some(e=>e.source==='cedict')).length,474);
 assert.equal(Object.values(guide.characters).filter(c=>c.thai).length,guide.meta.thaiCharacterCount);
 assert.equal(guide.characters['鵟'].entries[0].source,'cas-usage');
 for(const [path,hash] of Object.entries(guide.meta.inputHashes))assert.equal(createHash('sha256').update(await read(path)).digest('hex'),hash,path);
});
test('context readings are selected without throwing away other dictionary senses or inventing a pronunciation',()=>{
 const long=nameAnalysis({chinese:'长尾',pinyin:'cháng wěi'},guide);
 assert.equal(long.characters[0].entries[0].pinyin,'cháng');
 assert.ok(long.characters[0].entries.some(e=>e.pinyin==='zhǎng'));
 const alt=nameAnalysis({chinese:'长',pinyin:'zhǎng'},guide);
 assert.equal(alt.characters[0].entries[0].pinyin,'zhǎng');
 assert.ok(nameAnalysis({chinese:'白',pinyin:'bái'},guide).characters[0].entries[0].definitions.includes('white'));
 assert.ok(characterEntries(guide.characters['白'])[0].definitions.includes('white'));
 const mismatch=nameAnalysis({chinese:'长尾',pinyin:'not-aligned'},guide);
 assert.equal(mismatch.characters[0].reading,'');
 const imported=nameAnalysis({chinese:'𠮷',pinyin:'jí'},guide);
 assert.deepEqual(imported.missing,['𠮷']);assert.equal(imported.characters[0].entries.length,0);
});
test('compounds and personal names do not acquire fabricated literal etymologies',()=>{
 const shrike=nameAnalysis({chinese:'红背伯劳',pinyin:'hóng bèi bó láo'},guide);
 assert.ok(shrike.units.some(u=>u.word==='伯劳'));
 assert.ok(!shrike.units.some(u=>u.word==='背信'));
 const place=nameAnalysis({chinese:'喜马拉雅中杜鹃'},guide);
 assert.ok(place.units.some(u=>u.word==='喜马拉雅'));
 assert.equal(nameAnalysis({chinese:'布氏鹨'},guide).hasPersonalNameMarker,true);
 const unknown=nameAnalysis({chinese:'褐耳鹰'},guide);
 assert.equal(unknown.notes.length,0);
 const cuckoo=nameAnalysis({chinese:'大杜鹃'},guide);
 assert.equal(cuckoo.notes.find(n=>n.match==='杜鹃').kind,'folklore');
 assert.equal(nameAnalysis({chinese:'灰喜鹊'},guide).notes.filter(n=>n.kind==='cultural').length,0);
});
test('place names and other opaque words are read as one word, not character by character',()=>{
 const japan=nameAnalysis({chinese:'日本松雀鹰',pinyin:'rì běn sōng què yīng'},guide);
 assert.deepEqual(japan.units.map(u=>[u.word,u.kind,u.english]),[['日本','name','Japan']]);
 assert.deepEqual(japan.characters.map(c=>c.unit?.word??null),['日本','日本',null,null,null]);
 const html=renderNameAnalysis({chinese:'日本松雀鹰',pinyin:'rì běn sōng què yīng'},guide);
 assert.match(html,/Part of <strong lang="zh-Hans">日本<\/strong>/);
 assert.ok(!html.includes('<p class="learning-gloss">sun; day</p>'),'日 must not be glossed as sun inside 日本');
 // Composed words keep their character meanings.
 assert.equal(nameAnalysis({chinese:'红嘴蓝鹊',pinyin:'hóng zuǐ lán què'},guide).characters[0].unit,null);
 for(const [name,word] of [['喜山点翅朱雀','喜山'],['四川柳莺','四川'],['海南孔雀雉','海南'],['里海银鸥','里海'],['红背伯劳','伯劳']])
  assert.equal(nameAnalysis({chinese:name},guide).characters[0+(name==='红背伯劳'?2:0)].unit?.word,word,name);
 assert.equal(nameAnalysis({chinese:'藏雪鸡',pinyin:'zàng xuě jī'},guide).characters[0].learningEnglish,'Tibet (short for 西藏)');
 // Every name unit has an English and Thai meaning, and only matches names where it is that word.
 for(const w of guide.unitWords)if(guide.compounds[w].kind==='name'){assert.ok(guide.compounds[w].english,w);assert.ok(guide.compounds[w].thai,w);}
});
test('every name character has a Thai meaning and a sourced structure (meaning part, sound part, strokes)',async()=>{
 const structure=JSON.parse(await read('data/character-structure.json'));
 const chars=new Set([...birds,...groups].flatMap(b=>[...b.chinese]));
 for(const c of chars){
  assert.ok(guide.characters[c].thai,`Thai gloss for ${c}`);
  const s=structure.characters[c];assert.ok(s&&s.strokes>0,`structure for ${c}`);
  if(s.type==='pictophonetic')assert.ok(s.semantic&&s.semanticThai,`meaning part for ${c}`);
 }
 assert.equal(structure.meta.authored.length,11);
 for(const [path,hash] of Object.entries(structure.meta.inputHashes))assert.match(hash,/^[0-9a-f]{64}$/,path);
 const withStructure={...guide,structure:structure.characters};
 const egret=renderNameAnalysis({chinese:'白鹭',pinyin:'bái lù'},withStructure);
 assert.match(egret,/<strong lang="zh-Hans">路<\/strong> <span lang="zh-Latn-pinyin">lù<\/span> <span class="muted">\(เสียง\)<\/span>/);
 assert.match(egret,/Make Me a Hanzi \(LGPL-3.0\)/);
 assert.match(renderNameAnalysis({chinese:'鹟',pinyin:'wēng'},withStructure),/sound from 翁 \(wēng\)/);
 // Inside a place name the character's own structure sits in the collapsed details.
 const japan=renderNameAnalysis({chinese:'日本松雀鹰',pinyin:'rì běn sōng què yīng'},withStructure);
 assert.ok(japan.indexOf('The sun')>japan.indexOf('This character on its own'));
 assert.equal(nameAnalysis({chinese:'凤头鹰',pinyin:'fèng tóu yīng'},guide).characters[0].learningEnglish,'phoenix');
 assert.ok(!renderNameAnalysis({chinese:'白鹭'},guide).includes('Make Me a Hanzi'),'no structure credit without structure data');
});
test('rendered meanings retain credits, distinguish unsupported history, escape text and reject unsafe links',()=>{
 const html=renderNameAnalysis({chinese:'褐耳鹰',pinyin:'hè ěr yīng'},guide);
 assert.match(html,/Naming-history notes are available for selected names/);assert.match(html,/CC BY-SA 4.0/);
 const altered=structuredClone(guide);
 altered.characters['白'].thai='<img src=x onerror=alert(1)>';
 altered.meta.sources.find(s=>s.id==='cedict').url='javascript:alert(1)';
 const escaped=renderNameAnalysis({chinese:'白'},altered);
 assert.ok(!escaped.includes('<img'));assert.ok(escaped.includes('&lt;img'));assert.ok(!escaped.includes('javascript:'));
 assert.match(renderNameAnalysis({chinese:'𠮷'},guide),/Not covered by this snapshot/);
 assert.match(renderNameAnalysis({},null),/unavailable/);
 const missingSource=structuredClone(guide);missingSource.notes[0].sources=['made-up'];
 assert.throws(()=>validateNameGuide(missingSource),/evidence/);
});
