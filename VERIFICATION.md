# Verification record

Checked locally on 18 November 2026. This is a runnable prototype, not an expert-reviewed national taxonomic edition.

## Source integrity and reproduction

- Original source archives are preserved with SHA-256 hashes in the dataset metadata. The builder refuses files whose hashes differ from the pinned releases.
- Independently compared the source IDs of every accepted, two-word Aves record in the original CAS archive with the bundled IDs: identical sets, 1,445 species, no missing or extra source species.
- Rebuilt from the included original files using Python, openpyxl 3.1.5 and pypinyin 0.55.0. The normalized dataset, coverage report and raw Aves extract were byte-identical before and after rebuilding.
- Dataset SHA-256: `da4361a0465e9986b461aded863f5344dc9b6ba1fa653a0ef988393e375fb630`.
- Coverage report SHA-256: `0c8f5151c23252e97861dd2a6981914b550f3ff7b358ace835ef8ab09f90ca31`.

## Automated checks

`npm test` at the initial release: **8 passed, 0 failed**. Later releases added tests; see the v0.2 and v0.3.2 sections below for the current count. Tests cover bundled-data integrity, tone-marked Pinyin and search variants, review intervals and lapses, independent directions, due-card ordering and daily limits, quoted CSV round trips, unsafe import identities, taxonomy updates and backup validation. A full 1,445-record CSV export/import round trip also preserved the normalized records.

`node --check` passed for the app, shared logic and server. The server returned the application and dataset successfully over the documented loopback address.

## Browser checks

Tested the served app in the Codex in-app Chromium browser, with desktop 1,280 × 920 and mobile 390 × 844 viewport settings.

| Workflow | Observed result |
| --- | --- |
| Reveal a card | Chinese, tone-marked Pinyin, English and scientific names appear; grading is unavailable before reveal. |
| Review with keyboard | A Good rating records one review and a future schedule. Progress counts update and survive reload. |
| Reverse the card direction | English appears first; Chinese and Pinyin appear after reveal. Progress is separate from the original direction. |
| Free practice | Cards can be browsed; rating controls do not change schedules. |
| Search `lvtouya` | Exactly the Mallard record appears: 绿头鸭, lǜ tóu yā, Anas platyrhynchos. |
| Apply a real dataset copy with one edited English name | Preview reports 0 added, 1 changed, 1,444 unchanged, 0 removed. Existing review survives replacement and reload. Imported coverage is labelled unverified. |
| Restore a full backup | Preview validates species and progress counts. Applying restores the original dataset and empty progress. Pre-update and pre-restore backup downloads are produced. |
| Filter to one bird, rate it, then undo | Due queue becomes empty after the rating; undo restores the card, zero review count and daily-new allowance. |
| Mobile layout | Card and controls fit; measured document width does not exceed viewport width. |
| Console | No captured warning or error messages at the final study-screen check. |

Test reviews and dataset changes were restored to the original empty notebook before finishing. Screenshots are saved in [docs/desktop.jpg](docs/desktop.jpg) and [docs/mobile.jpg](docs/mobile.jpg).

## Verification limits

- No claim of complete contemporary China occurrence coverage. The newer CAS download was not obtained; national record categories and regional completeness were not independently audited.
- The 151 flagged taxonomy candidates and all dictionary-generated Pinyin need expert review. Four English names remain unresolved and are excluded from study.
- Nine Mandarin voices were discoverable on the test computer. Audible playback and pronunciation quality were not assessed; availability varies by browser and operating system.
- Other browsers, assistive technologies, storage-quota exhaustion and concurrent-tab conflict handling were not exercised end to end. Storage and concurrency safeguards are implemented, but backups remain necessary.
- This check does not validate the truth of future user imports or establish redistribution rights for future source releases.

## v0.2 family/group and mobile update

At v0.2, eleven automated tests passed, including the complete 54-species duck/goose/swan partition, Thai and Pinyin family search, reserved ID safety, term progress and full vocabulary backups, plus compatibility with older backups. New source labels were checked against exact Wikidata P225 scientific names; the group builder checks the pinned input hashes.

Browser checks: the duck shortcut opened exactly 38 source species; a family term displayed 鸭科 / yā kē / Ducks, Geese, Swans / Anatidae; recording Good scheduled it for tomorrow; Undo removed only that test review; the reverse card displayed English first. Free practice kept rating controls disabled. Existing species progress was retained. Phone 390 × 844 and iPad 768 × 1024 viewport overrides produced effective content widths of 375 and 753 pixels respectively, with no document overflow. These were browser viewport checks, not tests on physical Apple hardware.

The public Pages edition uses relative URLs and a root `.nojekyll` file. Home Screen support is supplied through a web manifest; no offline cache or cloud synchronization is claimed.

## v0.3.2 automated test re-run

