# Source research and coverage audit

Research and downloads: **18 November 2026**. This document distinguishes an entire source snapshot from an entire up-to-date national avifauna. The app supplies the former, not the latter.

## Sources selected

| Source | Authority, download and terms | Role in this prototype |
| --- | --- | --- |
| **Catalogue of Life China 2023 Annual Checklist, v1.1** | Biodiversity Committee of the Chinese Academy of Sciences / Species 2000 China Node. [Publisher's metadata and explicit CC BY-NC 4.0 license](https://www.gbifchina.org.cn/resource?r=chinacol2023), [GBIF dataset / DOI](https://doi.org/10.15468/ae6ush), [Darwin Core Archive download](https://www.gbifchina.org.cn/archive.do?r=chinacol2023). | National membership baseline, CAS source UUIDs, Simplified Chinese names, scientific names, family/order, source synonym relationships. Full original download and metadata are preserved in the local package; the GitHub repository retains the metadata, raw bird extract, download URLs and hashes. |
| **IOC World Bird List v15.2, GBIF/CoLDP distribution** | Gill, Donsker & Rasmussen (eds), International Ornithologists Union. [Official master downloads](https://www.worldbirdnames.org/new/ioc-lists/master-list-2/), [registered dataset and CC BY 4.0 terms](https://www.gbif.org/dataset/c696e5ee-9088-4d11-bdae-ab88daffab78), [CoLDP ZIP](https://hosted-datasets.gbif.org/datasets/ioc.zip). The downloaded package identifies version 15.2 and issue date 2026-11-15. | English common names and reference scientific names. CAS national membership is never inferred from IOC global ranges. The archive's name and vernacular tables are joined by their IDs. |
| **IOC v13.1 multilingual archive** | Gill, Donsker & Rasmussen (eds), 2023. [DOI](https://doi.org/10.14344/IOC.ML.13.1), [official XLSX download](https://worldbirdnames.org/Multiling%20IOC%2013.1_c.xlsx). Historical IOC names are credited under the legacy CC BY 3.0 attribution terms. | A limited historical English-name fallback when the CAS name no longer matches v15.2. Original workbook and citation are retained. Every fallback is marked for taxonomy review; it does not modernize the CAS species concept. |

Original-file SHA-256 hashes are recorded in `data/birds.json` under `meta.sources`. The full local package includes these files in `source-notices/`, so it can be rebuilt without relying on mutable download URLs. The GitHub repository omits the three large ZIP/XLSX archives; a clone needs those publisher downloads before rebuilding, and the builder checks their hashes. No photos, illustrations, field-guide descriptions, audio recordings or occurrence records were taken from these sources.

License-evidence distinction: CAS and the current IOC GBIF distribution have explicit publisher/registry license statements. The historical IOC CC BY 3.0 attribution is a legacy project-wide term, corroborated by a [cached publisher footer](https://deets.feedreader.com/worldbirdnames.org) identifying that license for IOC v15.1. The currently retrieved official v13.1 download page does not repeat a version-specific license statement. That evidence is weaker than the current GBIF metadata; it should be confirmed directly with the IOC editors before a production release that requires per-version rights clearance. The prototype retains the legacy attribution and change notices rather than silently applying the newer package's CC BY 4.0 terms to the old workbook.

## Other authoritative or specialist sources investigated

| Source | Finding | Why it is not the bundled baseline |
| --- | --- | --- |
| **CAS Catalogue of Life China 2026** | [CAS announcement](https://sdr.cas.cn/swjs/gzdt/202605/t20260527_5111036.html) and [Species 2000 China downloads](http://www.sp2000.org.cn/download). The download page lists `动物界-脊索动物门-2026-10714.xlsx` and older releases. | The download workflow asks for real name, email, research field, institution, phone and CAPTCHA. It was not submitted. The 2026 file was not acquired, its bird content was not audited, and the 2023 GBIF license is not assumed to apply to that newer release. |
| **CBR Checklist of Birds of China v12.0 (2024)** | Relevant national bird-specific checklist; [China Bird Report's official site](https://www.birdreport.cn/) and specialist references identify the series. Community resource collections advertise XLS downloads. | A publisher-controlled, reusable download with explicit redistribution terms was not established in this session. Unofficial drive mirrors and scanned commercial books were not ingested. |
| **China Bird Gallery** | [Its own scope explanation](https://aviceda.org/zh/about.php) describes 1,501 species based on CBR v12.0, adjusted to AviList v2025, and explicitly says it omits later new records. | A useful comparison and illustration of version limits, not a complete contemporary national authority or a license-cleared source for bulk redistribution of names/images. Not ingested. |
| **AviList v2025** | [Official XLSX downloads and CC BY 4.0 terms](https://www.avilist.org/checklist/v2025/). Global taxonomy, taxonomic decision summaries and reference information. The page identifies this as an older release. | Superseded by v2026, which is used for the reviewed name corrections below. |
| **eBird alternate common names** | [Cornell's download and citation page](https://support.ebird.org/en/support/solutions/articles/48000804865-bird-names-in-ebird) provides a downloadable multilingual matrix. | Language support does not establish China membership, and a complete, scope-defined national snapshot with reusable terms was not acquired from it here. Not ingested. |

## Exact extraction result

The CAS DwC-A has 5,055 Aves records: 3,211 accepted records and 1,844 synonyms. Its format lacks an explicit rank column. All 1,445 accepted two-word binomials pass the species-name pattern used by the builder; the remaining 1,766 accepted bird records are subspecies and are excluded from flashcard membership. Synonyms are search aids, never additional species.

| Measure | Count |
| --- | ---: |
| Accepted CAS source species | 1,445 |
| Bundled species | 1,445 |
| Simplified Chinese field present | 1,445 |
| Tone-marked Pinyin field present | 1,445 |
| English-name field present / study cards available | 1,441 |
| Exact scientific-name match to IOC 15.2 | 1,294 |
| Exact historical scientific-name match to IOC 13.1 | 38 |
| Current Chinese-name + family candidates | 101 |
| Explicit genus/spelling combination candidates | 7 |
| Historical Chinese-name + family candidates | 1 |
| Unresolved English names | 4 |
| Records requiring taxonomy review, including unresolved ones | 151 |
| Rejected binomial synonym links | 82 |

The four unresolved names are **Caprimulgus centralasicus**, **Garrulax owstoni**, **Phylloscopus occisinensis**, and **Strix davidi**. The library preserves their Chinese name, Pinyin and scientific name, with English explicitly unresolved. They do not appear in learning queues.

**No percentage of contemporary national completeness is claimed.** Subtracting 1,445 from another checklist's total would not identify a valid missing-species count: taxon concepts, scope, record categories and dates differ. Even a full 2026 CAS download would need a bird-specific reconciliation before being described as every species ever recorded in the requested geography.

## Normalization and concept safety

1. Retain CAS accepted scientific names and UUIDs as the baseline identity, including historical combinations and source spelling errors. Normalize whitespace and Unicode; convert the traditional variant 鵰 to 雕 in the Simplified Chinese display while preserving the source form as an alias.
2. Extract every accepted source species once. Do not pad a count with generated names, subspecies, hybrids, unidentified birds or duplicate synonyms.
3. Attach IOC English names by exact scientific name where possible. Historical and cross-name candidates remain explicitly labelled. An exact name match itself is not proof of identical circumscription following a split or lump.
4. A unique Chinese name plus matching family only proposes an English-name crosswalk. It never merges two CAS IDs, replaces the source scientific name, or transfers review history. The corresponding IOC name is available in each record's detail panel.
5. Source synonyms with a different family, another accepted canonical species as their target name, or multiple target species are quarantined from search aliases. The 82 rejected links are inspectable in the report; this protects, for example, the suspicious Larus crassirostris → Sylvia crassirostris relationship. Safe aliases are deduplicated. Infraspecific names are not converted into additional species cards.
6. All Pinyin is generated with pypinyin 0.55.0 in tone-mark style, one syllable per character. Explicit overrides address common surname/colloquial defaults, including 燕, 雀, 冠, 长 and 藏. No unknown Han characters remain in the Pinyin fields, but dictionary coverage is not expert validation. The builder retains its full override list for review. Pronunciation uses orthographic citation tones, not a phonetic transcription of tone sandhi.

The data importer uses stable IDs and exact scientific-name checks. It blocks identity conflicts and cross-taxonomy updates that reuse IDs without an external, reviewed migration. It does not infer a species split/lump from common-name similarity.

## Scope and what remains to complete nationwide coverage

The selected CAS archive describes its geographic coverage as China and provides bounding coordinates; it does not supply the fine-grained per-record occurrence categories or regional completeness needed here. Taiwan-labelled names occur in the source, but this is not an independent Taiwan completeness audit. There are no authoritative province, residency, vagrant, introduced, escaped, extinct or “accepted national record” filters in the app because those fields were not supplied. The app does not fabricate them.

To complete a current national edition:

1. Obtain the newest CAS chordate workbook through its normal download workflow and establish that release's redistribution terms. Prefer a publisher-approved CBR national checklist as an independent bird-specific reference, with its own usable license.
2. Define the geographic scope explicitly, including Taiwan, Hong Kong, Macao and relevant islands/territories, and define the accepted record categories.
3. Reconcile national membership by source taxon identifiers and documented concept mappings. Have a bird taxonomist review splits, lumps, misapplied names and the flagged English candidates; audit all unmatched records instead of silently dropping them.
4. Have a Mandarin reader familiar with ornithological names review the Pinyin, especially polyphonic characters and uncommon bird-name characters.
5. Publish a new pinned release with source hashes, licenses, source and matched counts, exclusions, the actual remaining unmatched list, and an explicit coverage date. Import that release through the app's preview workflow. Preserve IDs only for unchanged concepts.

This work is intentionally left visible as a data-completion requirement rather than claiming a synthetic 1,500-species or “all current China birds” dataset.

## Family and group vocabulary (v0.2)

The separate `data/groups.json` adds 26 selected family labels and seven informal learning groups. It does not add any species. Chinese family labels are from the [Wikidata structured-data API](https://www.wikidata.org/w/api.php), using exact P225 scientific-name matches; entity URLs and selected labels are preserved in `source-notices/family-labels-wikidata.json`. Their reuse terms are [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing). English family labels are from the pinned IOC 15.2 VernacularName table (CC BY 4.0), joined to its family rows. Thai glosses and informal group rules are authored learning aids. All Pinyin remains dictionary-generated and unreviewed.

Wikipedia title redirects were used only to discover candidate entity IDs. They were not treated as taxon matches: genus/species redirects and other-family redirects were rejected unless P225 exactly matched the selected family. Only 26 checked families are offered as vocabulary cards; this is explicitly partial against the 109 family keys in the original CAS snapshot.

The common groups use explicit CAS family/genus keys. Ducks use the enumerated genera in the data, geese use Anser/Branta and swans use Cygnus; they do not overlap and account for all 54 source Anatidae species (38/13/3). Hawks/eagles include Accipitridae/Pandionidae, doves/pigeons include Columbidae, owls include Strigidae/Tytonidae, and woodpeckers include Picidae. The app does not transfer these group boundaries onto a different imported taxonomy without a mapping.

## Name meanings (v0.3)

The [official MDBG CC-CEDICT download](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) explicitly offers a downloadable dictionary under CC BY-SA 4.0. The retained source subset keeps its original header and unmodified entries. Its pinned manifest records the full compressed download SHA-256, release time (2026-11-18T03:25:44Z), subset hash and extraction rule. `scripts/build_name_guide.py` reproduces `data/name-guide.json` offline; the generated pack also hashes every input.

The guide covers all 475 distinct characters in this bundled edition: 474 dictionary headwords plus the separately labelled modern-usage gloss for 鵟 based on source bird names. There are 475 Thai character glosses (all characters), 291 selected English learning glosses, and 82 curated compound annotations, 52 of which are place names or words read as a single unit; a character before 氏 is treated as part of a personal name. All source senses and alternate readings remain accessible; learning glosses are dictionary adaptations rather than authoritative contextual translations. Dictionary bird names can follow older taxonomy and do not replace CAS names or identities. Imported data can exceed this language pack's character coverage and is marked accordingly.

Ten notes have individual source links. The happy-omen belief for 喜鹊 is a brief paraphrase of the [MOE 鵲 entry](https://dict.revised.moe.edu.tw/dictView.jsp?ID=6399&la=0&powerMode=0). The sex terms and figurative use of 鸳鸯 follow the [MOE concise dictionary](https://dict.concised.moe.edu.tw/dictView.jsp?ID=44683&la=0&powerMode=1). The cuckoo note describes the [recorded 望帝啼鵑 legend](https://dict.revised.moe.edu.tw/dictView.jsp?ID=162957&q=1&word=%E6%9C%9B), explicitly labelled folklore. A [Kinmen Daily article](https://www.kmdn.gov.tw/1117/1271/1277/553575/) explains 戴勝 by the old head-ornament sense and its crest; this is labelled a source explanation, not a traced first coinage. Other notes explain literal wording or lexical compounds from CC-CEDICT. No original article prose or illustrations are bundled. Definition coverage is complete for this bundled character set; verified naming-history coverage remains selected and partial.

## Outbound eBird links (v0.3.2)

The official eBird Taxonomy API returned 11,201 species records on 18 November 2026. Only the factual identifiers and short names needed for 1,417 outbound references are retained, with citation and the full response hash; the full taxonomy is not bundled. The official Cornell download page and eBird taxonomy help were also consulted. No website text, images, sounds, maps or observation data are copied. No runtime requests to the API or API keys are needed.

Matching priority is exact retained scientific name, then a unique source scientific alias, then an exact English common name after case/punctuation normalization. Counts are 1,272 / 20 / 125. Common-name references remain visibly labelled as candidates; scientific equality is also a name match rather than proof of concept equivalence. The 28 unmatched names receive an Explore link, not a fabricated species code. No fuzzy matching, guessed genus substitutions or automatic concept remapping is performed. Imports cannot reuse a common-name candidate after its source common name changes.

## Reviewed name corrections (v0.4)

**AviList Core Team. 2026. AviList: The Global Avian Checklist, v2026** (extended version, 20 October 2026; [DOI](https://doi.org/10.2173/avilist.v2026), CC BY 4.0) is pinned as `source-notices/avilist-v2026-extended.xlsx`. A Simplified Chinese export of the same release from avilist.org (its `Chinese (SIM)` column) supplied the Chinese names used for checking. China occurrence comes from **China Bird Report Ed. 2024. The CBR Checklist of Birds of China v12.0** (1,516 species, 18 December 2024), which is cited for individual names and row numbers but not redistributed: the file states a recommended citation and no reuse license. A newer CBR release could not be confirmed on birdreport.cn.

All 1,516 CBR species were mapped to 1,501 AviList species (1,465 by identical scientific name, 18 AviList lumps, 14 genus moves, 14 identical English names, 5 reviewed AviList splits). Every one of the 1,445 cards was then checked against that China list. 48 cards had a name that belonged to another bird and were corrected (40 concept, 2 English-only, 6 Chinese-only; the goshawk and sand plover splits were added in v0.5); afterwards no card's Chinese or English name is the name of another species in AviList, CBR or IOC 15.2. 15 cards whose genus changed (for example *Emberiza pallasi* → *Schoeniclus pallasi*) carry the current AviList combination as an alias, so search and eBird find them. Left unchanged by design: 168 cards whose scientific name differs from AviList only by a genus move, spelling or an AviList-only lump that CBR and IOC still split; 56 alternative Chinese names that belong to no other species; and 74 CBR species that have no card (new records, splits, and siblings left behind by the corrections, such as 欧亚喜鹊 *Pica pica*).

## Character structure (v0.5)

`data/character-structure.json` records, for all 475 characters, the stroke count from **Unicode Unihan 18.0.0** (`kTotalStrokes`, Unicode License V3) and the radical and construction from **Make Me a Hanzi** `dictionary.txt` (LGPL-3.0-or-later): 277 meaning-part + sound-part characters, 132 compounds of meaning and 40 pictographs. Eleven bird-name characters absent from Make Me a Hanzi (䳭 䴓 䴕 䴘 䴙 鳽 鵙 鵟 鹀 鹟 鹲) have authored entries: the bird radical plus the component that gives the reading. Make Me a Hanzi's origin hints for compounds and pictographs are shown as that project's explanations, with pinyin added after every Chinese character and Thai names after bird words; one hint was corrected (鸟 is the simplified form of 鳥, not 烏), and readings for the radical forms ⺼ ⺌ ⺈ and the component 辡 were supplied where Make Me a Hanzi lists none. The 239 Thai glosses added in v0.5 and the English learning glosses that replace surname-first dictionary senses are authored adaptations of CC-CEDICT senses for bird names. Other sources the project considered: the CCDB web API was not used because the app works without runtime requests; Thai Wiktionary was not used because its entries are uneven for these characters. See `source-notices/character-structure/README.md` for URLs, hashes and licenses.

## Thai bird names (v0.6)

Thai names come from the *Revised Checklist of Thai birds, February 2025* (workbook pinned by SHA-256 `ab09607f…9d5e`; 1,099 species, 1,096 with a Thai name). The checklist follows recent genus changes (for example *Tachyspiza*, *Anarhynchus*, *Hydrornis*) and lists the English names used by IOC 14.2, HBW-BirdLife 6, Clements 2023 and Howard & Moore 4.1 where they differ. `scripts/build_thai_names.py` matched 812 cards: 745 by scientific name, 64 by a unique English name (twelve with a different epithet, each reviewed: spelling variants such as *Anser cygnoid*/*cygnoides*, older valid names such as *Brachypodius melanocephalos*, and splits where the Thai list names the birds that occur in Thailand and China, such as Scarlet Minivet *Pericrocotus speciosus*) and 3 by hand (紫水鸡, 蓝枕花蜜鸟, 绿鹭). No checklist species is used twice.

Not matched on purpose, because the two lists divide the species differently: White-faced Jay (*Garrulus leucotis*) vs 松鸦 Eurasian Jay, Collared Babbler vs 白头鵙鹛 White-hooded Babbler, Tibetan Sand Plover vs 蒙古沙鸻 Siberian Sand Plover, Mongolian Gull vs 西伯利亚银鸥 Vega Gull, Indian Thick-knee vs 石鸻 Eurasian Stone-curlew, Mongolian Short-toed Lark vs 大短趾百灵 Greater Short-toed Lark, and Freckle-breasted Woodpecker vs 纹腹啄木鸟 Fulvous-breasted Woodpecker. Most other unmatched checklist species do not occur in China. Lesser Kestrel and Grey-backed Thrush are on the checklist without a Thai name.
