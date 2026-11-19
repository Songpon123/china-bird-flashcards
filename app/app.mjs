import {DAY,DIRECTIONS,keyFor,fold,matches,schedule,stateOf,localDay,makeQueue,shuffleOrder,parseCSV,toCSV,validateDataset,planUpdate,validateBackup} from './core.mjs?v=0.6.0';
import {familyKey,inGroup,familyLabel,validateGroups} from './taxonomy.mjs';
import {validateEBirdLinks,renderEBirdReference} from './ebird.mjs?v=0.5.0';
import {validateNameGuide,characterEntries} from './name-guide.mjs?v=0.5.0';
import {renderNameAnalysis} from './name-guide-ui.mjs?v=0.5.1';
import {validateThaiNames,attachThaiNames,thaiDetails} from './thai-names.mjs?v=0.6.0';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORE='yu-birds-state-v1',DATA='yu-birds-dataset-v1',GROUP_DATA='yu-birds-groups-v1';
let dataset,groupDataset,state,view='study',mode='review',revealed=false,currentId=null,skipped=new Set(),page=0,lastUndo=null,pendingImport=null,pendingRestore=null,voices=[],storageOK=true,externalChange=false;
let practiceIndex=0,nameGuide=null,guideSelection=null,ebirdLinks=null,thaiNames=null;
const defaults={direction:'zh-en',deck:'species',newLimit:20,showPinyin:false,voice:'',shuffleSeed:''};
const newSeed=()=>Math.random().toString(36).slice(2,12)||'mix';
const titleCopy={guide:['What’s inside a Chinese bird name?','Explore characters, word meanings and the stories behind selected names.'],groups:['Know the families. Find your birds.','Learn the larger groups, then explore each species · Chinese, Pinyin, English & scientific scope.'],study:['A whole new way to name birds.','From 白鹭 to Little Egret. Build a vocabulary that stays with you.'],library:['Every bird has a story. Start with its name.','Explore the source checklist in Chinese, Pinyin, English and scientific Latin.'],progress:['A little practice. A growing vocabulary.','Watch your field notebook fill up, one review at a time.'],data:['A good name starts with a good source.','Understand the checklist, inspect its limits, and keep your notebook current.']};
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,6000);}
function error(message){$('fatal').textContent=message;$('fatal').hidden=false;}
function saveState(){
 if(externalChange){error('Another tab updated your notebook. Reload this tab before continuing.');return false;}
 try{localStorage.setItem(STORE,JSON.stringify(state));return true;}catch(e){storageOK=false;error('Your browser could not save progress. Download a full backup now; your current work remains in memory.');return false;}
}
function download(name,data,type='application/json'){
 const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function backup(){download(`yu-notebook-${localDay(Date.now())}.json`,JSON.stringify({format:'china-bird-backup-v1',exportedAt:new Date().toISOString(),dataset,state,groupDataset},null,2));}
function setView(name){
 if(!titleCopy[name])name='study';view=name;
 for(const n of Object.keys(titleCopy))$(n+'-view').hidden=n!==name;
 document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('page-title').textContent=titleCopy[name][0];$('page-subtitle').textContent=titleCopy[name][1];
 if(name==='guide')renderGuide();if(name==='groups')renderGroups();if(name==='library')renderLibrary();if(name==='progress')renderProgress();if(name==='data')renderData();if(name==='study')renderStudy();
 history.replaceState(null,'','#'+name);
}
function options(select,values,allLabel,label=s=>s){
 const prev=select.value;select.innerHTML=`<option value="">${allLabel}</option>`+[...new Set(values)].sort().map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('');
 if([...select.options].some(o=>o.value===prev))select.value=prev;
}
function setupFilters(){
 for(const prefix of ['study','library']){
  options($(prefix+'-order'),dataset.birds.map(b=>b.order),'All orders');
  updateFamilyOptions(prefix);
  const select=$(prefix+'-group'),prev=select.value;select.innerHTML='<option value="">All bird groups</option>'+groupDataset.cards.map(c=>`<option value="${esc(c.id)}">${esc(c.english)} · ${esc(c.chinese)}</option>`).join('');if([...select.options].some(o=>o.value===prev))select.value=prev;select.disabled=!membershipCompatible();
 }
 $('deck').value=state.settings.deck;setDeckControls();$('direction').value=state.settings.direction;$('new-limit').value=state.settings.newLimit;$('show-pinyin').checked=state.settings.showPinyin;
 $('import-taxonomy').value=dataset.meta.taxonomy;
 $('edition-count').textContent=`${dataset.birds.length.toLocaleString()} real, sourced species`;
 document.querySelector('.edition small').textContent=!dataset.meta.imported&&dataset.meta.version==='colcn-2023-v1.1+names-2026-11-18+avilist-v2026'?'CAS 2023 archive · current coverage partial':'Imported checklist · coverage unverified';
 $('footer-source').textContent=dataset.meta.version+' · see source licenses';
}
function updateFamilyOptions(prefix){const order=$(prefix+'-order').value;options($(prefix+'-family'),dataset.birds.filter(b=>!order||b.order===order).map(b=>b.family),'All families',name=>familyLabel(name,groupDataset.cards));}
function focused(prefix){
 const q=$(prefix+'-search').value,order=$(prefix+'-order').value,family=$(prefix+'-family').value,term=groupDataset.cards.find(c=>c.id===$(prefix+'-group').value);
 return dataset.birds.filter(b=>(!q||matches(b,q))&&(!order||b.order===order)&&(!family||b.family===family)&&(!term||membershipCompatible()&&inGroup(b,term)));
}
function studyBirds(){
 const status=$('study-status').value,hide=$('reviewed-only').checked;
 const cards=state.settings.deck==='groups'?groupDataset.cards.filter(c=>!$('study-search').value||matches(c,$('study-search').value)):focused('study');
 return cards.filter(b=>b.english&&(!hide||!b.taxonomyReview)&&(!status||stateOf(state.progress[keyFor(b.id,state.settings.direction)])===status));
}
function queue(){const birds=studyBirds(),seed=state.settings.shuffleSeed;return mode==='practice'?shuffleOrder(birds,seed):makeQueue(birds,state.progress,state.settings.direction,{newLimit:state.settings.newLimit,history:state.history,seed}).filter(b=>!skipped.has(b.id));}
function shuffleDeck(){state.settings.shuffleSeed=newSeed();saveState();resetStudy();}
function current(){return [...dataset.birds,...groupDataset.cards].find(b=>b.id===currentId);}
function resetStudy(){currentId=null;revealed=false;skipped.clear();practiceIndex=0;renderStudy();}
function fmtInterval(days){if(days<1/24)return `${Math.round(days*1440)} min`;if(days<1)return `${Math.round(days*24)} hr`;return `${Math.round(days)} day${Math.round(days)===1?'':'s'}`;}
function renderStats(){
 const d=state.settings.direction,ready=(state.settings.deck==='groups'?groupDataset.cards:dataset.birds).filter(b=>b.english),today=localDay(Date.now());
 $('due-count').textContent=ready.filter(b=>stateOf(state.progress[keyFor(b.id,d)])==='due').length;
 const introduced=new Set(state.history.filter(h=>h.wasNew&&h.direction===d&&localDay(h.at)===today).map(h=>h.id)).size;
 $('new-count').textContent=Math.max(0,state.settings.newLimit-introduced);
 $('today-count').textContent=state.history.filter(h=>localDay(h.at)===today).length;
 $('introduced-label').textContent=state.settings.deck==='groups'?'Terms introduced':'Species introduced';
 $('learned-count').textContent=ready.filter(b=>DIRECTIONS.some(dir=>state.progress[keyFor(b.id,dir)]?.reviews)).length;
}
function renderStudy(){
 renderStats();$('next-heading').textContent=state.settings.deck==='groups'?'Your next family / group term':'Your next bird';const q=queue();
 if(!q.some(b=>b.id===currentId)){currentId=q[mode==='practice'?Math.min(practiceIndex,q.length-1):0]?.id||null;revealed=false;}
 const b=current();const p=b?state.progress[keyFor(b.id,state.settings.direction)]:null;
 $('queue-label').textContent=mode==='practice'?`${q.length} ${state.settings.deck==='groups'?'terms':'birds'} · free practice`:`${q.length} cards available in your focus`;
 $('flip').disabled=!b;$('next').disabled=!b||q.length<2;$('previous').disabled=!b||mode!=='practice'||q.length<2;
 $('speak').disabled=!b||!voices.length||!('speechSynthesis' in window)||(state.settings.direction==='en-zh'&&!revealed);
 $('bird-details').disabled=!b;$('undo').disabled=!lastUndo||externalChange;
 $('card-family').textContent=b?(b.kind?(b.kind==='family'?'FAMILY':'COMMON GROUP'):familyLabel(b.family,groupDataset.cards)):'YOUR FIELD NOTEBOOK';$('card-stage').textContent=b?(mode==='practice'?'FREE PRACTICE':stateOf(p).toUpperCase()):'ALL SET';
 $('flip').innerHTML=(revealed?'Show question':'Reveal answer')+' <kbd>space</kbd>';
 if(!b){
  $('card-body').innerHTML=`<div class="empty"><h3>${studyBirds().length?'Room to let it settle.':'No birds in this focus.'}</h3><p>${studyBirds().length?'No cards are available right now. Due cards return at their scheduled time; your new-card allowance resets tomorrow.':'Try clearing the search or filters. Missing English names are listed in the library.'}</p><p>Choose “Browse & practice freely” to explore without changing schedules.</p>${skipped.size?'<button class="secondary" id="restore-skipped">Bring back skipped cards</button>':''}</div>`;
  $('restore-skipped')?.addEventListener('click',()=>{skipped.clear();renderStudy();});$('card-sequence').textContent='Come back for a little more tomorrow.';
 }else{
  const zhFront=state.settings.direction==='zh-en';
  const main=zhFront?`<div class="chinese" lang="zh-Hans">${esc(b.chinese)}</div>${state.settings.showPinyin||revealed?`<div class="pinyin" lang="zh-Latn-pinyin">${esc(b.pinyin)}</div>`:''}`:`<div class="english">${esc(b.english)}</div>`;
  const answer=zhFront?`<div class="small-english">${esc(b.english)}</div>`:`<div class="small-zh" lang="zh-Hans">${esc(b.chinese)}</div><div class="pinyin" lang="zh-Latn-pinyin">${esc(b.pinyin)}</div>`;
  $('card-body').innerHTML=`<div class="card-hint">${revealed?(b.thai&&!b.kind?'THE FOUR NAMES · THAI NAME':'THE FOUR NAMES'):zhFront?(b.kind?'WHAT IS THIS TERM IN ENGLISH?':'WHAT IS THIS BIRD IN ENGLISH?'):'HOW DO YOU SAY IT IN CHINESE?'}</div>${main}${revealed?`<div class="answer-rule"></div>${answer}<div class="scientific">${esc(b.scientific)}</div>${b.thai&&!b.kind?`<div class="bird-thai"><span>Thai</span><b lang="th">${esc(b.thai)}</b></div>`:''}${b.kind?`<div class="term-thai" lang="th">${esc(b.thai)}</div><p class="term-scope">${b.kind==='family'?'科 (kē) = taxonomic family':'An informal learning group · open its details to see the scope'}</p>`:''}${b.taxonomyReview?'<span class="review-note">Name crosswalk needs taxonomy review</span>':''}${renderEBirdReference(b,ebirdLinks,{revealed})}`:''}`;
  $('card-sequence').textContent=mode==='practice'?`Card ${q.findIndex(x=>x.id===b.id)+1} of ${q.length}`:p?.reviews?`${p.reviews} previous review${p.reviews===1?'':'s'} in this direction`:'A new name to get to know';
 }
 $('study-meanings').hidden=!b||!revealed;
 $('study-meaning-content').innerHTML=b&&revealed?renderNameAnalysis(b,nameGuide):'';
 if(!revealed)$('study-meanings').open=false;
 $('rate-help').textContent=mode==='practice'?'Free practice does not change your review schedule.':revealed?'How well did you remember? Choose your next interval.':'Reveal the answer, then tell yourself how it went.';
 document.querySelectorAll('[data-rating]').forEach(btn=>{
  btn.disabled=!b||!revealed||mode!=='review'||externalChange;
  btn.querySelector('small').textContent=b?fmtInterval(schedule(p,btn.dataset.rating).interval):'—';
 });
}
function flip(){if(!current())return;revealed=!revealed;renderStudy();if(revealed)$('study-meanings').open=true;}
function rate(rating){
 if(!current()||!revealed||mode!=='review'||externalChange)return;
 const b=current(),k=keyFor(b.id,state.settings.direction),prev=state.progress[k]?{...state.progress[k]}:null,now=Date.now();
 lastUndo={key:k,previous:prev,historyLength:state.history.length,id:b.id,direction:state.settings.direction,deck:state.settings.deck};
 state.progress[k]=schedule(prev,rating,now);state.history.push({id:b.id,direction:state.settings.direction,rating,at:now,wasNew:!prev?.reviews});
 saveState();currentId=null;revealed=false;renderStudy();toast(`${b.chinese} · next review in ${fmtInterval(state.progress[k].interval)}`);
}
function nextBird(delta=1){
 const q=queue();if(q.length<2)return;
 if(mode==='practice'){practiceIndex=(q.findIndex(b=>b.id===currentId)+delta+q.length)%q.length;currentId=q[practiceIndex].id;}
 else {skipped.add(currentId);currentId=null;}
 revealed=false;renderStudy();
}
function undo(){
 if(!lastUndo||externalChange)return;const u=lastUndo;
 if(u.previous)state.progress[u.key]=u.previous;else delete state.progress[u.key];
 state.history.splice(u.historyLength);state.settings.deck=u.deck;$('deck').value=u.deck;setDeckControls();state.settings.direction=u.direction;$('direction').value=u.direction;lastUndo=null;
 currentId=u.id;skipped.delete(u.id);revealed=false;saveState();renderStudy();toast('Last review undone.');
}
function renderLibrary(){
 let birds=focused('library');const quality=$('library-quality').value;
 birds=birds.filter(b=>!quality||quality==='ready'&&b.english||quality==='review'&&b.taxonomyReview||quality==='missing'&&!b.english);
 page=Math.min(page,Math.max(0,Math.ceil(birds.length/40)-1));
 $('library-count').textContent=`${birds.length.toLocaleString()} species`;
 $('library-body').innerHTML=birds.slice(page*40,(page+1)*40).map(b=>`<tr><td><strong lang="zh-Hans">${esc(b.chinese)}</strong><small lang="zh-Latn-pinyin">${esc(b.pinyin)}</small></td><td>${esc(b.english||'English name unresolved')}${b.thai?`<small lang="th" class="library-thai">${esc(b.thai)}</small>`:''}<small><em>${esc(b.scientific)}</em></small>${b.taxonomyReview?'<small>△ Taxonomy review</small>':''}</td><td>${esc(familyLabel(b.family,groupDataset.cards))}<small>${esc(b.order)}</small></td><td><span class="status-pill">${stateOf(state.progress[keyFor(b.id,state.settings.direction)])}</span></td><td><button class="text-button" data-details="${esc(b.id)}">Details ↗</button>${b.english?`<br><button class="text-button" data-practice="${esc(b.id)}">Practice →</button>`:''}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">No species match these filters.</td></tr>';
 $('page-label').textContent=`${birds.length?page*40+1:0}–${Math.min((page+1)*40,birds.length)} of ${birds.length}`;
 $('page-prev').disabled=page===0;$('page-next').disabled=(page+1)*40>=birds.length;
}
function showDetails(b){
 if(!b)return;document.querySelector('#details-dialog h2').textContent='Bird name & record';if(b.kind){showTermDetails(b);return;}const source=dataset.meta.sources?.find(s=>s.id===b.englishSource);
 const pairs=[['Chinese',b.chinese],['Pinyin',b.pinyin],['English',b.english||'Unresolved · excluded from study'],['Scientific',b.scientific],...(b.thai?[['Thai name',thaiDetails(b,thaiNames)]]:[]),['Family / order',familyLabel(b.family,groupDataset.cards)+' / '+b.order],['Stable ID',b.id],['Aliases',b.aliases.join('; ')||'No safe aliases in this snapshot'],['English source',source?.title||b.englishSource||'Unresolved'],['Matched name',b.matchedScientific||'—'],['Name matching',b.nameMatch],['Pinyin status',b.pinyinStatus]];
 const sourceUrl=b.id.startsWith('colcn:')?`https://www.gbif.org/dataset/7e276a96-73ea-4efc-8ffb-e74ef573ef6c/taxon/${encodeURIComponent(b.sourceId)}`:dataset.meta.sourceUrl;
 $('details-content').innerHTML=`<dl class="dialog-meta">${pairs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="muted">Scientific-name equality is a name match, not a guarantee that taxon concepts agree after splits or lumps.</p><p><a href="${safeUrl(sourceUrl)}" target="_blank" rel="noreferrer">Source record / checklist ↗</a></p>${renderEBirdReference(b,ebirdLinks,{revealed:true})}`;
 $('details-content').insertAdjacentHTML('beforeend','<h3 class="details-meaning-title">Name meanings & story</h3>'+renderNameAnalysis(b,nameGuide));
 $('details-dialog').showModal();
}
function practice(id){
 state.settings.deck='species';$('deck').value='species';setDeckControls();saveState();mode='practice';$('mode').value=mode;clearStudyFilters();currentId=id;revealed=false;skipped.clear();setView('study');$('flashcard').scrollIntoView({block:'center'});
}
function clearStudyFilters(){for(const f of ['search','order','family','group','status','group'])$('study-'+f).value='';$('reviewed-only').checked=false;updateFamilyOptions('study');}
function renderProgress(){
 const all=dataset.birds,learned=all.filter(b=>DIRECTIONS.some(d=>state.progress[keyFor(b.id,d)]?.reviews)).length;
 const mature=all.filter(b=>DIRECTIONS.some(d=>state.progress[keyFor(b.id,d)]?.interval>=21)).length;
 const due=[...all,...groupDataset.cards].reduce((s,b)=>s+DIRECTIONS.filter(d=>stateOf(state.progress[keyFor(b.id,d)])==='due').length,0);
 const active=[...all,...groupDataset.cards];
 const introducedTerms=groupDataset.cards.filter(c=>DIRECTIONS.some(d=>state.progress[keyFor(c.id,d)]?.reviews)).length;
 const archived=Object.keys(state.progress).filter(k=>!active.some(b=>k.startsWith(b.id+'|'))).length;
 $('progress-stats').innerHTML=[[learned,'Species introduced'],[mature,'Species mature in a direction'],[introducedTerms,'Family/group terms introduced'],[state.history.length,'Total reviews'],[due,'Cards due · both directions']].map(([n,t])=>`<div class="metric"><strong>${n.toLocaleString()}</strong><span>${t}</span></div>`).join('');
 const now=new Date();const days=Array.from({length:14},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-13+i);return {date:d,count:state.history.filter(h=>localDay(h.at)===localDay(d.getTime())).length};});
 const max=Math.max(1,...days.map(d=>d.count));
 $('activity').innerHTML=days.map(d=>`<div class="day" title="${localDay(d.date.getTime())}: ${d.count} reviews"><span>${d.count||''}</span><i style="height:${Math.max(2,d.count/max*100)}px"></i><small>${d.date.getDate()}</small></div>`).join('');
 $('direction-progress').innerHTML=DIRECTIONS.map(d=>{const n=all.filter(b=>state.progress[keyFor(b.id,d)]?.reviews).length;return `<div class="progress-row"><strong>${d==='zh-en'?'Chinese → English':'English → Chinese'}</strong><span>${n} / ${all.length} introduced</span><div class="meter"><i style="width:${n/all.length*100}%"></i></div></div>`;}).join('')+(archived?`<p class="muted">${archived} archived card schedules retained for species absent from the current dataset.</p>`:'');
}
function safeUrl(value){try{const u=new URL(value);return /^https?:$/.test(u.protocol)?esc(u.href):'#';}catch{return '#';}}
function renderGuide(){
 if(!nameGuide){$('guide-coverage').textContent='Dictionary unavailable. Reload to retry.';$('guide-content').innerHTML=renderNameAnalysis({},null);return;}
 const q=$('guide-search').value.trim(),all=[...dataset.birds,...groupDataset.cards];
 const found=all.filter(b=>!q||matches(b,q)).sort((a,b)=>Number(b.chinese===q)-Number(a.chinese===q));
 const characters=Object.entries(nameGuide.characters).filter(([c,r])=>q&&fold([c,r.thai,r.learningEnglish,...r.entries.flatMap(e=>[e.pinyin,...e.definitions])].join(' ')).includes(fold(q))).slice(0,10);
 const meta=nameGuide.meta;
 $('guide-coverage').textContent=`Bundled names: ${meta.characterCount} distinct characters covered (${meta.dictionaryCharacters} from CC-CEDICT + 1 modern-usage entry); ${meta.thaiCharacterCount} with Thai glosses. ${meta.notesCount||nameGuide.notes.length} selected name notes. New imported characters may be uncovered.`;
 $('guide-result-count').textContent=`${found.length.toLocaleString()} matching names`;
 $('guide-results').innerHTML=found.slice(0,20).map(b=>`<button class="guide-result" data-guide-record="${esc(b.id)}" aria-pressed="${guideSelection===b.id}"><strong lang="zh-Hans">${esc(b.chinese)}</strong><span>${esc(b.english||b.scientific)}</span>${b.thai?`<small lang="th">${esc(b.thai)}</small>`:''}<small lang="zh-Latn-pinyin">${esc(b.pinyin)}</small></button>`).join('')+(found.length>20?'<p class="muted">Showing the first 20. Refine your search for more names.</p>':found.length?'':'<p class="muted">No matching names. Try Chinese, Pinyin, or an English or Thai bird name.</p>');
 $('guide-character-results').innerHTML=characters.length?'<h3>Matching characters</h3><div class="character-choices">'+characters.map(([c])=>`<button class="secondary" data-guide-character="${esc(c)}" lang="zh-Hans">${esc(c)}</button>`).join('')+'</div>':'';
 let b=all.find(b=>b.id===guideSelection);
 const character=guideSelection?.startsWith('char:')?guideSelection.slice(5):!b&&[...q].length===1&&nameGuide.characters[q]?q:null;
 if(character){const r=nameGuide.characters[character];b={chinese:character,pinyin:characterEntries(r)[0]?.pinyin||'',english:'Character lookup'};}
 else if(!b)b=found[0];
 if(!b){$('guide-record-heading').innerHTML='<h2>Choose a name or character</h2>';$('guide-content').innerHTML='<p class="muted">Search above to explore its meaning.</p>';return;}
 $('guide-results').querySelectorAll('[data-guide-record]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.guideRecord===b.id)));
 $('guide-record-heading').innerHTML=`<h2 lang="zh-Hans">${esc(b.chinese)}</h2><p class="term-pinyin" lang="zh-Latn-pinyin">${esc(b.pinyin)}</p><p>${esc(b.english||'English name unresolved')}${b.scientific?` · <em>${esc(b.scientific)}</em>`:''}</p>${b.thai?`<p class="term-thai" lang="th">${esc(b.thai)}</p>`:''}${b.scientific&&!b.kind?renderEBirdReference(b,ebirdLinks,{revealed:true}):''}`;
 $('guide-content').innerHTML=renderNameAnalysis(b,nameGuide);
}
function membershipCompatible(){return dataset.meta.taxonomy===groupDataset.meta.membershipTaxonomy;}
function setDeckControls(){
 const terms=state.settings.deck==='groups';
 document.querySelectorAll('[data-species-filter]').forEach(el=>el.hidden=terms);
 $('study-search').placeholder=terms?'hawks, 鸭科, yā kē, Anatidae…':'白鹭, bái lù, egret, นกยาง…';
}
function renderGroups(){
 const query=$('groups-search').value,kind=$('groups-kind').value,compatible=membershipCompatible();
 const cards=groupDataset.cards.filter(c=>(!query||matches(c,query))&&(!kind||c.kind===kind));
 $('groups-coverage').textContent=`Starter vocabulary: ${groupDataset.cards.filter(c=>c.kind==='family').length} of 109 source families, plus ${groupDataset.cards.filter(c=>c.kind==='group').length} informal groups · CAS 2023 membership${compatible?'':' · Imported taxonomy differs: membership links unavailable'}`;
 $('groups-count').textContent=`${cards.length} family & group terms`;
 $('quick-groups').innerHTML=groupDataset.cards.filter(c=>c.kind==='group').slice(0,4).map(c=>`<button class="secondary" data-members="${esc(c.id)}" ${compatible?'':'disabled'}>${esc(c.english)} ↗</button>`).join('');
 $('group-cards').innerHTML=cards.map(c=>{
  const count=compatible?dataset.birds.filter(b=>inGroup(b,c)).length:null;
  return `<article class="term-card"><div class="section-line"><span class="pill">${c.kind==='family'?'FAMILY':'COMMON GROUP'}</span><span>${count===null?'Not mapped':count+' species'}</span></div><h3 lang="zh-Hans">${esc(c.chinese)}</h3><p class="term-pinyin" lang="zh-Latn-pinyin">${esc(c.pinyin)}</p><p class="term-english">${esc(c.english)}</p><p class="term-latin">${esc(c.scientific)}</p><p lang="th">${esc(c.thai)}</p><div class="term-actions"><button class="primary" data-term="${esc(c.id)}">Practice term</button><button class="secondary" data-members="${esc(c.id)}" ${count?'':'disabled'}>View species →</button><button class="text-button" data-term-details="${esc(c.id)}">Meanings & sources ↗</button></div></article>`;
 }).join('')||'<p class="empty">No matching terms.</p>';
}
function startTerms(id=null){
 state.settings.deck='groups';$('deck').value='groups';mode=id?'practice':'review';$('mode').value=mode;saveState();clearStudyFilters();setDeckControls();currentId=id;revealed=false;skipped.clear();practiceIndex=0;setView('study');$('flashcard').scrollIntoView({block:'center'});
}
function showMembers(id){
 if(!membershipCompatible())return;
 $('library-search').value='';$('library-order').value='';updateFamilyOptions('library');$('library-family').value='';$('library-quality').value='';$('library-group').value=id;page=0;setView('library');$('library-count').scrollIntoView({block:'center'});
}
function handleGroupClick(e){
 const study=e.target.closest('[data-term]'),members=e.target.closest('[data-members]'),details=e.target.closest('[data-term-details]');
 if(study)startTerms(study.dataset.term);if(members)showMembers(members.dataset.members);if(details)showTermDetails(groupDataset.cards.find(c=>c.id===details.dataset.termDetails));
}
function showTermDetails(c){
 document.querySelector('#details-dialog h2').textContent='Family / group term';
 const pairs=[['Chinese',c.chinese],['Pinyin',c.pinyin],['English',c.english],['Thai learning gloss',c.thai],['Term type',c.kind==='family'?'Family':'Informal learning group'],['Scientific family / scope',c.scientific],['Definition',c.scope],['Stable ID',c.id],['Names / sources',c.nameMatch],['Pinyin status',c.pinyinStatus]];
 $('details-content').innerHTML=`<dl class="dialog-meta">${pairs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="muted">${esc(groupDataset.meta.license)}</p><a href="${safeUrl(c.sourceUrl)}" target="_blank" rel="noreferrer">Source ↗</a><h3 class="details-meaning-title">Name meanings & story</h3>${renderNameAnalysis(c,nameGuide)}`;if(!$('details-dialog').open)$('details-dialog').showModal();
}
function renderData(){
 const ready=dataset.birds.filter(b=>b.english).length;
 const baseline=!dataset.meta.imported&&dataset.meta.version==='colcn-2023-v1.1+names-2026-11-18+avilist-v2026';
 document.querySelector('.coverage-paper h2').textContent=baseline?'Complete source. Partial current checklist.':'Imported checklist. Coverage unverified.';
 $('coverage-description').textContent=baseline?dataset.meta.coverage:'Coverage and reuse terms are supplied by the importer and have not been independently audited.'+(dataset.meta.coverage?' Importer’s coverage statement: '+dataset.meta.coverage:'');
 $('coverage-numbers').innerHTML=`<div><strong>${dataset.birds.length.toLocaleString()}</strong><span>source species in library</span></div><div><strong>${ready.toLocaleString()}</strong><span>with all four study fields</span></div>`;
 const sources=dataset.meta.sources||[{title:dataset.meta.title,url:dataset.meta.sourceUrl,license:dataset.meta.license}];
 $('source-cards').innerHTML=sources.map(s=>`<article class="source-card"><span class="license">${esc(s.license)}</span><h3>${esc(s.id==='colcn-2023'?'National coverage baseline':s.id==='ioc-15.2'?'English-name reference':'Historical names / imported source')}</h3><p>${esc(s.title)}</p><a href="${safeUrl(s.url)}" target="_blank" rel="noreferrer">Source & attribution ↗</a></article>`).join('')+(thaiNames?`<article class="source-card"><span class="license">Thai names · attribution</span><h3>Thai bird names</h3><p>${esc(thaiNames.meta.source?.title||'Thai checklist')} · ${thaiNames.names.size.toLocaleString()} cards. ${esc(thaiNames.meta.source?.license||'')}</p><a href="./data/thai-names.json" target="_blank">Thai names & matching ↗</a></article>`:'');
 $('import-taxonomy').value=dataset.meta.taxonomy;
}
function updateVoices(){
 voices='speechSynthesis' in window?speechSynthesis.getVoices().filter(v=>/^(zh(-|_)CN|cmn|zh(-|_)Hans)/i.test(v.lang)):[];
 $('voice').innerHTML=voices.length?'<option value="">Default available Mandarin voice</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)}${v.localService?', on-device':', may use network'})</option>`).join(''):'<option value="">No Mandarin voice available</option>';
 $('voice').value=state?.settings.voice||'';
 $('voice-status').textContent=voices.length?'Audio availability and pronunciation depend on your device’s voice.':'Install a Mandarin (China) speech voice in your device settings, then reload. You can still study without audio.';
 if(dataset&&view==='study')renderStudy();
}
function speak(){
 const b=current();if(!b||!voices.length||$('speak').disabled)return;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(b.chinese);u.lang='zh-CN';u.rate=.8;u.voice=voices.find(v=>v.voiceURI===state.settings.voice)||voices[0];u.onerror=()=>toast('Mandarin audio is unavailable from this voice. Try another in Data & sources.');speechSynthesis.speak(u);
}
async function previewImport(){
 pendingImport=null;$('apply-import').hidden=true;
 try{
  const f=$('dataset-file').files[0];if(!f)throw new Error('Choose a dataset CSV or JSON file first.');if(f.size>15e6)throw new Error('Dataset file is too large (15 MB limit).');
  const text=await f.text();let raw;
  if(f.name.toLowerCase().endsWith('.csv')){
   raw={schemaVersion:1,meta:{title:$('import-title').value,version:$('import-version').value,taxonomy:$('import-taxonomy').value,scope:$('import-scope').value,sourceUrl:$('import-source').value,license:$('import-license').value},birds:parseCSV(text)};
  }else raw=JSON.parse(text);
  const incoming=validateDataset(raw),plan=planUpdate(dataset,incoming);incoming.meta.imported=true;
  $('import-preview').innerHTML=`<div class="import-result"><b>${esc(incoming.meta.title)}</b><p>${incoming.birds.length} species · ${plan.added.length} added · ${plan.changed.length} changed · ${plan.unchanged.length} unchanged · ${plan.removed.length} removed from active deck.</p><p>License: ${esc(incoming.meta.license)}<br>Version: ${esc(incoming.meta.version)}</p>${plan.conflicts.length?`<b>Update blocked: ${plan.conflicts.length} taxon identity conflicts.</b><ul>${plan.conflicts.slice(0,5).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Existing IDs keep their schedules. Removed records keep archived progress. A full pre-update backup downloads when you apply.</p>'}</div>`;
  if(!plan.conflicts.length){pendingImport=incoming;$('apply-import').hidden=false;}
 }catch(e){$('import-preview').textContent=e.message;}
}
function applyImport(){
 if(!pendingImport||externalChange)return;backup();
 try{localStorage.setItem(DATA,JSON.stringify(pendingImport));}catch(e){error('Dataset was not applied: browser storage is full or unavailable. Your existing dataset is unchanged.');return;}
 dataset=pendingImport;attachThaiNames(dataset.birds,thaiNames);pendingImport=null;lastUndo=null;$('apply-import').hidden=true;$('import-preview').textContent='Update applied. Source credits and archived progress are retained.';setupFilters();resetStudy();renderData();toast('Dataset updated. A pre-update backup was downloaded.');
}
async function previewRestore(){
 pendingRestore=null;$('apply-restore').hidden=true;
 try{const f=$('backup-file').files[0];if(!f)throw new Error('Choose a full notebook backup.');if(f.size>25e6)throw new Error('Backup is too large (25 MB limit).');pendingRestore=validateBackup(JSON.parse(await f.text()));$('restore-preview').textContent=`This backup has ${pendingRestore.dataset.birds.length} species, ${Object.keys(pendingRestore.state.progress).length} card schedules, and ${pendingRestore.state.history.length} reviews. Applying it replaces this browser’s dataset and progress. A backup of your current notebook downloads first.`;$('apply-restore').hidden=false;}catch(e){$('restore-preview').textContent=e.message;}
}
function applyRestore(){
 if(!pendingRestore||externalChange)return;backup();
 const oldData=localStorage.getItem(DATA),oldState=localStorage.getItem(STORE),oldGroups=localStorage.getItem(GROUP_DATA);
 try{localStorage.setItem(DATA,JSON.stringify(pendingRestore.dataset));localStorage.setItem(STORE,JSON.stringify(pendingRestore.state));localStorage.setItem(GROUP_DATA,JSON.stringify(pendingRestore.groupDataset||groupDataset));}
 catch(e){try{if(oldData===null)localStorage.removeItem(DATA);else localStorage.setItem(DATA,oldData);if(oldState===null)localStorage.removeItem(STORE);else localStorage.setItem(STORE,oldState);if(oldGroups===null)localStorage.removeItem(GROUP_DATA);else localStorage.setItem(GROUP_DATA,oldGroups);}catch{}error('Restore failed because browser storage is unavailable or full. Keep the downloaded backup.');return;}
 dataset=pendingRestore.dataset;attachThaiNames(dataset.birds,thaiNames);state=pendingRestore.state;groupDataset=pendingRestore.groupDataset||groupDataset;pendingRestore=null;lastUndo=null;setupFilters();resetStudy();renderData();updateVoices();$('apply-restore').hidden=true;$('restore-preview').textContent='Notebook restored.';toast('Dataset and progress restored.');
}
function bind(){
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('coverage-link').onclick=()=>setView('data');
 $('flip').onclick=flip;$('shuffle').onclick=shuffleDeck;$('next').onclick=()=>nextBird();$('previous').onclick=()=>nextBird(-1);$('undo').onclick=undo;$('speak').onclick=speak;$('bird-details').onclick=()=>showDetails(current());$('close-details').onclick=()=>$('details-dialog').close();
 $('details-dialog').onclick=e=>{if(e.target===$('details-dialog'))$('details-dialog').close();};
 document.querySelectorAll('[data-rating]').forEach(b=>b.onclick=()=>rate(b.dataset.rating));
 $('deck').onchange=()=>{state.settings.deck=$('deck').value;saveState();clearStudyFilters();setDeckControls();resetStudy();};
 $('direction').onchange=()=>{state.settings.direction=$('direction').value;saveState();resetStudy();};
 $('mode').onchange=()=>{mode=$('mode').value;resetStudy();};
 $('new-limit').onchange=()=>{const n=Number($('new-limit').value);state.settings.newLimit=Number.isFinite(n)?Math.max(0,Math.min(500,Math.floor(n))):20;$('new-limit').value=state.settings.newLimit;saveState();resetStudy();};
 $('show-pinyin').onchange=()=>{state.settings.showPinyin=$('show-pinyin').checked;saveState();renderStudy();};
 for(const prefix of ['study','library']){
  for(const f of ['search','order','family','group',...(prefix==='study'?['status']:['quality'])]){
   $(prefix+'-'+f).addEventListener(f==='search'?'input':'change',()=>{if(f==='order')updateFamilyOptions(prefix);if(prefix==='study')resetStudy();else{page=0;renderLibrary();}});
  }
 }
 $('guide-search').oninput=()=>{guideSelection=null;renderGuide();};
 $('guide-shortcuts').onclick=e=>{const button=e.target.closest('[data-guide-name]');if(button){$('guide-search').value=button.dataset.guideName;guideSelection=null;renderGuide();}};
 $('guide-results').onclick=e=>{const button=e.target.closest('[data-guide-record]');if(button){guideSelection=button.dataset.guideRecord;renderGuide();$('guide-record-heading').scrollIntoView({block:'start',behavior:'smooth'});}};
 $('guide-character-results').onclick=e=>{const button=e.target.closest('[data-guide-character]');if(button){$('guide-search').value=button.dataset.guideCharacter;guideSelection='char:'+button.dataset.guideCharacter;renderGuide();$('guide-record-heading').scrollIntoView({block:'start',behavior:'smooth'});}};
 $('groups-search').oninput=renderGroups;$('groups-kind').onchange=renderGroups;$('study-terms').onclick=()=>startTerms();
 $('group-cards').onclick=handleGroupClick;$('quick-groups').onclick=handleGroupClick;
 $('reviewed-only').onchange=resetStudy;$('clear-study').onclick=()=>{clearStudyFilters();resetStudy();};
 $('page-prev').onclick=()=>{page--;renderLibrary();};$('page-next').onclick=()=>{page++;renderLibrary();};
 $('library-body').onclick=e=>{const detail=e.target.closest('[data-details]'),practiceButton=e.target.closest('[data-practice]');if(detail)showDetails(dataset.birds.find(b=>b.id===detail.dataset.details));if(practiceButton)practice(practiceButton.dataset.practice);};
 $('export-csv').onclick=()=>download('china-birds.csv',toCSV(dataset.birds),'text/csv;charset=utf-8');$('export-json').onclick=()=>download('china-birds-dataset.json',JSON.stringify(dataset,null,2));
 $('backup-progress').onclick=backup;$('backup-data').onclick=backup;
 $('preview-import').onclick=previewImport;$('apply-import').onclick=applyImport;$('dataset-file').onchange=()=>{pendingImport=null;$('apply-import').hidden=true;$('import-preview').textContent='';};
 $('csv-meta').addEventListener('input',()=>{pendingImport=null;$('apply-import').hidden=true;});
 $('preview-restore').onclick=previewRestore;$('apply-restore').onclick=applyRestore;$('backup-file').onchange=()=>{pendingRestore=null;$('apply-restore').hidden=true;};
 $('voice').onchange=()=>{state.settings.voice=$('voice').value;saveState();};
 document.addEventListener('keydown',e=>{if(view!=='study'||$('details-dialog').open||e.altKey||e.ctrlKey||e.metaKey||e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();flip();}if(e.key==='ArrowRight'){e.preventDefault();nextBird();}const rating={1:'again',2:'hard',3:'good',4:'easy'}[e.key];if(rating){e.preventDefault();rate(rating);}});
 window.addEventListener('storage',e=>{if(e.key===STORE||e.key===DATA||e.key===GROUP_DATA){externalChange=true;error('Your notebook changed in another tab. Reload this tab before continuing, or download a backup of this tab’s state.');document.querySelectorAll('[data-rating],#apply-import,#apply-restore').forEach(b=>b.disabled=true);}});
 window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
 setInterval(()=>{if(view==='study'){renderStats();if(!currentId)renderStudy();}},15000);
}
try{
 const responses=await Promise.all([fetch('./data/birds.json?v=2026-11-18-avilist'),fetch('./data/groups.json')]);if(responses.some(r=>!r.ok))throw new Error('A dataset download failed');
 const optional=await Promise.allSettled([fetch('./data/name-guide.json?v=2026-11-19-v8',{cache:'no-cache'}),fetch('./data/ebird-links.json?v=2026-11-19-v3',{cache:'no-cache'}),fetch('./data/character-structure.json?v=2026-11-19-v2',{cache:'no-cache'}),fetch('./data/thai-names.json?v=2026-11-19-v1',{cache:'no-cache'})]);
 try{const response=optional[0].status==='fulfilled'?optional[0].value:null;if(!response?.ok)throw new Error('Download failed');nameGuide=validateNameGuide(await response.json());}catch{toast('The name guide could not load. Flashcards remain available; reload to retry.');}
 try{const response=optional[2].status==='fulfilled'?optional[2].value:null;const data=response?.ok?await response.json():null;if(nameGuide&&data?.schemaVersion===1&&data.characters&&typeof data.characters==='object')nameGuide.structure=data.characters;}catch{/* Character structure is optional. */}
 try{const response=optional[1].status==='fulfilled'?optional[1].value:null;if(!response?.ok)throw new Error('Download failed');ebirdLinks=validateEBirdLinks(await response.json());}catch{/* Species cards still link to eBird Explore for a manual lookup. */}
 try{const response=optional[3].status==='fulfilled'?optional[3].value:null;if(!response?.ok)throw new Error('Download failed');thaiNames=validateThaiNames(await response.json());}catch{/* Thai names are optional; cards show the four names. */}
 const bundled=validateDataset(await responses[0].json());groupDataset=validateGroups(await responses[1].json());
 let storedData=null,storedState=null,storedGroups=null;
 try{storedData=localStorage.getItem(DATA);storedState=localStorage.getItem(STORE);storedGroups=localStorage.getItem(GROUP_DATA);}catch{storageOK=false;error('Browser storage is unavailable. You can study in this tab and export a backup.');}
 if(storedGroups){try{groupDataset=validateGroups(JSON.parse(storedGroups));}catch{error('Saved family/group vocabulary could not be read. The bundled terms are loaded.');}}
 dataset=bundled;
 if(storedData){try{dataset=validateDataset(JSON.parse(storedData));}catch(e){error('The saved dataset could not be read. The bundled source is loaded; your saved copy has not been deleted.');}}
 attachThaiNames(dataset.birds,thaiNames);
 state={progress:{},history:[],settings:{...defaults}};
 if(storedState){try{state=validateBackup({format:'china-bird-backup-v1',dataset,state:JSON.parse(storedState)}).state;}catch(e){externalChange=true;error('Saved progress is invalid. It has not been overwritten. Restore a valid full backup after reloading with browser storage repaired.');}}
 // A per-browser seed mixes the deck across families from the first visit; Shuffle picks a new one.
 if(!state.settings.shuffleSeed){state.settings.shuffleSeed=newSeed();if(storageOK&&!externalChange)saveState();}
 setupFilters();bind();updateVoices();if('speechSynthesis' in window)speechSynthesis.addEventListener('voiceschanged',updateVoices);setView(location.hash.slice(1)||'study');
}catch(e){error('The app could not load its checklist: '+e.message+'. Check your connection and refresh; for a local copy, start it with “npm start”.');}
