"""Shared eBird species matching, used by build_dataset.py (English names) and build_ebird_links.py (links).

Order: the card's scientific name; for reviewed corrections where eBird splits a species that AviList
keeps broad, the population recorded in China; the card's aliases; and last an English name that is
unique in the whole eBird taxonomy. Anything else stays unmatched; no fuzzy names or guessed codes.
"""
import json
import re

normal = lambda value: re.sub(r'[^a-z0-9]', '', value.lower())


class EBirdReference:
    def __init__(self, root):
        self.path = root / 'source-notices/ebird-reference-identifiers.json'
        self.retained = json.loads(self.path.read_text())
        self.by_scientific, self.by_common, self.by_code = {}, {}, {}
        for row in self.retained['identifiers']:
            if row['category'] != 'species' or not re.fullmatch(r'[a-z0-9]{2,20}', row['speciesCode']):
                raise ValueError('Invalid eBird reference identifier')
            self.by_scientific.setdefault(row['sciName'], []).append(row)
            self.by_common.setdefault(normal(row['comName']), []).append(row)
            self.by_code[row['speciesCode']] = row
        manual_path = root / 'source-notices/english-names-manual.json'
        self.manual = {x['id']: x for x in json.loads(manual_path.read_text())['names']} if manual_path.exists() else {}
        corrections = json.loads((root / 'source-notices/name-corrections-2026-11.json').read_text())['corrections']
        self.china_population = {c['now']['scientific']: c['ebirdChinaPopulation'] for c in corrections if c.get('ebirdChinaPopulation')}

    def manual_row(self, x):
        """The eBird species a manual entry names, checked against the snapshot."""
        row = self.by_code.get(x['ebirdCode'])
        if not row or row['comName'] != x['english'] or row['sciName'] != x['ebirdScientific']:
            raise ValueError(f"Manual English name {x['id']} does not match eBird {x['ebirdCode']}")
        return row

    def link(self, bird):
        """Like match(), plus cards eBird includes in a broader species (linked as a name-based reference)."""
        row, method = self.match(bird)
        if not row and bird['id'] in self.manual:
            row, method = self.manual_row(self.manual[bird['id']]), 'common-name'
        return row, method

    def match(self, bird, english=None):
        """Return (eBird row, method) or (None, None). `english` overrides the card's English for the last step."""
        candidates, method = self.by_scientific.get(bird['scientific'], []), 'scientific'
        if bird['scientific'] in self.china_population:
            candidates, method = self.by_scientific.get(self.china_population[bird['scientific']], []), 'alias'
            if len(candidates) != 1:
                raise ValueError(f"Missing eBird identifier for {self.china_population[bird['scientific']]}")
        if not candidates:
            candidates = list({r['speciesCode']: r for a in bird['aliases'] for r in self.by_scientific.get(a, [])}.values())
            method = 'alias'
        name = bird['english'] if english is None else english
        if not candidates and name and self.retained['commonNameCounts'].get(normal(name)) == 1:
            candidates, method = self.by_common.get(normal(name), []), 'common-name'
        return (candidates[0], method) if len(candidates) == 1 else (None, None)