Re-ran `npm test` on 18 November 2026 with Node.js 22.23.2: **18 passed, 0 failed**. The seven tests added since v0.2 cover the Name guide (character coverage and retained input hashes, context reading selection, compound and personal-name safeguards, credited and escaped rendering) and eBird references (source-match coverage, fallbacks for imported or changed names, and links shown only with the revealed answer). This re-run covered the automated tests only; no additional browser checks were made for it.

## v0.4 name corrections against AviList v2026

Checked on 18 November 2026. Sources: AviList v2026 extended (20 Oct 2026, SHA-256 `df031d392b766673ce8a9eb37b8e57a91baabf9576b6b2bcfd6cf9aa4902797d`), an avilist.org export of the same release with Simplified Chinese names, the CBR Checklist of Birds of China v12.0 (SHA-256 `2bc5a89e089d7b0b6663ed7898e381248924b5a00df66db746f740cbcdc63c42`) and IOC 15.2 Chinese names.

- All 1,516 CBR species mapped to 1,501 AviList species; 5 AviList splits (Butorides, Cinnyris, Gygis, Enicurus, Carduelis) were reviewed by range statement and mapped to the sibling recorded in China.
- 46 cards corrected (38 concept, 2 English-only, 6 Chinese-only), listed with evidence in `source-notices/name-corrections-2026-11.json`. The build refuses to apply a correction whose stated AviList name, English name or Avibase ID is absent from the pinned AviList file, or whose source record has changed.
- After correcting, no card's Chinese name is the AviList-Simplified, CBR or IOC name of a different China species, and no card's English name is the AviList or IOC name of a different taxon (genus moves excepted). Card IDs, Chinese names and scientific names remain unique.
- eBird references rebuilt from the same 18 November snapshot: 1,418 links (1,274 scientific / 22 alias / 122 common-name), 27 manual lookups. Every corrected card links to the same Cornell species code that AviList lists, except the two broad AviList species, which link to the population recorded in China (Grey-headed Swamphen, Scarlet Minivet).
- Name guide rebuilt from the same pinned CC-CEDICT download; 理 is the one new character (475 total, 474 from CC-CEDICT).
- Name guide word units: 78 curated units, 48 of them read as whole words (22 added place names; opaque words such as 八哥, 孔雀, 信天翁, 太平鸟, 相思 and 叽喳), plus a rule that treats the character before 氏 as part of a personal name. All 158 names containing such a unit were listed and checked by hand. 日本松雀鹰 now reads 日本 = Japan rather than 日 = sun and 本 = root; 藏, 滇 and 胡 carry their bird-name senses (Tibet, Yunnan, beard). The ten name notes and the Thai unit glosses were rewritten to state each meaning and its source directly, without closing disclaimers; the note label (literal, usage, cultural, source explanation, folklore) carries the kind of evidence.
- `npm test`: **23 passed, 0 failed**, including four new correction tests and one word-unit test.
- Browser check (built-in Chromium, local server): the baseline edition label and footer version load, the Name guide shows 喜鹊 · Oriental Magpie · *Pica serica*, and no console errors were logged. Study-flow reviews were not repeated.

Not verified: expert review of the 38 concept choices (in particular 蓝短翅鸫 → 中华短翅鸫, where the CAS record covers three China species), physical-device layout, and browsers holding an imported or restored dataset, which keep their stored copy.

## v0.5 study page, shuffle and eBird links

Checked on 19 November 2026.

- 苍鹰 had no direct eBird link because eBird and AviList split Northern Goshawk; the card is now Eurasian Goshawk (*Astur gentilis*, `norgos1`). 蒙古沙鸻 follows the same kind of split to Siberian Sand Plover (*Anarhynchus mongolus*). Corrections now total 48.
- 15 cards whose genus changed in AviList v2026 and eBird carry the current combination as an alias; each one now links to the Cornell code that AviList lists. eBird references: 1,435 links (1,276 scientific / 37 alias / 122 common-name), 10 manual lookups (4 unresolved names, 6 AviList/eBird lumps).
- New cards and free practice use a stable seeded order stored in the progress settings; **⇄ Shuffle** sets a new seed. A test confirms that 20 new cards span at least 12 families, that the same seed gives the same order, that due reviews still come first, and that the seed survives a backup round trip.
- Browser check: consecutive cards came from different families, Shuffle changed the next card, and **Reveal answer** opened the **Name meaning & history** panel below the card.
- `npm test`: **24 passed, 0 failed**.

### v0.5 character meanings

