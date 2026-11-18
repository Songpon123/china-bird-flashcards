# 羽 Yǔ — China Bird Flashcards

A runnable, local-first prototype for learning bird names in Simplified Chinese, tone-marked Hanyu Pinyin, English and scientific Latin. No API key, account, database server, package installation or internet connection is needed to study the bundled data.

**Coverage is deliberately limited and visible: this is not a complete inventory of every species recorded in China as of 2026.** It includes every one of the **1,445 accepted species binomials** in the downloaded **Catalogue of Life China 2023 v1.1** archive. **1,441 have all four study fields**; four unresolved English names remain in the library and are excluded from study. There are **151 records flagged for taxonomy review**, including those four. Pinyin is dictionary-generated, with reading overrides, and has not had a complete expert audit.

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
- **Spaced review + new cards** presents due cards first, followed by up to 20 new cards per day per direction by default. Set the limit to zero for reviews only. New allowances reset at local midnight; existing due times use elapsed time.
- Reveal a card, then choose Again, Hard, Good or Easy. The proposed interval appears on each button. The app does not grade typed answers or automatically claim that a word is mastered.
- **Browse & practice freely** explores the filtered checklist without changing schedules. Library rows can open individual birds in practice mode.
- Search accepts Chinese, English, scientific names, safe aliases, and Pinyin with or without tones or spaces. `lvtouya`, `lu: tou ya` and `lǜ tóu yā` all find 绿头鸭.
- Filter by order, family, progress, or whether a record requires taxonomy review. Optional front-side Pinyin is a hint you can turn off.
- Keyboard: Space reveals the answer; 1/2/3/4 rates it; Right Arrow skips forward. Text fields retain normal typing behavior. Previous is available in practice mode.
- **Undo last review** reverses the latest review in the current tab, including its daily-new count. Undo is not retained after a reload or dataset update.

### Schedule

The prototype uses a small, documented SM-2-inspired heuristic, not FSRS and not the original SM-2 algorithm. Again returns in one minute and resets the success streak; Hard starts at one day, then multiplies the previous interval by 1.2; Good starts at one day, then six days, then multiplies by ease; Easy starts at four days, then multiplies by ease × 1.3. Ease starts at 2.5, is bounded to 1.3–4, decreases on Again/Hard and increases on Easy. Intervals are shown before grading. “Mature” means a 21-day-or-longer interval.

## Family and group vocabulary

Open **Families & groups** for 33 additional terms: **26 selected family names** out of the baseline’s 109 families, plus **7 common-name learning groups**. These terms do not increase the 1,445-species count. Select the family/group card deck in Study for reversible, separately scheduled vocabulary cards. The daily new-card allowance is shared between both decks within each direction.

Examples: 鹰科 **yīng kē** (Accipitridae), 鸠鸽科 **jiū gē kē** (Columbidae), 鸭科 **yā kē** (Anatidae), 鸭类 **yā lèi** (ducks), 雁类 **yàn lèi** (wild geese). The informal groups include hawks/eagles, doves/pigeons, ducks, geese, swans, owls and woodpeckers. Wild geese use 雁; the everyday/domestic-goose word 鹅 (é) has a different scope.

Each term has a Thai learning gloss, pronunciation controls during study, provenance and a button to view member species. Membership follows explicit source family/genus rules: ducks 38, geese 13, swans 3, together partitioning the 54 source Anatidae records. A common name containing “goose” does not itself determine membership. Different-taxonomy imports disable these membership links until a reviewed mapping is supplied. Other families retain their scientific names without guessed Chinese translations.

Full backups include the vocabulary snapshot and schedules. Older backups remain supported and use the app’s bundled vocabulary. Species CSV/JSON imports update the species deck; updating group definitions requires a reviewed app/data release.

## Character meanings and selected name stories

All menus and controls use English. The **Name guide** explains all **474 distinct Chinese characters** used in the bundled 1,445 species names and 33 family/group terms. **473 character headwords come from the official CC-CEDICT snapshot; one modern-usage gloss for 鵟 is separately attributed to the CAS checklist.** English meanings cover all 474; selected Thai learning glosses cover **233**. General dictionary senses and alternate readings remain available in expandable sections. Source text, selected English learning glosses, Thai translations and formatting adaptations are attributed under **CC BY-SA 4.0**, separately from the bird dataset and app code.

Search a Chinese name, English bird name, Pinyin, or a character. Example buttons open 白鹭, 喜鹊, 鸳鸯, 戴胜 and 杜鹃. The guide distinguishes **literal reading, word usage, cultural explanation, source explanation and folklore**. There are **10 selected notes**, not a complete history of all bird names. Names without a sourced note say so. Curated word units preserve compounds such as 伯劳, 鹡鸰 and 䴙䴘 and place-name transliterations; a dictionary substring is never automatically asserted to explain a naming origin. 氏 prompts a personal-name caution without inventing the commemorated person's identity.

After revealing a flashcard, expand **Understand this name · meanings & story**. Definitions are hidden while the answer is hidden, in both study directions. Library and family/group details also include the guide. The language pack changes no bird IDs, schedules, dataset membership or saved progress. Imported/restored names use the bundled guide and explicitly identify any uncovered characters. Notebook backups retain datasets and progress; the app-bundled language pack is not copied into backups. Preserve `data/name-guide.json` and `source-notices/name-guide/` separately to keep an exact guide edition.

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

The four unresolved source records are Caprimulgus centralasicus, Garrulax owstoni, Phylloscopus occisinensis and Strix davidi. They are not silently dropped or supplied with guessed English names.

## Verify or rebuild

Run the dependency-free application tests:

```sh
npm test
```

Eleven tests cover the complete source extraction count, name/search behavior, directional scheduling, new-card limits, CSV round trips, import conflicts and backup validation, including group membership and group-progress backups. `VERIFICATION.md` records browser checks and limits.

To reproduce the bundled dataset, create a Python environment and install the build-only dependencies:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-data.txt
```

The full local download package supplies the pinned original files in `source-notices/`. The GitHub repository omits the three large original archives; before rebuilding a clone, download the files from the publisher links in `SOURCES.md` into that folder with the pinned filenames (`col-china-2023.zip`, `ioc-gbif-15.2.zip`, `ioc-13.1-multilingual.xlsx`). The builder checks their SHA-256 hashes before extracting anything. Run:

```sh
.venv/bin/python scripts/build_dataset.py
.venv/bin/python scripts/build_groups.py
npm test
```

Use `--sources-dir /absolute/path/to/inputs` to read the same pinned filenames from another directory. The build records SHA-256 hashes and uses no network access. Refreshing a source is a separate, explicit research step: inspect its license and version, adapt the extractor if needed, review unmatched concepts, and compare counts before importing the resulting file. No unreviewed automatic live update is performed.

## Files

`index.html` and `app/` contain the buildless application. `data/` holds the normalized learning dataset and coverage report. `scripts/` contains the local server and reproducible data extraction. `source-notices/` preserves metadata, the raw Aves extract, family-label snapshot and build-tool notices. Original ZIP/XLSX downloads are also included in the full local package, while the GitHub tree omits those three large files and retains their publisher URLs and hashes. `tests/` contains focused integrity and behavior checks. All visible bird names originate from those sources; there are no generated placeholder species, photos, or scraped bird images.

## GitHub Pages publishing

This repository is published from the root of the `main` branch with `.nojekyll`; all asset URLs are relative to the project folder. Future pushes to the publishing branch trigger a Pages rebuild. No credentials, browser progress or personal backups are committed. Code is MIT; source datasets keep their separate reuse terms in `DATA_LICENSE.md`.
