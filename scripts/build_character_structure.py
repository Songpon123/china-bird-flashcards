#!/usr/bin/env python3
"""Build data/character-structure.json offline from pinned Make Me a Hanzi and Unihan files.

For every character in the bundled bird and group names it records the stroke count
(Unihan kTotalStrokes), the radical, and how the character is built (Make Me a Hanzi
etymology): a meaning part plus a sound part, a compound of meanings, or a pictograph.
Eleven bird-name characters missing from Make Me a Hanzi get an authored entry
(meaning part 鸟/鳥 + the sound part that gives the reading), marked source "authored".

Inputs (pinned by SHA-256; download them from the URLs in
source-notices/character-structure/README.md into that folder):
    source-notices/character-structure/makemeahanzi-dictionary.txt
    source-notices/character-structure/Unihan.zip
"""
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTICE = ROOT / 'source-notices/character-structure'
PINNED = {
    'makemeahanzi-dictionary.txt': '744bb05d5b0742e9ee35c37791f94d56a173349b3367569e7ca11e510364d203',
    'Unihan.zip': '4c93ea9c1f636451729a840978f1667a53886af37ba854fdcce109721c63d43e',
}
# Thai meanings of the meaning parts that occur in these names (authored learning glosses).
COMPONENT_THAI = {
    '鸟': 'นก', '鳥': 'นก', '隹': 'นก', '又': 'นก (รูปย่อของ 鳥)', '氵': 'น้ำ', '木': 'ต้นไม้', '艹': 'หญ้า / พืช',
    '纟': 'ไหม / เส้นด้าย', '糸': 'ไหม / เส้นด้าย', '口': 'ปาก', '虫': 'แมลง', '钅': 'โลหะ', '⺼': 'เนื้อ / ร่างกาย',
    '亻': 'คน', '羽': 'ขนนก', '土': 'ดิน', '王': 'หยก', '足': 'เท้า', '页': 'ศีรษะ', '辶': 'การเดินทาง',
    '山': 'ภูเขา', '扌': 'มือ', '手': 'มือ', '日': 'ดวงอาทิตย์', '火': 'ไฟ', '灬': 'ไฟ', '犭': 'สัตว์',
    '石': 'หิน', '禾': 'ธัญพืช', '囗': 'การล้อมรอบ', '宀': 'หลังคา', '疒': 'ความเจ็บป่วย', '皿': 'ภาชนะ',
    '目': 'ตา', '雨': 'ฝน', '鱼': 'ปลา', '冂': 'สิ่งครอบ', '刂': 'มีด', '刀': 'มีด', '十': 'สิบ',
    '厤': 'ปฏิทิน', '厂': 'หน้าผา', '大': 'ใหญ่ / สูง', '子': 'เด็ก', '巾': 'ผ้า', '弓': 'คันธนู',
    '彡': 'ขนหรือลวดลาย', '心': 'หัวใจ', '欠': 'ลมหายใจ', '玨': 'สายพิณ', '瓜': 'แตง', '一': 'หนึ่ง',
    '皮': 'หนัง', '矢': 'ลูกศร', '立': 'ยืน', '⺮': 'ไม้ไผ่', '米': 'ข้าว', '罒': 'ตาข่าย', '舟': 'เรือ',
    '芒': 'หญ้า', '衤': 'เสื้อผ้า', '戎': 'อาวุธ', '贝': 'เงินตรา (เปลือกหอย)', '赤': 'สีแดง', '光': 'แสง',
    '门': 'ประตู', '阝': 'สถานที่', '革': 'หนังฟอก', '自': 'ตนเอง',
}
COMPONENT_ENGLISH = {'辶': 'movement'}
# Shown in English with pinyin after every Chinese character; bird words also get the Thai name.
BIRD_PARTS = {'鸟', '鳥', '隹', '又'}
BIRD_WORDS_THAI = {'bird': 'นก', 'birds': 'นก', "bird's": 'นก', 'crow': 'อีกา', 'swallow': 'นกนางแอ่น'}
# Corrections to Make Me a Hanzi hints (鸟 is the simplified form of 鳥, not 烏).
HINT_FIXES = {'鸟': 'Simplified form of 鳥, a bird'}
# Readings for radical variants that Make Me a Hanzi lists without pinyin (the full forms 肉 and 小).
VARIANT_READINGS = {'⺼': 'ròu', '⺌': 'xiǎo', '⺈': 'dāo', '辡': 'biàn'}
CJK = re.compile(r'[\u2e80-\u2fdf\u31c0-\u31ef\u3400-\u9fff\U00020000-\U0002ffff]')
BIRD_WORD = re.compile(r"\b(bird's|birds|bird|crow|swallow)\b", re.I)
# Bird-name characters missing from Make Me a Hanzi: meaning part + sound part, checked by reading.
AUTHORED = {
    '䳭': ('鸟', '即', 'jí'), '䴓': ('鸟', '师', 'shī'), '䴕': ('鸟', '列', 'liè'), '䴘': ('鸟', '虒', 'sī'),
    '䴙': ('鸟', '辟', 'pì'), '鳽': ('鳥', '幵', 'jiān'), '鵙': ('鳥', '狊', 'jú'), '鵟': ('鳥', '狂', 'kuáng'),
    '鹀': ('鸟', '无', 'wú'), '鹟': ('鸟', '翁', 'wēng'), '鹲': ('鸟', '蒙', 'méng'),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def clean(text):
    return ' '.join(str(text or '').replace('\xa0', ' ').split())


def annotate(text, reading):
    """Add pinyin after each Chinese character and the Thai name after bird words."""
    text = CJK.sub(lambda m: f'{m.group()} ({reading(m.group())})' if reading(m.group()) else m.group(), text)
    return BIRD_WORD.sub(lambda m: f'{m.group()} ({BIRD_WORDS_THAI[m.group().lower()]})', text)


def main():
    for name, expected in PINNED.items():
        if digest((NOTICE / name).read_bytes()) != expected:
            raise ValueError(f'Pinned source changed: {name}')
    birds = json.loads((ROOT / 'data/birds.json').read_text())['birds']
    groups = json.loads((ROOT / 'data/groups.json').read_text())['cards']
    chars = sorted({c for b in birds + groups for c in b['chinese']})
    mmh = {}
    for line in (NOTICE / 'makemeahanzi-dictionary.txt').read_text(encoding='utf-8').splitlines():
        entry = json.loads(line)
        mmh[entry['character']] = entry
    unihan = {}
    with zipfile.ZipFile(NOTICE / 'Unihan.zip') as z:
        for line in z.read('Unihan_IRGSources.txt').decode('utf-8').splitlines():
            if line.startswith('U+') and '\tkTotalStrokes\t' in line:
                cp, _, value = line.split('\t', 2)
                unihan[chr(int(cp[2:], 16))] = int(value.split()[0])
    def reading(ch):
        return ((mmh.get(ch) or {}).get('pinyin') or [VARIANT_READINGS.get(ch, '')])[0] or VARIANT_READINGS.get(ch, '')

    out = {}
    for c in chars:
        record = {'strokes': unihan[c]}
        m = mmh.get(c)
        if m:
            etymology = m.get('etymology') or {}
            record['radical'] = m.get('radical')
            record['source'] = 'makemeahanzi'
            kind = etymology.get('type')
            if kind == 'pictophonetic' and etymology.get('semantic'):
                semantic, phonetic = etymology['semantic'], clean(etymology.get('phonetic')) or None
                record.update(type=kind, semantic=semantic, semanticPinyin=reading(semantic),
                              semanticMeaning=annotate(clean(etymology.get('hint')) or COMPONENT_ENGLISH.get(semantic, ''), reading))
                if semantic in BIRD_PARTS:
                    record['semanticThai'] = COMPONENT_THAI[semantic]
                if phonetic:
                    record.update(phonetic=phonetic, phoneticPinyin=reading(phonetic))
            elif kind in ('ideographic', 'pictographic') and etymology.get('hint'):
                record.update(type=kind, hint=annotate(HINT_FIXES.get(c) or clean(etymology['hint']), reading))
        elif c in AUTHORED:
            semantic, phonetic, sound = AUTHORED[c]
            record.update(radical=semantic, source='authored', type='pictophonetic', semantic=semantic,
                          semanticPinyin='niǎo', semanticMeaning='bird (นก)', semanticThai=COMPONENT_THAI[semantic],
                          phonetic=phonetic, phoneticPinyin=sound)
        else:
            raise ValueError(f'No structure source for {c}')
        record['radicalPinyin'] = reading(record['radical']) or ('niǎo' if record['radical'] in ('鸟', '鳥') else '')
        out[c] = record
    bare = sorted({ch for r in out.values() for f in ('hint', 'semanticMeaning') for ch in CJK.findall(r.get(f, ''))
                   if f'{ch} (' not in r.get(f, '')})
    if bare:
        raise ValueError(f'Chinese without pinyin in hints: {bare}')
    doc = {
        'schemaVersion': 1,
        'meta': {
            'version': 'character-structure-2026-11-19-v2',
            'characterCount': len(out),
            'counts': {k: sum(1 for r in out.values() if r.get('type') == k) for k in ('pictophonetic', 'ideographic', 'pictographic')},
            'authored': sorted(c for c, r in out.items() if r['source'] == 'authored'),
            'sources': [
                {'id': 'makemeahanzi', 'title': 'Make Me a Hanzi · dictionary.txt (Shaunak Kishore)', 'url': 'https://github.com/skishore/makemeahanzi',
                 'license': 'LGPL-3.0-or-later', 'use': 'Radical and how each character is built (meaning part, sound part, origin hint).'},
                {'id': 'unihan', 'title': 'Unicode Han Database (Unihan), Unicode 18.0.0 (2026-07-31)', 'url': 'https://www.unicode.org/charts/unihan.html',
                 'license': 'Unicode License V3', 'use': 'Total stroke counts (kTotalStrokes).'},
                {'id': 'authored', 'title': 'Authored for this app', 'license': 'LGPL-3.0-or-later (distributed with the derived file)',
                 'use': 'Structure of 11 bird-name characters missing from Make Me a Hanzi, and Thai meanings of meaning parts.'},
            ],
            'inputHashes': {f'source-notices/character-structure/{k}': v for k, v in PINNED.items()},
        },
        'characters': out,
    }
    target = ROOT / 'data/character-structure.json'
    target.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f"{target.name}: {len(out)} characters; {doc['meta']['counts']}; authored {len(doc['meta']['authored'])}")


if __name__ == '__main__':
    main()
