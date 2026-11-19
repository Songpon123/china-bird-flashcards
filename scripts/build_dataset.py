"""Reproducible extraction. Only needed to rebuild data, never to run the app.
python scripts/build_dataset.py
Requires openpyxl==3.1.5, pypinyin==0.55.0.
"""
import argparse, csv, hashlib, io, json, re
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile
import openpyxl
from pypinyin import lazy_pinyin, Style, load_single_dict

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--sources-dir', type=Path, default=ROOT/'source-notices')
args = parser.parse_args()
src = args.sources_dir
def norm(s): return ' '.join(str(s or '').split())
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
# This extractor and its citations describe these exact source releases.
# An update needs a reviewed extractor/citation change, not a mutable URL swap.
PINNED_SOURCES={
    'col-china-2023.zip':'9c17cdea98e210b2acc6ccf482580a22991a568455e0d6d3b58ba0ea5c675d1b',
    'ioc-gbif-15.2.zip':'982e729f1abf8e2e1b36757f27e521f373bd8ce1e9a13b2fc0c9a09fad8d1c9b',
    'ioc-13.1-multilingual.xlsx':'223172d64aceacc6c5f7f28eb6106e8cc755f495fe3ff12b560b30268e275ece',
    'avilist-v2026-extended.xlsx':'df031d392b766673ce8a9eb37b8e57a91baabf9576b6b2bcfd6cf9aa4902797d',
}
CORRECTIONS=ROOT/'source-notices/name-corrections-2026-11.json'
VERSION='colcn-2023-v1.1+names-2026-11-18+avilist-v2026'
for filename,expected in PINNED_SOURCES.items():
    if digest(src/filename)!=expected:
        raise ValueError(f'Source hash mismatch: {filename}. Review the release and extractor before rebuilding.')
with ZipFile(src/'col-china-2023.zip') as z:
    aves = [r for r in csv.DictReader(io.StringIO(z.read('taxon.txt').decode()), delimiter='\t') if r['class']=='Aves']
    (ROOT/'source-notices/col-china-2023-eml.xml').write_bytes(z.read('eml.xml'))
with ZipFile(src/'ioc-gbif-15.2.zip') as z:
    usages = list(csv.DictReader(io.StringIO(z.read('NameUsage.tsv').decode()), delimiter='\t'))
    vernaculars = list(csv.DictReader(io.StringIO(z.read('VernacularName.tsv').decode()), delimiter='\t'))
    (ROOT/'source-notices/ioc-15.2-metadata.yaml').write_bytes(z.read('metadata.yaml'))
usage_by_id = {r['col:ID']: r for r in usages}
names = defaultdict(lambda: defaultdict(list))
for r in vernaculars: names[r['col:taxonID']][r['col:language']].append(norm(r['col:name']))
ioc = {}
for r in usages:
    if r['col:rank']!='species': continue
    g=usage_by_id[r['col:parentID']]; f=usage_by_id[g['col:parentID']]
    ioc[norm(r['col:scientificName'])] = {'scientific':norm(r['col:scientificName']), 'english':names[r['col:ID']]['eng'][0], 'chinese':names[r['col:ID']]['zho'], 'family':f['col:scientificName']}
hist = {}
wb=openpyxl.load_workbook(src/'ioc-13.1-multilingual.xlsx',read_only=True,data_only=True)
for r in list(wb.worksheets[0].values)[1:]:
    if r[3]: hist[norm(r[3])]={'scientific':norm(r[3]),'english':norm(r[4]),'chinese':[norm(r[6])] if r[6] else [],'family':r[2]}

species=[r for r in aves if r['taxonomicStatus']=='Accepted' and re.fullmatch(r'[A-Z][a-z]+ [a-z][a-z-]+',r['scientificName'])]
canonical={r['scientificName'] for r in species}
synonyms=defaultdict(list)
for r in aves:
    if r['taxonomicStatus']=='Synonym': synonyms[r['acceptedNameUsageID']].append(r)
alias_owners=defaultdict(set)
for b in species:
    for r in synonyms[b['taxonID']]: alias_owners[r['scientificName']].add(b['taxonID'])

