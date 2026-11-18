import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateEBirdLinks,ebirdReference,renderEBirdReference} from '../app/ebird.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url));
const pack=validateEBirdLinks(JSON.parse(await read('data/ebird-links.json')));
test('eBird references preserve source matches and identify candidate and manual-lookup coverage',async()=>{
 assert.deepEqual(pack.meta.matches,{scientific:1274,alias:22,'common-name':122});
 assert.equal(Object.keys(pack.byScientific).length,1418);assert.equal(pack.unmatched.length,27);
 const egret=ebirdReference({scientific:'Egretta garzetta',english:'Little Egret'},pack);
 assert.equal(egret.href,'https://ebird.org/species/litegr');assert.equal(egret.kind,'scientific');
 const shikra=ebirdReference({scientific:'Accipiter badius',english:'Shikra'},pack);
 assert.equal(shikra.kind,'common-name');assert.match(shikra.message,/Name-based reference/);
 assert.match(shikra.message,/Tachyspiza badia/);
 for(const [path,hash] of Object.entries(pack.meta.inputHashes))assert.equal(createHash('sha256').update(await read(path)).digest('hex'),hash,path);
});
test('new imported names, changed common-name candidates and missing references fall back without guessing',()=>{
 const changed={scientific:'Accipiter badius',english:'A different imported bird'};
 assert.equal(ebirdReference(changed,pack).href,'https://ebird.org/explore');
 assert.equal(ebirdReference({scientific:'Unseen species',english:'Shikra'},pack).kind,'lookup');
 assert.equal(ebirdReference({scientific:'Egretta garzetta'},null).kind,'lookup');
 const [aliasName,aliasRef]=Object.entries(pack.byScientific).find(([,r])=>r.method==='alias');
 assert.equal(ebirdReference({scientific:aliasName,aliases:[aliasRef.scientific]},pack).kind,'alias');
 assert.equal(ebirdReference({scientific:aliasName,aliases:[]},pack).kind,'lookup');
 assert.equal(ebirdReference({kind:'family',scientific:'Anatidae'},pack),null);
 const invalid=structuredClone(pack);invalid.byScientific['Egretta garzetta'].code='javascript:alert(1)';
 assert.throws(()=>validateEBirdLinks(invalid),/Invalid eBird/);
});
test('eBird links appear only with the revealed answer, keep the notebook open and escape imported text',()=>{
 const bird={scientific:'Egretta garzetta',english:'Little Egret'};
 assert.equal(renderEBirdReference(bird,pack),'');
 assert.equal(renderEBirdReference({...bird,kind:'group'},pack,{revealed:true}),'');
 const html=renderEBirdReference(bird,pack,{revealed:true});
 assert.match(html,/View on eBird/);assert.match(html,/target="_blank"/);assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/https:\/\/ebird.org\/species\/litegr/);
 const fallback=renderEBirdReference({scientific:'Unknown species',english:'<img src=x onerror=alert(1)>'},pack,{revealed:true});
 assert.ok(!fallback.includes('<img'));assert.match(fallback,/&lt;img/);assert.match(fallback,/Find on eBird/);
});