- Thai learning glosses now cover all 475 characters (239 added) and 62 English learning glosses replace surname-first or out-of-context dictionary senses. All new Thai text was checked for the bird-name sense, for example 鹑 นกคุ่ม (quail) and 鹱 นกจมูกหลอด (shearwater).
- Four more whole-word units: 苦恶 (the waterhen's call), 弄岗 (Nonggang), 萨岛 (Sakhalin) and 达乌里 (Dauria).
- Character structure for all 475 characters: 464 from Make Me a Hanzi, 11 authored; stroke counts from Unihan 18.0.0 for all. Both input files are pinned by SHA-256.
- Reading fix: 发冠卷尾 fā guān → fà guān.
- Browser check: the Name guide tiles show the structure line (鹭 = 鸟 + 路 lù, radical and strokes), place-name characters keep their structure in the collapsed details, and no console errors were logged.
- `npm test`: **25 passed, 0 failed**.

### v0.5.1 pinyin and English structure text

- Character structure is shown in English with pinyin after every Chinese character, including radicals and components; bird words carry the Thai name (bird → นก, crow → อีกา, swallow → นกนางแอ่น). The build stops if any Chinese character in the structure text lacks a reading.
- 72 authored Thai and English glosses that mention Chinese words now give their pinyin, taken from the card reading for bird names and from pypinyin with the app's reading overrides otherwise; all were checked by hand.
- Corrected Make Me a Hanzi's hint for 鸟 (simplified from 鳥, not 烏) and removed stray whitespace in the sound part of 瓣.
- `npm test`: **25 passed, 0 failed**; a test checks that every Chinese character in structure text and authored glosses is followed by a reading.

## v0.6 Thai names and review intervals

- Review intervals: a test checks that the first answer gives Again 1, Hard 2, Good 4 and Easy 7 days, that Good grows 4 → 10 → 25 days, that Hard < Good < Easy for every later state including the lowest ease, and that Again returns in 1 day and restarts from the first-answer intervals.
- Thai names: the build checks the workbook hash and title, that each checklist species is used once, and that the English-name matches with a different epithet are exactly the twelve reviewed ones. Tests check the counts (812 = 745 + 64 + 3), that every name is Thai script and every card ID exists, examples (喜鹊 นกสาลิกาปากดำ, 戴胜 นกกะรางหัวขวาน, 牛背鹭 นกยางควาย, 绿鹭 นกยางเขียว), cards that must stay without a Thai name (蒙古沙鸻, 弄岗穗鹛, 黄爪隼, 松鸦, 白头鵙鹛), Thai search, and that Thai names never enter saved datasets, CSV exports or backups.
- Browser check: the rating buttons read Again 1 day, Hard 2 days, Good 4 days, Easy 7 days; a revealed card shows “Thai นกสาลิกาเขียว” for 蓝绿鹊; library search for สาลิกา finds the three magpies; the Name guide finds 牛背鹭 from นกยางควาย; the details for 喜鹊 show the Thai name with the checklist names; the Data & sources page credits the checklist; no console errors were logged.
- `npm test`: **28 passed, 0 failed**.

## v0.6.1 eBird name for 黑头䴓 and one supplied Thai name

- 黑头䴓 *Sitta villosa*: English name set to Snowy-browed Nuthatch from the pinned eBird snapshot (snbnut1). The builder stops if the card or the snapshot no longer matches. The rebuilt `birds.json` differs from v0.6 only in this card, the name-match count and the added eBird source entry; `ebird-links.json` and `name-guide.json` changed only in that card's source name and the dataset hash.
- 灰背鸫 Grey-backed Thrush: Thai name นกเดินดงหลังเทา supplied for this project; 813 Thai names (746 scientific, 64 English, 3 reviewed). 黄爪隼 Lesser Kestrel stays without a Thai name.
- `npm test`: **29 passed, 0 failed**, including a test that 黑头䴓 keeps its scientific name and eBird link.

## v0.7 English names from eBird

- English names: 1,435 cards take the eBird common name of the species their eBird link opens; 241 changed, 10 have no eBird match. The 75 changes that are more than spelling were reviewed one by one (same eBird code and species). A test checks that every card with an eBird link shows that link's English name, that every other card is listed for a manual name, and the examples 黑头䴓 Snowy-browed Nuthatch, 戴胜 Common Hoopoe, 原鸽 Rock Pigeon and 大山雀 Asian Tit.
- The eBird link builder and the dataset builder share one matcher; rebuilt links are unchanged (1,276 scientific, 37 alias, 122 common name, 10 manual lookups). Thai names are unchanged (813), and the Thai builder now also tries the replaced IOC/AviList name.
- Search: a test checks that grey and gray find the same birds.
- Browser check: library search for hoopoe finds 戴胜 Common Hoopoe; grey bunting finds 灰颈鹀 Gray-necked Bunting and 灰鹀 Gray Bunting; the details for 戴胜 show the eBird name, the Thai name and “IOC/AviList: Eurasian Hoopoe”; Data & sources lists “English names (eBird)”; 1,441 cards remain study-ready; no console errors.
- `npm test`: **30 passed, 0 failed**.