# Names below are explicit genus combinations found in IOC. They do not assert
# equivalent taxon concepts, so the app flags every such crosswalk for review.
combination_candidates={
    'Garrulax gularis':'Pterorhinus gularis',
    'Amaurornis cinerea':'Poliolimnas cinereus',
    'Sylvia nana':'Curruca nana',
    'Garrulax owstoni':'Pterorhinus owstoni',
    'Sylvia minula':'Curruca minula',
    'Garrulax courtoisi':'Pterorhinus courtoisi',
    'Jabouilleia danjoui':'Napothera danjoui',
    'Psilopogon asiatica':'Psilopogon asiaticus',
}
# CAS vernaculars are already Simplified, except the traditional variant 鵰.
simplifications={'鵰':'雕'}
# Orthographic, syllable-by-syllable dictionary readings, not tone-sandhi audio.
# These override surname/colloquial defaults in a general-purpose dictionary.
readings={'燕':'yàn','雀':'què','长':'cháng','冠':'guān','藏':'zàng','颈':'jǐng','颏':'kē','尾':'wěi','绿':'lǜ','蒙':'měng','翘':'qiào','扁':'biǎn','薄':'bó','血':'xuè','伯':'bó','氏':'shì','佛':'fó','恶':'è','咬':'yǎo','爪':'zhǎo','角':'jiǎo','杓':'biāo'}
load_single_dict({ord(k):v for k,v in readings.items()})
birds=[]; rejected=[]; unmatched=[]
for b in sorted(species,key=lambda r:(r['order'],r['family'],r['scientificName'])):
    scientific=b['scientificName']; raw_zh=norm(b['vernacularName'])
    zh=''.join(simplifications.get(c,c) for c in raw_zh)
    match=ioc.get(scientific); method='IOC 15.2 exact scientific name'; english_source='ioc-15.2'; review=False
    if not match and scientific in hist:
        match=hist[scientific];method='IOC 13.1 exact historical name';english_source='ioc-13.1';review=True
    if not match:
        candidate=combination_candidates.get(scientific)
        if candidate:
            match=ioc.get(candidate) or hist.get(candidate)
            if match:
                english_source='ioc-15.2' if candidate in ioc else 'ioc-13.1'; method='Explicit genus-combination candidate; concept unreviewed';review=True
    if not match:
        # Used only to attach a labelled English-name candidate, never to merge
        # source taxa or to copy schedules. Ambiguous or unrelated matches stay empty.
        candidates=[r for r in ioc.values() if raw_zh in r['chinese'] and r['family']==b['family']]
        if len(candidates)==1:
            match=candidates[0];method='Unique Chinese name + family candidate; concept unreviewed';review=True
    if not match:
        candidates=[r for r in hist.values() if raw_zh in r['chinese'] and r['family']==b['family']]
        if len(candidates)==1:
            match=candidates[0];method='Historical Chinese name + family candidate; concept unreviewed';review=True;english_source='ioc-13.1'
    aliases=[]
    if raw_zh!=zh: aliases.append(raw_zh)
    for r in synonyms[b['taxonID']]:
        name=norm(r['scientificName'])
        reasons=[]
        if r['family']!=b['family']:reasons.append('different family')
        if name in canonical and name!=scientific: reasons.append('another accepted species')
        if len(alias_owners[name])>1:reasons.append('multiple target species')
        if not re.fullmatch(r'[A-Z][a-z]+ [a-z][a-z-]+',name):continue
        if reasons:rejected.append({'sourceId':b['taxonID'],'scientific':scientific,'alias':name,'reason':'; '.join(reasons)})
        elif name!=scientific:aliases.append(name)
    # Candidate scientific names remain provenance, not automatic aliases.
    # This avoids collisions created by splits/lumps in a different taxonomy.
    py=' '.join(lazy_pinyin(zh,style=Style.TONE))
    row={'id':'colcn:'+b['taxonID'],'sourceId':b['taxonID'],'chinese':zh,'pinyin':py,'english':match['english'] if match else '', 'scientific':scientific,'order':b['order'],'family':b['family'],'aliases':sorted(set(aliases)), 'taxonomyReview':review or not match,'pinyinStatus':'dictionary-generated; not expert reviewed','nameMatch':method if match else 'unresolved; excluded from study','englishSource':english_source if match else '', 'matchedScientific':match['scientific'] if match else ''}
    if not match: unmatched.append({'scientific':scientific,'chinese':zh})
    birds.append(row)
