# Name meanings, dictionary source, and editorial notes

`cc-cedict-subset.txt` retains exact source lines and the original copyright/license/date header from the official MDBG CC-CEDICT download. The 18 November 2026 snapshot is licensed **CC BY-SA 4.0**, by MDBG and CC-CEDICT contributors, with the original CEDICT credit to Paul Andrew Denisowski. `manifest.json` identifies the download URL, original compressed download SHA-256, snapshot date, subset hash and extraction rule. The full dictionary is not bundled: the retained subset suffices to reproduce this app's guide offline.

`editorial.json` contains selected English/Thai learning glosses, compound annotations, one separately sourced modern-usage entry for 鵟, and brief factual name notes with individual citations. Dictionary adaptations, including the English/Thai learning glosses and compound annotations, are **CC BY-SA 4.0**; the modern usage evidence from CAS remains **CC BY-NC 4.0**. App-authored factual notes are MIT. Linked publishers retain the rights to their original pages; no article text, dictionary page text, photographs or sound recordings from those pages are bundled. The notes are authored paraphrases, not translated reproductions of the pages.

The generated `data/name-guide.json` is a separate language pack. It does not change taxonomic membership, bird IDs, common names, schedules or progress. It covers all 474 distinct characters in the bundled species and term names: 473 CC-CEDICT character headwords and one explicit modern-usage gloss for 鵟. Selected Thai glosses cover 233 characters; all 474 have English meanings. Alternate readings and dictionary senses are retained. Exact contextual reading matches are sorted first, but the checklist's unreviewed Pinyin is never silently replaced by a guessed dictionary reading.

Only explicitly curated word units are shown as compounds. Generic dictionary substring matches are not treated as meaningful name parts. Dictionary bird names may use older taxonomies and are not substituted for the app's source checklist. Transliterated place names, personal names, bound forms and compounds should not be read as literal naming histories. Ten selected notes distinguish literal readings, usage, cultural explanations, source explanations and folklore. They do not claim that all naming origins have been verified.

Guide edition v2 adds parenthesized, tone-marked Pinyin to Chinese references in the authored explanations and explicit whole-word readings to all 49 curated compounds. Alternate readings are selected for the stated lexical context (for example 鸟 is niǎo in the woodpecker explanation); the original dictionary entries and checklist Pinyin are preserved.

The name guide is shipped with the app; it is not included in notebook backups. Backups preserve the bird/group datasets, settings and progress. Restored or imported names use the bundled guide and explicitly identify any uncovered character. Download the language JSON and this directory if preserving the exact guide edition matters.

Rebuild with Python 3, without dependencies or network access:

```sh
python3 scripts/build_name_guide.py
```

To extract a new official release, obtain the source from the [publisher's download page](https://www.mdbg.net/chinese/dictionary?page=cc-cedict), inspect its license, and run `python3 scripts/build_name_guide.py --cedict /absolute/path/to/cedict.txt.gz`. This deliberately updates the source manifest. Audit coverage, editorial readings, source changes and rights before publishing. Changing the bird checklist may require new character definitions and compound review; the builder refuses uncovered characters.
