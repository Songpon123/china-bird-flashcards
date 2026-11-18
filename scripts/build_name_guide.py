#!/usr/bin/env python3
"""Build the name guide offline from a retained, attributed CC-CEDICT subset.

To refresh/extract from an official download, pass --cedict /path/to/cedict.txt.gz.
The source is never fetched implicitly; inspect its license and metadata first.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
NOTICE = ROOT / 'source-notices/name-guide'
PATTERN = re.compile(r'^(\S+) (\S+) \[(.+?)\] /(.+)/$')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def tone_marks(text):
    def syllable(m):
        body, tone = m.groups()
        body = body.replace('u:', 'ü').replace('U:', 'Ü').replace('v', 'ü')
        if tone in '05':
            return body
        lower = body.lower()
        index = next((lower.index(v) for v in ['a', 'e'] if v in lower), None)
        if index is None:
            index = lower.find('ou') if 'ou' in lower else next((i for i in range(len(body)-1, -1, -1) if lower[i] in 'iouü'), None)
        if index is None:
            return body
        vowel = body[index]
        marks = {'a':'āáǎà','e':'ēéěè','i':'īíǐì','o':'ōóǒò','u':'ūúǔù','ü':'ǖǘǚǜ'}
        marked = marks[vowel.lower()][int(tone)-1]
        return body[:index] + (marked.upper() if vowel.isupper() else marked) + body[index+1:]
    return re.sub(r'([A-Za-züÜ:]+)([0-5])', syllable, text)


def display_definition(text):
    # CC-CEDICT references are plain text, never executable HTML.
    text = re.sub(r'([^\s;(),/\[\]]+)\|([^\s;(),/\[\]]+)', r'\2', text)
    return tone_marks(text).replace('[', ' (').replace(']', ')')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cedict', type=Path)
    args = parser.parse_args()
    editorial = json.loads((NOTICE / 'editorial.json').read_text())
    birds = json.loads((ROOT / 'data/birds.json').read_text())['birds']
    groups = json.loads((ROOT / 'data/groups.json').read_text())['cards']
    names = sorted(set(b['chinese'] for b in birds + groups))
    chars = set(''.join(names))
    wanted = chars | {name[i:j] for name in names for i in range(len(name)) for j in range(i+2, len(name)+1)} | set(editorial['extraWords'])
    snapshot = NOTICE / 'cc-cedict-subset.txt'
    manifest_file = NOTICE / 'manifest.json'
    if args.cedict:
        original = args.cedict.read_bytes()
        raw = gzip.decompress(original).decode('utf-8') if args.cedict.suffix == '.gz' else original.decode('utf-8')
        lines = [line for line in raw.splitlines() if line.startswith('#') or (m := PATTERN.match(line)) and m[2] in wanted]
        snapshot.write_text('\n'.join(lines) + '\n', encoding='utf-8')
        manifest = {
            'downloadUrl':'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz',
            'retrieved':'2026-11-18', 'downloadSHA256':digest(original),
            'sourceDate':next((line.split('=', 1)[1] for line in raw.splitlines() if line.startswith('#! date=')), 'unknown'),
            'subsetSHA256':digest(snapshot.read_bytes()),
            'extraction':'Unmodified source lines for individual name characters and exact substrings of the 1,445 species / 33 term names, plus explicitly listed extra compounds. Original header retained; no unrelated entries bundled.',
            'license':'CC BY-SA 4.0', 'attribution':'MDBG and CC-CEDICT contributors; CEDICT copyright 1997, 1998 Paul Andrew Denisowski',
        }
        manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    manifest = json.loads(manifest_file.read_text())
    if digest(snapshot.read_bytes()) != manifest['subsetSHA256']:
        raise ValueError('Dictionary subset checksum mismatch')
    entries = {}
    for line in snapshot.read_text().splitlines():
        m = PATTERN.match(line)
        if not m:
            continue
        traditional, simplified, pinyin, definitions = m.groups()
        entries.setdefault(simplified, []).append({
            'traditional':traditional, 'pinyin':tone_marks(pinyin),
            'definitions':[display_definition(d) for d in definitions.split('/')],
            'source':'cedict',
        })
    characters = {c:{'entries':entries.get(c, []), 'thai':editorial['thaiGlosses'].get(c, '')} for c in sorted(chars)}
    for c, entry in editorial['characterOverrides'].items():
        characters[c] = {'entries':[{'traditional':c, **{k:v for k,v in entry.items() if k != 'thai'}}], 'thai':entry['thai']}
    for c, record in characters.items():
        record['learningEnglish'] = editorial.get('englishGlosses', {}).get(c, '')
    missing = [c for c, record in characters.items() if not record['entries']]
    if missing:
        raise ValueError(f'Uncovered characters: {missing}')
    compounds = {w:{'entries':rows, 'thai':editorial['compoundGlosses'].get(w, {}).get('thai', '')} for w, rows in entries.items() if len(w)>1}
    for w, gloss in editorial['compoundGlosses'].items():
        compounds.setdefault(w, {'entries':[], 'thai':''})['thai'] = gloss['thai']
    out = {
        'schemaVersion':1,
        'meta':{
            'version':editorial['version'], 'characterCount':len(characters),
            'dictionaryCharacters':sum(any(e['source']=='cedict' for e in c['entries']) for c in characters.values()),
            'thaiCharacterCount':sum(bool(c['thai']) for c in characters.values()),
            'speciesNameCount':len(birds), 'termNameCount':len(groups),
            'dictionarySnapshot':manifest,
            'sources':editorial['sources'],
            'coverage':'All distinct characters in the bundled 1,445 species names and 33 vocabulary terms have a dictionary or explicitly sourced modern-usage entry. Thai translations cover a selected subset; English dictionary senses cover all characters. Naming stories are selected, not exhaustive.',
            'limits':'General dictionary senses and word segmentation are learning aids, not a taxonomic name authority or a verified historical etymology. Context readings come from the bird/term record and remain unreviewed. Imported names can contain characters not covered by this snapshot.',
            'licenses':{'dictionaryAndThaiGlosses':'CC BY-SA 4.0', 'casModernUsage':'CC BY-NC 4.0', 'authoredNotes':'MIT (brief factual paraphrases with individual citations; original linked pages retain their own rights)'},
            'inputHashes':{str(p.relative_to(ROOT)):digest(p.read_bytes()) for p in [snapshot, NOTICE / 'editorial.json', ROOT / 'data/birds.json', ROOT / 'data/groups.json']},
        },
        'characters':characters, 'compounds':compounds,
        'unitWords':sorted(editorial['compoundGlosses'], key=lambda w:(-len(w), w)),
        'notes':editorial['notes'],
    }
    target = ROOT / 'data/name-guide.json'
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
    print(f'{target.name}: {len(characters)} characters, {out["meta"]["thaiCharacterCount"]} Thai glosses, {len(compounds)} compounds, {len(out["notes"])} notes')


if __name__ == '__main__':
    main()
