#!/usr/bin/env python3
"""Build data/thai-names.json: Thai bird names for the cards whose species is on the Thai checklist.

Input (pinned by SHA-256, not redistributed; see source-notices/thai-names/README.md):
    source-notices/thai-names/thai-bird-checklist-2025-02.xlsx
    ("Revised Checklist of Thai birds February 2025", sheet "Listing")

Matching, in order:
  1. scientific   the card's scientific name equals the checklist's scientific name;
  2. english      the card's English name equals exactly one checklist English name (the checklist's
                  own name or the IOC / HBW-BirdLife / Clements / Howard & Moore names it lists).
                  Where the epithet differs too, the pair is a reviewed synonym, spelling variant or
                  split listed in ENGLISH_REVIEWED, so a new mismatch fails the build;
  3. reviewed     three cards matched by hand (REVIEWED_BY_CHINESE).
Requires openpyxl==3.1.5.
"""
import hashlib
import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source-notices/thai-names/thai-bird-checklist-2025-02.xlsx'
PINNED = 'ab09607f5698d9549f3c7e549b381f56ab6b8a5b37f4cc0bfacde74c635d9b5e'
ENGLISH_COLUMNS = ['IOC (v 14.2)', 'HBW and BirdLife (v 6)', 'Clements (v 2023)', 'Howard & Moore 4.1']
# English-name matches whose epithet also differs, checked one by one (card Chinese name -> checklist name).
ENGLISH_REVIEWED = {
    '凤头鹰雕': ('Nisaetus limnaeetus', 'AviList keeps Changeable Hawk-Eagle as one species; the Thai checklist uses the split name for the birds of Thailand and China.'),
    '鸿雁': ('Anser cygnoides', 'Spelling variant of the same species.'),
    '大鹃鵙': ('Coracina macei', 'Same English name; the checklist uses the older scientific name for this cuckooshrike.'),
    '赤红山椒鸟': ('Pericrocotus speciosus', 'AviList keeps Scarlet Minivet as one species; the Thai checklist uses the split name for the birds of Thailand and China.'),
    '鸦嘴卷尾': ('Dicrurus annectens', 'Spelling variant of the same species.'),
    '锈胸蓝姬鹟': ('Ficedula erithacus', 'Same species under its other scientific name.'),
    '白腹短翅鸲': ('Hodgsonius phaenicuroides', 'Same species; genus and spelling differ.'),
    '灰岩鹪鹛': ('Gypsophila annamensis', 'Annam Limestone Babbler; AviList also uses Gypsophila annamensis.'),
    '云南白斑尾柳莺': ('Phylloscopus intensior', "Davison's Leaf Warbler; AviList also uses Phylloscopus intensior."),
    '白眶鹟莺': ('Phylloscopus intermedius', 'White-spectacled Warbler; AviList also uses Phylloscopus intermedius.'),
    '黑头鹎': ('Brachypodius melanocephalos', 'Same species under its older valid name.'),
    '黑冠黄鹎': ('Rubigula flaviventris', 'Black-crested Bulbul; AviList also uses Rubigula flaviventris.'),
}
# Matched by hand: card Chinese name -> (checklist scientific name, reason).
REVIEWED_BY_CHINESE = {
    '紫水鸡': ('Porphyrio poliocephalus', 'AviList treats the swamphens as one species, Purple Swamphen; the Thai checklist names the birds of Thailand and southern China Grey-headed Swamphen.'),
    '蓝枕花蜜鸟': ('Kurochkinegramma hypogrammicum', 'Same species; the checklist uses the newer genus and the English name Purple-naped Sunbird.'),
    '绿鹭': ('Butorides striata', 'The checklist keeps Striated Heron in the wide sense; the birds of Thailand and China are the Old World Little Heron, Butorides atricapilla.'),
}
# Thai names supplied by the project owner for checklist species listed without one.
SUPPLIED_THAI = {
    'Turdus hortulorum': ('นกเดินดงหลังเทา', 'Thai name supplied by the project owner (19 Nov 2026); the checklist lists Grey-backed Thrush without a Thai name.'),
}
BINOMIAL = re.compile(r'\b[A-Z][a-z]+ [a-z]{3,}\b')


def clean(value):
    return ' '.join(str(value or '').replace('\xa0', ' ').replace('ӧ', 'ö').split())


def english_key(value):
    return re.sub(r'[^a-z]', '', clean(value).lower().replace('grey', 'gray'))


def stem(epithet):
    return re.sub(r'(us|um|a|is|e|os|on|i)$', '', epithet)