# Reviewed name corrections. Each one keeps the card ID (and so the learner's progress)
# and fixes names that belonged to another bird: see source-notices/name-corrections-2026-11.json.
# Every stated AviList name is checked against the pinned AviList v2026 file.
avilist={}
wb=openpyxl.load_workbook(src/'avilist-v2026-extended.xlsx',read_only=True,data_only=True)
rows=wb['AviList v2026'].iter_rows(values_only=True); header=[str(h) for h in next(rows)]
for r in rows:
    r=dict(zip(header,r))
    if r['RANK']=='species': avilist[norm(r['SCIENTIFIC NAME'])]={'english':norm(r['ENGLISH NAME: AVILIST']),'avibaseId':r['AVIBASE ID']}
correction_doc=json.loads(CORRECTIONS.read_text())
corrections=correction_doc['corrections']
by_id={b['id']:b for b in birds}; pruned_aliases=0
for c in corrections:
    b=by_id[c['id']]; was,now,ev=c['was'],c['now'],c['evidence']['avilist']
    if {k:b[k] for k in was}!=was: raise ValueError(f"Correction {c['id']} no longer matches the source record {was}")
    a=avilist.get(ev['scientific'])
    if not a or a['english']!=ev['english'] or a['avibaseId']!=ev['avibaseId'] or ev['scientific']!=now['scientific']:
        raise ValueError(f"Correction {c['id']}: {ev['scientific']} does not match AviList v2026")
    if c['kind']!='chinese' and now['english']!=a['english']: raise ValueError(f"Correction {c['id']}: English is not the AviList name")
    if now['scientific']!=b['scientific']:
        # The previous name stays as an alias (required for identity-safe updates); aliases that are now
        # separate AviList species are dropped so that search does not lead to the wrong bird.
        kept=[x for x in b['aliases'] if x not in avilist or x==b['scientific']]
        pruned_aliases+=len(b['aliases'])-len(kept)
        b['aliases']=sorted((set(kept)|{b['scientific']})-{now['scientific']})
    if c.get('ebirdChinaPopulation'):
        b['aliases']=sorted(set(b['aliases'])|{c['ebirdChinaPopulation']})
    b.update(chinese=now['chinese'],scientific=now['scientific'],english=now['english'],
             pinyin=' '.join(lazy_pinyin(now['chinese'],style=Style.TONE)),matchedScientific=now['scientific'],
             nameMatch='Reviewed correction: AviList v2026 species; Chinese per AviList Simplified, CBR v12.0 and IOC 15.2',
             englishSource='avilist-v2026' if c['kind']!='chinese' else b['englishSource'],
             taxonomyReview=b['taxonomyReview'] or c['kind']=='concept')
# Current AviList genus combinations for cards whose names are otherwise unchanged.
for x in correction_doc.get('aliasAdditions',[]):
    b=by_id[x['id']]; a=avilist.get(x['alias'])
    if b['scientific']!=x['scientific'] or not a or a['avibaseId']!=x['avibaseId']:
        raise ValueError(f"Alias addition {x['id']} does not match the record or AviList v2026")
    b['aliases']=sorted(set(b['aliases'])|{x['alias']})
names_in_use={b['scientific'] for b in birds}
for b in birds:
    kept=[x for x in b['aliases'] if x not in names_in_use]
    pruned_aliases+=len(b['aliases'])-len(kept); b['aliases']=kept
