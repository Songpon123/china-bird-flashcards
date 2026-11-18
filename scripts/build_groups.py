"""Rebuild the pinned family/group vocabulary from included CC0/CC BY sources. No network.
Requires the same build-only packages as build_dataset.py.
"""
import json,csv,io,hashlib
from pathlib import Path
from zipfile import ZipFile
from pypinyin import lazy_pinyin,Style,load_single_dict
p=Path(__file__).resolve().parents[1]
d=json.loads((p/'data/birds.json').read_text())
pick='Accipitridae Columbidae Anatidae Falconidae Strigidae Tytonidae Picidae Alcedinidae Ardeidae Ciconiidae Gruidae Hirundinidae Apodidae Passeridae Corvidae Phasianidae Scolopacidae Charadriidae Laridae Pycnonotidae Paridae Fringillidae Emberizidae Motacillidae Meropidae Upupidae'.split()
assert hashlib.sha256((p/'source-notices/family-labels-wikidata.json').read_bytes()).hexdigest()=='c528dc8f5ab3bda206209fc5ac53a410e1da30e40366cd07fd21e7606e9c339e', 'Pinned source changed: family-labels-wikidata.json'
assert hashlib.sha256((p/'source-notices/ioc-gbif-15.2.zip').read_bytes()).hexdigest()=='982e729f1abf8e2e1b36757f27e521f373bd8ce1e9a13b2fc0c9a09fad8d1c9b', 'Pinned source changed: ioc-gbif-15.2.zip'
source=json.loads((p/'source-notices/family-labels-wikidata.json').read_text())['families']
assert set(source)==set(pick)
with ZipFile(p/'source-notices/ioc-gbif-15.2.zip') as z:
 usages=list(csv.DictReader(io.StringIO(z.read('NameUsage.tsv').decode()),delimiter='\t'));vern=list(csv.DictReader(io.StringIO(z.read('VernacularName.tsv').decode()),delimiter='\t'))
 ids={r['col:ID']:r['col:scientificName'] for r in usages if r['col:rank']=='family'}
 english={ids[r['col:taxonID']]:r['col:name'] for r in vern if r['col:taxonID'] in ids and r['col:language']=='eng'}
