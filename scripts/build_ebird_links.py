#!/usr/bin/env python3
"""Build outbound eBird links from the retained reference identifiers, offline.

These are reading references, not taxonomic concept migrations. Common-name
candidates remain explicitly labelled, and unmatched names get no guessed code.
"""
import hashlib
import json
from pathlib import Path
import re

from ebird_reference import EBirdReference

ROOT = Path(__file__).resolve().parent.parent
normal = lambda value: re.sub(r'[^a-z0-9]', '', value.lower())


def main():
    ref = EBirdReference(ROOT)
    source, retained = ref.path, ref.retained
    birds_path = ROOT / 'data/birds.json'
    birds = json.loads(birds_path.read_text())['birds']
    links, unmatched = {}, []
    counts = {'scientific':0, 'alias':0, 'common-name':0}
    for bird in birds:
        row, method = ref.match(bird)
        if not row:
            unmatched.append(bird['scientific'])
            continue
        links[bird['scientific']] = {
            'code':row['speciesCode'], 'scientific':row['sciName'],
            'english':row['comName'], 'sourceEnglish':bird['english'], 'method':method,
        }
        counts[method] += 1
    out = {
        'schemaVersion':1,
        'meta':{
            'version':'ebird-reference-2026-11-19-v3', 'source':retained['source'],
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
