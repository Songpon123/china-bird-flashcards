#!/usr/bin/env python3
"""Build outbound eBird links from the retained reference identifiers, offline.

These are reading references, not taxonomic concept migrations. Common-name
candidates remain explicitly labelled, and unmatched names get no guessed code.
"""
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
normal = lambda value: re.sub(r'[^a-z0-9]', '', value.lower())


def main():
    source = ROOT / 'source-notices/ebird-reference-identifiers.json'
    birds_path = ROOT / 'data/birds.json'
    retained = json.loads(source.read_text())
    birds = json.loads(birds_path.read_text())['birds']
    by_scientific, by_common = {}, {}
    for row in retained['identifiers']:
        if row['category'] != 'species' or not re.fullmatch(r'[a-z0-9]{2,20}', row['speciesCode']):
            raise ValueError('Invalid eBird reference identifier')
        by_scientific.setdefault(row['sciName'], []).append(row)
        by_common.setdefault(normal(row['comName']), []).append(row)
    links, unmatched = {}, []
    counts = {'scientific':0, 'alias':0, 'common-name':0}
    for bird in birds:
        candidates = by_scientific.get(bird['scientific'], [])
        method = 'scientific'
        if not candidates:
            candidates = list({r['speciesCode']:r for a in bird['aliases'] for r in by_scientific.get(a, [])}.values())
            method = 'alias'
        if not candidates and bird['english'] and retained['commonNameCounts'].get(normal(bird['english'])) == 1:
            candidates = by_common.get(normal(bird['english']), [])
            method = 'common-name'
        if len(candidates) != 1:
            unmatched.append(bird['scientific'])
            continue
        row = candidates[0]
        links[bird['scientific']] = {
            'code':row['speciesCode'], 'scientific':row['sciName'],
            'english':row['comName'], 'sourceEnglish':bird['english'], 'method':method,
        }
        counts[method] += 1
    out = {
        'schemaVersion':1,
        'meta':{
            'version':'ebird-reference-2026-11-18-v1', 'source':retained['source'],
            'matches':counts, 'unmatched':len(unmatched), 'sourceSpecies':len(birds),
            'limits':'Outbound reading references only, not equivalent taxon concepts. Exact common-name candidates are labelled separately. No fuzzy names, guessed species codes, or automatic taxonomy changes. Unmatched names open eBird Explore for manual lookup.',
            'inputHashes':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [source, birds_path]},
        },
        'byScientific':links, 'unmatched':unmatched,
    }
    (ROOT / 'data/ebird-links.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
    print(f'eBird links: {counts}; {len(unmatched)} manual lookups')


if __name__ == '__main__':
    main()