if len(names_in_use)!=len(birds) or len({b['chinese'] for b in birds})!=len(birds): raise ValueError('Corrections created a duplicate name')
report={'sourceSpecies':len(species),'bundledSpecies':len(birds),'sourceCoverageComplete':len(species)==len(birds),'studyReady':sum(bool(b['english']) for b in birds),'chinese':sum(bool(b['chinese']) for b in birds),'pinyin':sum(bool(b['pinyin']) for b in birds),'english':sum(bool(b['english']) for b in birds),'taxonomyReview':sum(b['taxonomyReview'] for b in birds),'excludedSubspecies':sum(r['taxonomicStatus']=='Accepted' for r in aves)-len(species),'sourceSynonymRows':sum(r['taxonomicStatus']=='Synonym' for r in aves),'rejectedAliasCount':len(rejected),'unmatchedEnglish':unmatched,'nameMatchCounts':dict(Counter(b['nameMatch'] for b in birds)),'rejectedAliases':rejected,'allChinaCurrentComplete':False,'nameCorrections':{'total':len(corrections),'byKind':dict(Counter(c['kind'] for c in corrections)),'aliasAdditions':len(correction_doc.get('aliasAdditions',[])),'prunedAliases':pruned_aliases,'source':'source-notices/name-corrections-2026-11.json'}}
meta={'title':'Catalogue of Life China 2023 · bird species','version':VERSION,'taxonomy':'CoL China 2023 v1.1 (source concepts retained)','scope':'China as defined by the CAS source; no independent border, occurrence-status, or Taiwan completeness audit','license':'CC BY-NC 4.0 (CAS baseline); CC BY 4.0 (IOC 15.2 names; AviList v2026 corrections); CC BY 3.0 (IOC 13.1 historical names)','sourceUrl':'https://doi.org/10.15468/ae6ush','retrieved':'2026-11-18','coverage':'All 1,445 accepted species binomials in the downloaded CAS archive. Partial against current China checklists; not a complete 2026 inventory. '+f'{len(corrections)} cards whose names belonged to another bird were corrected against AviList v2026, keeping their IDs.','report':{k:v for k,v in report.items() if k not in ['unmatchedEnglish','rejectedAliases']},'sources':[{'id':'colcn-2023','title':'The Biodiversity Committee of CAS, Xu Z (2024). Catalogue of Life China 2023 Annual Checklist. Version 1.1.','url':'https://doi.org/10.15468/ae6ush','download':'https://www.gbifchina.org.cn/archive.do?r=chinacol2023','license':'CC BY-NC 4.0','sha256':digest(src/'col-china-2023.zip')},{'id':'ioc-15.2','title':'Gill F, Donsker D & Rasmussen P (eds). 2026. IOC World Bird List v15.2. GBIF/CoLDP distribution.','url':'https://www.gbif.org/dataset/c696e5ee-9088-4d11-bdae-ab88daffab78','download':'https://hosted-datasets.gbif.org/datasets/ioc.zip','license':'CC BY 4.0','sha256':digest(src/'ioc-gbif-15.2.zip')},{'id':'ioc-13.1','title':'Gill F, Donsker D & Rasmussen P (eds). 2023. IOC World Bird List v13.1, multilingual version. Historical English-name fallback.','url':'https://doi.org/10.14344/IOC.ML.13.1','download':'https://worldbirdnames.org/Multiling%20IOC%2013.1_c.xlsx','license':'CC BY 3.0','sha256':digest(src/'ioc-13.1-multilingual.xlsx')},{'id':'avilist-v2026','title':'AviList Core Team. 2026. AviList: The Global Avian Checklist, v2026 (extended version, 20 Oct 2026). Used for reviewed name corrections only.','url':'https://doi.org/10.2173/avilist.v2026','download':'https://www.avilist.org/checklist/v2026/','license':'CC BY 4.0','sha256':digest(src/'avilist-v2026-extended.xlsx')}]}
(ROOT/'data/birds.json').write_text(json.dumps({'schemaVersion':1,'meta':meta,'birds':birds},ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/coverage-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
with (ROOT/'source-notices/cas-aves-raw.tsv').open('w') as f:
    writer=csv.DictWriter(f,fieldnames=list(aves[0]),delimiter='\t');writer.writeheader();writer.writerows(aves)
print(json.dumps({k:v for k,v in report.items() if k not in ['rejectedAliases']},ensure_ascii=False,indent=2))