load_single_dict({ord('燕'):'yàn',ord('雀'):'què',ord('长'):'cháng',ord('鹡'):'jí'})
def py(zh):return ' '.join(lazy_pinyin(zh,style=Style.TONE))
thai=dict(zip(pick,['วงศ์เหยี่ยวและอินทรี','วงศ์นกเขาและนกพิราบ','วงศ์เป็ด ห่าน และหงส์','วงศ์เหยี่ยวปีกแหลม','วงศ์นกเค้าแมว','วงศ์นกแสก','วงศ์นกหัวขวาน','วงศ์นกกระเต็น','วงศ์นกยาง','วงศ์นกกระสา','วงศ์นกกระเรียน','วงศ์นกนางแอ่น','วงศ์นกแอ่น','วงศ์นกกระจอก','วงศ์นกกา','วงศ์ไก่ฟ้าและนกกระทา','วงศ์นกชายเลน Scolopacidae','วงศ์นกหัวโต','วงศ์นกนางนวลและนกนางนวลแกลบ','วงศ์นกปรอด','วงศ์นกติ๊ด','วงศ์นกจาบปีกอ่อน','วงศ์นกจาบปีกอ่อนเล็ก','วงศ์นกเด้าลมและนกเด้าดิน','วงศ์นกจาบคา','วงศ์นกกะรางหัวขวาน']))
common=[
 ('hawks','鹰类','Hawks, eagles & allies','กลุ่มเหยี่ยวและอินทรี',['Accipitridae','Pandionidae'],[],[], 'Includes the source families Accipitridae and Pandionidae; excludes falcons and owls. Includes allied kites and vultures within Accipitridae.'),
 ('pigeons-doves','鸠鸽类','Doves & pigeons','กลุ่มนกเขาและนกพิราบ',['Columbidae'],[],[],'Dove and pigeon are overlapping common-name categories in one family, Columbidae; they are not two separate families.'),
 ('ducks','鸭类','Ducks','กลุ่มเป็ด',['Anatidae'],['Aix','Anas','Aythya','Bucephala','Clangula','Dendrocygna','Histrionicus','Mareca','Marmaronetta','Melanitta','Mergellus','Mergus','Netta','Nettapus','Oxyura','Polysticta','Sarkidiornis','Sibirionetta','Spatula','Tadorna'],[],'Learning group using an explicit list of duck genera in the CAS snapshot. Geese (Anser, Branta) and swans (Cygnus) are separate. Not a formal taxonomic rank.'),
 ('geese','雁类','Geese','กลุ่มห่านป่า',['Anatidae'],['Anser','Branta'],[],'Wild geese in the source genera Anser and Branta. Domestic goose vocabulary (鹅, é) is different; domestic forms are not added as recorded wild species.'),
 ('swans','天鹅','Swans','กลุ่มหงส์',['Anatidae'],['Cygnus'],[],'Source genus Cygnus. A common-name learning group within Anatidae.'),
 ('owls','鸮类','Owls','กลุ่มนกเค้าแมวและนกแสก',['Strigidae','Tytonidae'],[],[],'Includes the source families Strigidae and Tytonidae.'),
 ('woodpeckers','啄木鸟','Woodpeckers','กลุ่มนกหัวขวาน',['Picidae'],[],[],'Includes source family Picidae, including its allied piculets and wrynecks.'),
]
cards=[]
for slug,zh,en,th,families,include,exclude,scope in common:
 cards.append({'id':'group:'+slug,'chinese':zh,'pinyin':py(zh),'english':en,'scientific':'Anatidae (duck genera)' if slug=='ducks' else ', '.join(include) if include else ' + '.join(families),'thai':th,'kind':'group','families':families,'includeGenera':include,'excludeGenera':exclude,'scope':scope,'aliases':[th],'taxonomyReview':False,'pinyinStatus':'dictionary-generated; not expert reviewed','nameMatch':'Authored learning-group definition using CAS source family/genus keys','englishSource':'authored-learning-terms','sourceUrl':'https://doi.org/10.15468/ae6ush'})
for name in pick:
 e=source[name];labels=e['labels'];zh=next(labels[k]['value'] for k in ['zh-hans','zh-cn','zh'] if k in labels)
 assert zh.endswith('科'),(name,zh)
 cards.append({'id':'family:'+name,'chinese':zh,'pinyin':py(zh),'english':english[name],'scientific':name,'thai':thai[name],'kind':'family','families':[name],'includeGenera':[],'excludeGenera':[],'scope':'Family term. Member birds follow the retained CAS 2023 family assignment, not a newly inferred IOC occurrence list.','aliases':[thai[name]],'taxonomyReview':False,'pinyinStatus':'dictionary-generated; not expert reviewed','nameMatch':'Chinese label: exact Wikidata P225 match; English family label: exact IOC 15.2 family name','englishSource':'ioc-15.2','sourceUrl':e['sourceUrl']})
assert all(not any('\u3400'<=c<='\u9fff' for c in r['pinyin']) for r in cards)
out={'schemaVersion':1,'meta':{'title':'Family names and bird groups · ชื่อวงศ์และกลุ่มนก','version':'family-groups-2026-11-18-v1','membershipTaxonomy':d['meta']['taxonomy'],'coverage':'26 selected family terms out of 109 source families, plus 7 informal learning groups. Not all family names translated. No species added.','license':'CC0 1.0 (Wikidata structured labels); CC BY 4.0 (IOC 15.2 English family labels); MIT (authored Thai glosses/group definitions). CAS member records remain CC BY-NC 4.0.','sourceFiles':['source-notices/family-labels-wikidata.json','source-notices/ioc-gbif-15.2.zip'],'pinyinStatus':'Dictionary-generated; not expert reviewed'},'cards':cards}
(p/'data/groups.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for c in cards[:7]:
 members=[b for b in d['birds'] if b['family'].split('(')[0] in c['families'] and (not c['includeGenera'] or b['scientific'].split()[0] in c['includeGenera'])]
 print(c['chinese'],c['pinyin'],len(members))
print('cards',len(cards))