def main():
    data = SOURCE.read_bytes()
    if hashlib.sha256(data).hexdigest() != PINNED:
        raise ValueError(f'Pinned source changed: {SOURCE.name}')
    rows = list(openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)['Listing'].iter_rows(values_only=True))
    if clean(rows[0][0]) != 'Revised Checklist of Thai birds February 2025':
        raise ValueError('Unexpected checklist title')
    header = [clean(h) or f'column{i}' for i, h in enumerate(rows[4])]
    checklist = []
    for row in rows[5:]:
        record = dict(zip(header, row))
        if not clean(record.get('Scientific name')):
            continue
        record['sci'] = clean(record['Scientific name'])
        record['thai'] = clean(record.get('Thai name'))
        record['supplied'] = None
        if not record['thai'] and record['sci'] in SUPPLIED_THAI:
            record['thai'], record['supplied'] = SUPPLIED_THAI[record['sci']]
        record['english'] = clean(record.get('Common name'))
        record['englishKeys'] = {english_key(record['english'])} | {
            english_key(record[c]) for c in ENGLISH_COLUMNS if clean(record.get(c)) and not BINOMIAL.search(clean(record[c]))}
        checklist.append(record)
    by_sci = {r['sci']: r for r in checklist}
    if len(by_sci) != len(checklist):
        raise ValueError('Duplicate scientific names in the checklist')
    by_english = {}
    for r in checklist:
        for key in r['englishKeys']:
            by_english.setdefault(key, []).append(r)

    birds = json.loads((ROOT / 'data/birds.json').read_text())['birds']
    names, english_epithet_changes, reviewed_seen = {}, {}, set()
    for b in birds:
        found, method, note = None, None, None
        if b['scientific'] in by_sci:
            found, method = by_sci[b['scientific']], 'scientific'
        elif b['chinese'] in REVIEWED_BY_CHINESE:
            sci, note = REVIEWED_BY_CHINESE[b['chinese']]
            found, method = by_sci[sci], 'reviewed'
            reviewed_seen.add(b['chinese'])
        elif b['english'] and len(by_english.get(english_key(b['english']), [])) == 1:
            found, method = by_english[english_key(b['english'])][0], 'english'
            if stem(found['sci'].split()[1]) != stem(b['scientific'].split()[1]):
                english_epithet_changes[b['chinese']] = found['sci']
                note = ENGLISH_REVIEWED.get(b['chinese'], (None, None))[1]
        if not found or not found['thai']:
            continue
        entry = {'thai': found['thai'], 'checklistScientific': found['sci'], 'checklistEnglish': found['english'], 'match': method}
        note = '; '.join(n for n in (note, found['supplied']) if n)
        if note:
            entry['note'] = note
        names[b['id']] = entry
    expected = {k: v[0] for k, v in ENGLISH_REVIEWED.items()}
    if english_epithet_changes != expected:
        raise ValueError(f'English matches with a different epithet changed: {english_epithet_changes} != {expected}')
    if {e['checklistScientific'] for e in names.values() if 'supplied by the project owner' in e.get('note', '')} != set(SUPPLIED_THAI):
        raise ValueError('A supplied Thai name was not used')
    if reviewed_seen != set(REVIEWED_BY_CHINESE):
        raise ValueError(f'Reviewed cards missing: {set(REVIEWED_BY_CHINESE) - reviewed_seen}')
    used = {}
    for card_id, entry in names.items():
        if entry['checklistScientific'] in used:
            raise ValueError(f"Checklist species used twice: {entry['checklistScientific']}")
        used[entry['checklistScientific']] = card_id
    counts = {m: sum(1 for e in names.values() if e['match'] == m) for m in ('scientific', 'english', 'reviewed')}
    doc = {
        'schemaVersion': 1,
        'meta': {
            'version': 'thai-names-2026-11-19-v2',
            'title': 'Thai bird names for cards on the Thai checklist',
            'source': {
                'title': 'Revised Checklist of Thai birds, February 2025 (sheet “Listing”)',
                'workbookAuthor': 'Wachara Sanguansombat (workbook metadata)',
                'sha256': PINNED,
                'license': 'No licence statement in the workbook. Only the Thai names of matched species are used, with attribution; the workbook is not redistributed.',
            },
            'cardCount': len(names),
            'checklistSpecies': len(checklist),
            'checklistSpeciesWithThaiName': sum(1 for r in checklist if r['thai'] and not r['supplied']),
            'suppliedThaiNames': sorted(SUPPLIED_THAI),
            'counts': counts,
        },
        'names': dict(sorted(names.items())),
    }
    target = ROOT / 'data/thai-names.json'
    target.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{target.name}: {len(names)} cards with Thai names {counts}; checklist {len(checklist)} species')


if __name__ == '__main__':
    main()
