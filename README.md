# 羽 Yǔ — China Bird Flashcards

**[คู่มือใช้งานภาษาไทย](README.th.md)** · **[Open the live app](https://songpon123.github.io/china-bird-flashcards/)** · [GitHub repository](https://github.com/Songpon123/china-bird-flashcards)

A runnable, local-first prototype for learning bird names in Simplified Chinese, tone-marked Hanyu Pinyin, English and scientific Latin. No API key, account, database server, package installation or internet connection is needed to study the bundled data.

**Coverage is deliberately limited and visible: this is not a complete inventory of every species recorded in China as of 2026.** It includes every one of the **1,445 accepted species binomials** in the downloaded **Catalogue of Life China 2023 v1.1** archive. **All 1,445 have all four study fields** since v0.7; ten of them carry the eBird name of the broader species eBird includes them in (see English names below). There are **187 records flagged for taxonomy review**, including those ten and the cards whose species concept was narrowed by the reviewed name corrections below. Pinyin is dictionary-generated, with reading overrides, and has not had a complete expert audit.

## What's new in v0.7 (19 November 2026)

- **English names follow eBird.** Every card whose species is on eBird (1,435 of 1,445) now uses the eBird common name; 241 names changed. About 166 are spelling only (Grey → Gray, Sand Plover → Sand-Plover); the rest are different names for the same bird, for example 戴胜 Common Hoopoe (was Eurasian Hoopoe), 原鸽 Rock Pigeon (Rock Dove), 灰鸻 Black-bellied Plover (Grey Plover), 大山雀 Asian Tit (Cinereous Tit) and 紫水鸡 Gray-headed Swamphen (Purple Swamphen). Scientific names, eBird links, Thai names and saved progress are unchanged, and each card's details still show the IOC/AviList name it replaced.
- **Grey and gray find the same birds** in every search box.
- **Ten taxa eBird includes in a broader species now carry that species' name**, as chosen for this project: 小白腰雨燕 Little Swift, 中亚夜鹰 Eurasian Nightjar, 黑眉长尾山雀 Black-browed Tit, 极北朱顶雀 Redpoll, 斑腰燕 Eastern Red-rumped Swallow, 海南画眉 Chinese Hwamei, 华西柳莺 Tickell's Leaf Warbler, 休氏白喉林莺 and 漠白喉林莺 Lesser Whitethroat, and 四川林鸮 Ural Owl. Each was checked against the eBird Taxonomy and links to that species' eBird page. Four of them had no English name before, so **all 1,445 cards are now study-ready**.
- **Shared English names stay answerable.** Eight English names now belong to more than one card (for example Lesser Whitethroat for 白喉林莺, 休氏白喉林莺 and 漠白喉林莺). On English → Chinese cards the scientific name appears under a shared name, with a note that eBird uses the name for several cards.

## What's new in v0.6.1 (19 November 2026)

- **黑头䴓 is now Snowy-browed Nuthatch**, the eBird name, instead of Chinese Nuthatch (AviList, IOC and CBR). The scientific name *Sitta villosa* and the eBird link are unchanged, and the card's details note the other name.
- **灰背鸫 Grey-backed Thrush has its Thai name, นกเดินดงหลังเทา.** The Thai checklist lists this species without one; the name was supplied for this project. 813 cards now have a Thai name.

## What's new in v0.6 (19 November 2026)

- **Thai bird names.** 812 cards now show the Thai name below the scientific name after **Reveal answer**, and in the Bird library, the Name guide and the bird details. Search accepts Thai too, for example นกยาง or สาลิกา. The names come from the *Revised Checklist of Thai birds* (February 2025), matched to the cards by scientific name (745 cards), by English name where only the genus or spelling differs (64 cards, each checked) and by hand for three cards whose species is split differently in the two lists: 紫水鸡 นกอีโก้ง, 蓝枕花蜜鸟 นกกินปลีท้ายทอยน้ำเงิน and 绿鹭 นกยางเขียว. Birds that are not on the Thai list, such as 弄岗穗鹛, have no Thai name.
- **Clearly separated review intervals.** The first answer on a card sets **Again 1 day · Hard 2 days · Good 4 days · Easy 7 days**. Later answers grow from the previous interval and always keep Hard shorter than Good and Good shorter than Easy. Again brings the card back the next day and starts it again from 2 / 4 / 7 days. Dates already saved stay as they are; new answers use the new intervals.

## What's new in v0.5 (19 November 2026)

- **Name meaning & history opens on the Study page.** After **Reveal answer**, the panel with the word-by-word meaning, Thai glosses and naming notes opens directly below the card. Collapse it at any time.
- **Mixed order and a Shuffle button.** New cards and free practice no longer follow the taxonomic sequence; each browser gets its own mixed order across families, which stays the same between visits. **⇄ Shuffle** mixes the cards in your focus again. Due reviews still come first.
- **Goshawk and sand plover follow the split.** 苍鹰 is now Eurasian Goshawk (*Astur gentilis*) and 蒙古沙鸻 is Siberian Sand Plover (*Anarhynchus mongolus*); both link to their eBird pages.
- **Thai meanings for every character, and how each character is built.** All 475 characters now have a Thai gloss (up from 236), and characters whose first dictionary sense is a surname show the sense used in bird names (凤 phoenix, 角 horn, 枕 nape, 姬 small). Each character tile also shows its structure from Make Me a Hanzi and Unihan: the meaning part and the sound part (鹭 = 鸟 bird + 路 lù), or the origin of a compound or pictograph, with the radical and stroke count. The structure text is in English with pinyin after every Chinese character (for example “A furry 毛 (máo) tail behind a body 尸 (shī)”), and bird words carry the Thai name, as in “bird (นก)”. 发冠卷尾 is now read fà guān (hair-crested).
- **17 more direct eBird links.** Cards whose genus changed in AviList v2026 and eBird (for example 苇鹀 *Schoeniclus pallasi*) now carry the current name as an alias and open their eBird species page. Ten cards still use eBird search: four without an English name and six that AviList and eBird merge into a broader species.

## What's new in v0.4 (18 November 2026)

- **Names checked against the latest lists.** Every card was checked against AviList v2026 (October 2026) with its Simplified Chinese names, the CBR Checklist of Birds of China v12.0 and IOC 15.2 Chinese names. 46 cards whose names belonged to another bird were corrected (48 after v0.5), for example 喜鹊 is now Oriental Magpie (*Pica serica*) and 牛背鹭 is Eastern Cattle Egret (*Ardea coromanda*). Card IDs are unchanged, so saved progress carries over. See [Name corrections](#name-corrections-avilist-v2026).
- **Place names and set words read as whole words.** The Name guide reads 48 words as units, so 日本松雀鹰 is Japan + sparrowhawk, 四川 is Sichuan, 喜山 is the Himalayas, 八哥 is myna and 孔雀 is peafowl. A character before 氏 is shown as part of a person's name.
- **Clearer name notes.** The ten naming notes state each meaning and its source directly.
- **eBird links follow the corrected names**, including the populations recorded in China for broad species.

## Open on a phone or iPad

The public GitHub Pages edition is https://songpon123.github.io/china-bird-flashcards/. Open it directly in Safari or another modern browser; no Node.js is needed on the phone or tablet. On iPad/iPhone, Safari’s Share → View More (or More) → Add to Home Screen can create a shortcut. Enable Open as Web App if offered. See [Apple’s iPad guide](https://support.apple.com/en-gb/guide/ipad/ipad8f1f7a29/27/ipados/27). The site needs a connection to load; this release does not promise offline caching.

Progress is local to each browser/device. Use **Download full backup** and **Restore** to move progress between a computer, phone and iPad. Existing progress at `127.0.0.1` does not automatically move to the public site.

## Run

Install Node.js 18 or newer, open a terminal in this folder, and run:

```sh
npm start
```

Open **http://127.0.0.1:4173**. No `npm install` is necessary. Keep the terminal open while using the app; press Ctrl+C to stop it. You can choose another port with `PORT=4174 npm start`.

Alternatively, with Python 3:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Use the same address each time. `localhost` and `127.0.0.1`, different ports, and different browsers each have separate browser storage. Opening `index.html` directly as a file does not work because browsers restrict loading the dataset.

## Study

- Choose **Chinese → English** or **English → Chinese**. Progress is separate for each direction.
- **Spaced review + new cards** presents due cards first, followed by up to 20 new cards per day per direction by default. New cards come in a mixed order across families; **⇄ Shuffle** mixes them again, and the order is kept in your progress and backups. Set the limit to zero for reviews only. New allowances reset at local midnight; existing due times use elapsed time.
- Reveal a card, then choose Again, Hard, Good or Easy. The proposed interval appears on each button. The app does not grade typed answers or automatically claim that a word is mastered.
- After revealing a species card (when the toggle says **Show question**), **View on eBird ↗** opens a species reference in a new tab. It is hidden on the question side, in both directions. Family/group cards do not link to an arbitrary species. Unmatched species use **Find on eBird ↗** to open Explore for manual search.
- **Browse & practice freely** explores the filtered checklist without changing schedules. Library rows can open individual birds in practice mode.
- Search accepts Chinese, English, scientific names, safe aliases, and Pinyin with or without tones or spaces. `lvtouya`, `lu: tou ya` and `lǜ tóu yā` all find 绿头鸭.
- Filter by order, family, progress, or whether a record requires taxonomy review. Optional front-side Pinyin is a hint you can turn off.
- Keyboard: Space reveals the answer; 1/2/3/4 rates it; Right Arrow skips forward. Text fields retain normal typing behavior. Previous is available in practice mode.
- **Undo last review** reverses the latest review in the current tab, including its daily-new count. Undo is not retained after a reload or dataset update.

### Schedule

The prototype uses a small, documented SM-2-inspired heuristic, not FSRS and not the original SM-2 algorithm. The first answer on a card sets a clear, separate gap: **Again 1 day · Hard 2 days · Good 4 days · Easy 7 days**. After that, Hard multiplies the previous interval by 1.2 (at least 2 days), Good by ease (at least 4 days) and Easy by ease × 1.3 (at least 7 days), so Hard is always shorter than Good and Good shorter than Easy. Again always returns in 1 day and resets the success streak, so the next answer starts again from 2 / 4 / 7 days. Ease starts at 2.5, is bounded to 1.3–4, decreases on Again/Hard and increases on Easy. Intervals are shown before grading. “Mature” means a 21-day-or-longer interval.

### eBird reading references

The app bundles **1,435 outbound species references** from a retained snapshot of the official eBird Taxonomy API: **1,276 exact scientific-name matches**, **37 unique scientific-alias matches**, and **122 exact English common-name candidates** (case and punctuation normalized). The last category is labelled **Name-based reference**, with the destination name visible. Matching is for reading links; it does not assert equivalent taxon concepts, resolve splits/lumps, update the checklist, or move progress. **10 source names remain manual lookups**; no eBird code is invented. eBird names and species limits may differ from the retained CAS baseline.

Imported names receive direct references only when supported by this snapshot. Changed English names invalidate old common-name candidates; removed aliases invalidate alias-based references. If the reference file cannot load, the cards still link to eBird Explore. eBird runs no code in the app and receives no request until you follow an external link. No API key is used by visitors; no eBird media, range maps, descriptive text or observations are bundled. Language and eBird reference packs are app resources, separate from notebook backups.

Rebuild links offline from the retained identifiers with `python3 scripts/build_ebird_links.py`. Source citation, retrieval date, original response hash, and limits are retained in `source-notices/ebird-reference-identifiers.json` and the generated JSON. The full publisher taxonomy is not redistributed, and its license is not inferred from the app's MIT license. See [data attribution](DATA_LICENSE.md).

## Family and group vocabulary

Open **Families & groups** for 33 additional terms: **26 selected family names** out of the baseline’s 109 families, plus **7 common-name learning groups**. These terms do not increase the 1,445-species count. Select the family/group card deck in Study for reversible, separately scheduled vocabulary cards. The daily new-card allowance is shared between both decks within each direction.

Examples: 鹰科 **yīng kē** (Accipitridae), 鸠鸽科 **jiū gē kē** (Columbidae), 鸭科 **yā kē** (Anatidae), 鸭类 **yā lèi** (ducks), 雁类 **yàn lèi** (wild geese). The informal groups include hawks/eagles, doves/pigeons, ducks, geese, swans, owls and woodpeckers. Wild geese use 雁; the everyday/domestic-goose word 鹅 (é) has a different scope.

Each term has a Thai learning gloss, pronunciation controls during study, provenance and a button to view member species. Membership follows explicit source family/genus rules: ducks 38, geese 13, swans 3, together partitioning the 54 source Anatidae records. A common name containing “goose” does not itself determine membership. Different-taxonomy imports disable these membership links until a reviewed mapping is supplied. Other families retain their scientific names without guessed Chinese translations.

Full backups include the vocabulary snapshot and schedules. Older backups remain supported and use the app’s bundled vocabulary. Species CSV/JSON imports update the species deck; updating group definitions requires a reviewed app/data release.

## Character meanings and selected name stories

All menus and controls use English. The **Name guide** explains all **475 distinct Chinese characters** used in the bundled 1,445 species names and 33 family/group terms. **474 character headwords come from the official CC-CEDICT snapshot; one modern-usage gloss for 鵟 is separately attributed to the CAS checklist.** English meanings cover all 475, and Thai learning glosses cover all 475. Each character also shows how it is built (meaning part and sound part, or the origin of a compound or pictograph), its radical and its stroke count, from Make Me a Hanzi (LGPL-3.0) and Unicode Unihan; see `source-notices/character-structure/`. General dictionary senses and alternate readings remain available in expandable sections. Source text, selected English learning glosses, Thai translations and formatting adaptations are attributed under **CC BY-SA 4.0**, separately from the bird dataset and app code.

Search a Chinese name, English bird name, Pinyin, or a character. Example buttons open 白鹭, 喜鹊, 鸳鸯, 戴胜 and 杜鹃. The guide distinguishes **literal reading, word usage, cultural explanation, source explanation and folklore**. There are **10 selected notes**, not a complete history of all bird names. Names without a note state that notes cover selected names. Curated word units preserve compounds such as 伯劳, 鹡鸰 and 䴙䴘 and place-name transliterations; a dictionary substring is never automatically asserted to explain a naming origin. 氏 prompts a personal-name caution without inventing the commemorated person's identity.

Authored explanations show tone-marked Pinyin directly after Chinese references, for example **白 (bái)** and **鹭 (lù)**. All 82 curated word units also display a complete-word reading. 52 of them are place names or words read as a whole, such as 日本 (Japan), 四川 (Sichuan), 喜山 (Himalayas), 伯劳 (shrike), 八哥 (myna) and 孔雀 (peafowl): their characters show the whole word's meaning, so 日本松雀鹰 reads as Japan + sparrowhawk. A character before 氏 is treated as part of a person's name (理氏 = “Richard's”). 藏, 滇 and 胡 carry the senses used in bird names: Tibet, Yunnan and beard. These readings are retained explicitly in the editorial source; they are not produced by concatenating arbitrary character readings at runtime.

After revealing a flashcard, the **Name meaning & history** panel opens below the card. Definitions are hidden while the answer is hidden, in both study directions. Library and family/group details also include the guide. The language pack changes no bird IDs, schedules, dataset membership or saved progress. Imported/restored names use the bundled guide and explicitly identify any uncovered characters. Notebook backups retain datasets and progress; the app-bundled language pack is not copied into backups. Preserve `data/name-guide.json` and `source-notices/name-guide/` separately to keep an exact guide edition.

Rebuild the guide without downloads or third-party Python packages:

```sh
python3 scripts/build_name_guide.py
```

See [the retained source and rebuild notes](source-notices/name-guide/README.md) for a pinned source hash, extraction rules, individual note citations and how to update an official dictionary snapshot. General dictionary senses, selected learning translations, and checklist Pinyin still need expert review. Naming stories are limited independently of character-definition coverage.

## Keep your progress

Schedules, review history and settings are stored in this browser's local storage. There is no cloud synchronization, login, analytics or telemetry. Export a **full backup** from My progress or Data & sources before moving devices, changing addresses or clearing browser data.

A full backup contains the active dataset, source metadata, both directional schedules, settings, review history and archived schedules for removed species. Restore has a preview and replaces the current notebook only when applied. Applying a dataset update or backup restore first downloads a backup of the current notebook. Verify that your browser actually saved it, especially if automatic downloads are blocked.

When another tab changes the notebook, this tab blocks further review writes and asks for a reload to prevent overwriting newer progress. Storage failures are reported; a backup can still be exported from memory. A very large review history can eventually exceed browser storage. This prototype is intended for personal use; use backups routinely.

## Import and update the checklist

Use **Data & sources → Import a dataset update**. Full dataset JSON is the preferred format because it retains detailed source attribution and metadata. The JSON shape is the same as `data/birds.json`:

```json
{
  "schemaVersion": 1,
  "meta": {
    "title": "Your checklist title",
    "version": "Your source release and local revision",
    "taxonomy": "Stable taxonomy/concept namespace",
    "scope": "Source geography, occurrence categories and exclusions",
    "license": "The actual source reuse terms",
    "sourceUrl": "https://your-authoritative-source.example/checklist"
  },
  "birds": []
}
```

The example describes the schema; an empty `birds` array is intentionally rejected. Start by exporting the real bundled JSON or CSV and editing a copy.

Each record has `id`, `sourceId`, `chinese`, `pinyin`, `english`, `scientific`, `order`, `family`, `aliases`, `taxonomyReview`, `pinyinStatus`, `nameMatch`, `englishSource`, and `matchedScientific`. The four learning names are plain text. English may be empty to represent an unresolved record; such records remain searchable but are excluded from study. `aliases` is an array in JSON, and a JSON array or `|`-separated string in CSV. CSV must be UTF-8, comma-separated, with a header; quoted fields and a UTF-8 BOM are supported. Exported CSV includes every required record column. Complete the CSV metadata form before validation. CSV does not carry the JSON's full source bibliography; retain the attribution files when sharing it.

1. Choose the file, validate it, and inspect the added/changed/unchanged/removed counts.
2. Keep an existing species' stable ID when only its common name changes. Renaming a scientific name requires retaining the previous scientific name in aliases.
3. Changing a known scientific name's ID is blocked, because it would detach its progress. Fix the incoming ID or prepare an explicit, reviewed migration outside the app.
4. Changing taxonomy while reusing existing IDs is blocked. For a genuinely new taxonomy, use a new ID namespace and review splits/lumps separately. The app will retain the older schedules as archived data rather than transfer knowledge to a different concept.
5. Apply the full replacement dataset only after reviewing the preview. Removed species disappear from active decks; their schedules and history remain available in full backups.

The importer rejects duplicate IDs, duplicate canonical scientific names, invalid species binomials, missing required metadata, and scientific aliases assigned to more than one active species. It never uses fuzzy name similarity to merge progress. Imported coverage statements and licenses are user supplied and are labelled unverified; validation checks structure and identity consistency, not the truth of every occurrence or taxonomic decision.

## Mandarin pronunciation

Audio uses browser Web Speech Synthesis. A Mandarin China (`zh-CN` / `cmn`) voice must be available. Choose a voice in Data & sources; voice options identify on-device voices where the browser supplies that information. Some voices may contact their vendor's service. Audio is not bundled, and its pronunciation is not an expert recording. English-front cards keep Listen disabled until the answer is revealed. Study works without speech support.

## Data and research

Read `SOURCES.md` for source selection, download links, the latest-source access limitation, geographic scope, taxonomy handling and a path to completing a newer national checklist. See `DATA_LICENSE.md` for attribution and reuse terms, and `data/coverage-report.json` for exact counts and the 82 rejected source-synonym links. The application code's MIT license does **not** override the dataset's noncommercial terms.

The four source records without an IOC or AviList English name are Caprimulgus centralasicus, Garrulax owstoni, Phylloscopus occisinensis and Strix davidi. AviList v2026 treats the last three as subspecies (of Garrulax canorus, Phylloscopus affinis and Strix uralensis) and does not list the first. Since v0.7 they carry the eBird name of the species eBird includes them in (Eurasian Nightjar, Chinese Hwamei, Tickell's Leaf Warbler, Ural Owl), supplied for this project and checked against the eBird Taxonomy; no name was guessed.

## Name corrections (AviList v2026)

**48 cards were corrected** because one of their names belonged to a different bird from the one recorded in China. The CAS baseline uses broad species; matching their scientific names to IOC gave English names of populations outside China, such as *Western* Cattle Egret for 牛背鹭 or Eurasian Magpie for 喜鹊. Each card keeps its ID, so saved progress stays with it.

- **40 concept corrections**: the scientific and English names become the AviList v2026 species recorded in China, e.g. 喜鹊 → *Pica serica*, Oriental Magpie; 牛背鹭 → *Ardea coromanda*, Eastern Cattle Egret; 苍鹰 → *Astur gentilis*, Eurasian Goshawk. The previous scientific name stays as an alias and the card is flagged for taxonomy review.
- **2 English-only corrections**: AviList keeps the broad species (紫水鸡 Purple Swamphen, 赤红山椒鸟 Scarlet Minivet); their eBird links point to the population recorded in China.
- **6 Chinese-name corrections**: the card's Chinese name was another species' name, e.g. 田鹨 is the Paddyfield Pipit, so *Anthus richardi* becomes 理氏鹨.
- **1 English name from eBird** (v0.6.1, by choice rather than as a correction): 黑头䴓 *Sitta villosa* uses the eBird name Snowy-browed Nuthatch; AviList, IOC and CBR call it Chinese Nuthatch. The builder checks the name against the pinned eBird snapshot.

Sources: AviList v2026 (scientific and English names, CC BY 4.0) with its Simplified Chinese names, the CBR Checklist of Birds of China v12.0 for China occurrence, and IOC 15.2 Chinese names. The full list with evidence is `source-notices/name-corrections-2026-11.json`. Not changed: genus moves (for example *Accipiter* → *Tachyspiza*), spelling differences, alternative Chinese names that belong to no other species, and species that are new or split off in the newer lists. Browsers that restored a backup or imported a dataset keep their stored copy until they import the new one.

## English names (eBird)

Since v0.7 the English name on each card is the common name of its species in the eBird Taxonomy snapshot that also drives the eBird links (`source-notices/ebird-reference-identifiers.json`, retrieved 18 November 2026). `scripts/build_dataset.py` matches each card exactly as the links do (`scripts/ebird_reference.py`): by scientific name (1,276 cards), by the China population for the two broad species above or a current genus combination kept as an alias (37), or by an English name that is unique in the whole eBird taxonomy (122). No fuzzy names are used. 241 of the 1,435 matched names changed; every change, with the IOC/AviList name it replaced, is listed in `source-notices/english-names-ebird.json`, and the replaced name also appears in the card's details. Scientific names still follow CAS 2023 with the AviList v2026 corrections, so a card can show an eBird English name next to a different genus (for example 寒鸦 Eurasian Jackdaw, *Corvus monedula*; eBird uses *Coloeus*).

Ten cards have no eBird species of their own: eBird includes them in a broader species. For these, `source-notices/english-names-manual.json` (filled in by the project owner on 19 November 2026) gives the broader species' eBird name, code and scientific name. The builder checks each against the eBird snapshot, rejects an entry for a card that already matches eBird, flags the card for taxonomy review, and links it to the broader species as a name-based eBird reference. Because the broader species has its own card, eight English names are shared by two or three cards; the English → Chinese front then shows the scientific name too. These ten cards take no Thai name by English match, so the broader species' card keeps its own.

## Thai bird names

`data/thai-names.json` gives the Thai name for 813 cards from the *Revised Checklist of Thai birds* (February 2025; 1,099 species, 1,096 with a Thai name). `scripts/build_thai_names.py` matches each card in three steps and records which one was used:

1. **scientific** (746): the card's scientific name equals the checklist's. For Grey-backed Thrush (灰背鸫), which the checklist lists without a Thai name, the name นกเดินดงหลังเทา was supplied for this project and is marked as such in the file.
2. **english** (64): the card's English name equals exactly one English name in the checklist, its own or one it lists from IOC, HBW-BirdLife, Clements or Howard & Moore. Most of these are genus changes (*Accipiter badius* → *Tachyspiza badia*). The twelve where the epithet differs too were checked one by one and are listed in the script, so any new case stops the build.
3. **reviewed** (3): 紫水鸡 (AviList keeps one swamphen species; the Thai list names the birds of Thailand and southern China Grey-headed Swamphen), 蓝枕花蜜鸟 (same species, newer genus) and 绿鹭 (the Thai list keeps Striated Heron in the wide sense; Asian birds are Little Heron).

Each checklist species is used once. Where the two lists divide a species differently, the card gets no Thai name rather than the name of another bird: for example 松鸦 Eurasian Jay is not given the name of White-faced Jay, and 蒙古沙鸻 Siberian Sand Plover is not given the name of Tibetan Sand Plover. Lesser Kestrel (黄爪隼) is on the checklist without a Thai name, so it stays blank. The Thai name is shown and searchable but is not part of saved datasets, CSV exports or backups.

## Verify or rebuild

Run the dependency-free application tests:

```sh
npm test
```

Thirty tests cover the complete source extraction count, name/search behavior (including grey/gray), directional scheduling and the 1 / 2 / 4 / 7-day intervals, new-card limits, CSV round trips, import conflicts and backup validation, group membership and group-progress backups, Name guide coverage, readings and attribution, and eBird reference matching, fallbacks and link placement, the reviewed name corrections, eBird English names for every matched card, and the Thai-name matches, search and storage. `VERIFICATION.md` records browser checks and limits.

To reproduce the bundled dataset, create a Python environment and install the build-only dependencies:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-data.txt
```

The full local download package supplies the pinned original files in `source-notices/`. The GitHub repository omits the four large original files; before rebuilding a clone, download them from the publisher links in `SOURCES.md` into that folder with the pinned filenames (`col-china-2023.zip`, `ioc-gbif-15.2.zip`, `ioc-13.1-multilingual.xlsx`, `avilist-v2026-extended.xlsx`). The builder checks their SHA-256 hashes before extracting anything. Run:

```sh
.venv/bin/python scripts/build_dataset.py
.venv/bin/python scripts/build_groups.py
.venv/bin/python scripts/build_thai_names.py
npm test
```

`build_thai_names.py` needs the Thai checklist workbook in `source-notices/thai-names/` (see the README there); it is not in the GitHub tree. Use `--sources-dir /absolute/path/to/inputs` to read the same pinned filenames from another directory. The build records SHA-256 hashes and uses no network access. Refreshing a source is a separate, explicit research step: inspect its license and version, adapt the extractor if needed, review unmatched concepts, and compare counts before importing the resulting file. No unreviewed automatic live update is performed.

## Files

`index.html` and `app/` contain the buildless application. `data/` holds the normalized learning dataset, coverage report, name guide, eBird links, character structure and Thai names. `scripts/` contains the local server and reproducible data extraction. `source-notices/` preserves metadata, the raw Aves extract, family-label snapshot and build-tool notices. Original ZIP/XLSX downloads are also included in the full local package, while the GitHub tree omits those three large files and retains their publisher URLs and hashes. `tests/` contains focused integrity and behavior checks. All visible bird names originate from those sources; there are no generated placeholder species, photos, or scraped bird images.

## GitHub Pages publishing

This repository is published from the root of the `main` branch with `.nojekyll`; all asset URLs are relative to the project folder. Future pushes to the publishing branch trigger a Pages rebuild. No credentials, browser progress or personal backups are committed. Code is MIT; source datasets keep their separate reuse terms in `DATA_LICENSE.md`.
