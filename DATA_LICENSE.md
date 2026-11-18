# Data attribution and reuse

The MIT license applies to the application code. It does not relicense the bird database or the original source files.

The CAS-derived baseline and its adaptations retain **[Creative Commons Attribution–NonCommercial 4.0 International](https://creativecommons.org/licenses/by-nc/4.0/)** terms. Use this bundled database for noncommercial learning and research with attribution. A commercial product needs an appropriately licensed replacement baseline or permission from its rights holder. This prototype has no paid hosting, advertising or commercial deployment.

## CAS baseline

**The Biodiversity Committee of Chinese Academy of Sciences, Xu Z (2024). Catalogue of Life China 2023 Annual Checklist. Version 1.1. Chinese Academy of Sciences (CAS). Checklist dataset. https://doi.org/10.15468/ae6ush. Accessed 18 November 2026.**

Rights holder and publisher: Chinese Academy of Sciences. Explicit license: [publisher's Rights statement](https://www.gbifchina.org.cn/resource?r=chinacol2023), CC BY-NC 4.0. Original DwC-A is preserved in the full local package; EML metadata and the raw Aves extract are also tracked in GitHub under `source-notices/`.

Adaptations: extract accepted Aves species binomials; omit subspecies from study membership; normalize whitespace/Unicode and 鵰 → 雕; quarantine inconsistent synonym links; derive tone-marked Pinyin; attach separately attributed English-name references. CAS has not endorsed this app, these adaptations or the proposed English mappings.

## IOC names

**Gill F, Donsker D & Rasmussen P (eds). 2026. IOC World Bird List (v15.2). DOI https://doi.org/10.14344/IOC.ML.15.2.** Used via the [International Ornithologists Union's GBIF distribution](https://www.gbif.org/dataset/c696e5ee-9088-4d11-bdae-ab88daffab78), whose listed license is **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. Retrieved 18 November 2026. The package's own metadata identifies v15.2, issue date 2026-11-15 and CC-BY. Original CoLDP ZIP is included in the full local package; its metadata is also tracked in GitHub.

**Gill F, Donsker D & Rasmussen P (eds). 2023. IOC World Bird List (v13.1). DOI https://doi.org/10.14344/IOC.ML.13.1.** Historical multilingual workbook from the [official master-download collection](https://www.worldbirdnames.org/new/ioc-lists/master-list-2/). Historical names are attributed under **[CC BY 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)**, the legacy IOC attribution license. The original workbook, including its Sources sheet and contributor credits, is included in the full local package. GitHub retains its source link and hash rather than the large workbook. Only selected English names and reference scientific names are used in the derived learning dataset.

Adaptations: select name fields, join them to CAS source IDs, label crosswalk and historical-name candidates, and generate an audit report. IOC editors and contributors have not reviewed or endorsed these joins. Source IDs, source citations, original metadata and source hashes accompany the dataset; each derived record identifies its English-name source and method.

## Pinyin and other content

Pinyin was derived using **pypinyin 0.55.0** (mozillazg and contributors), an MIT-licensed build tool, plus explicit reading overrides documented in the builder. Its license is retained in `source-notices/pypinyin-MIT.txt`. The runtime app does not include the Python package. Dictionary-generated readings are marked unreviewed and should not be represented as an authoritative ornithological pronunciation standard.

No third-party bird images, recordings or descriptive field-guide text are bundled. The small generic feather icon and application styling were authored for this prototype.

When sharing an exported CSV, include this notice, source credits and the relevant source versions. CSV alone does not preserve the full bibliography. Full JSON dataset exports and full backups retain the metadata and citations. Do not remove the CAS noncommercial restriction or imply that the code's MIT license makes the bundled database commercially reusable. New source releases and user imports must be checked under their own terms; their licenses are not inferred from these older files.

## Family/group vocabulary added in v0.2

Chinese family labels are selected Wikidata structured data, released under [CC0 1.0](https://www.wikidata.org/wiki/Wikidata:Licensing). Every label is matched to an exact scientific-name (P225) statement; the retained snapshot is `source-notices/family-labels-wikidata.json`, with entity URLs. No Wikipedia article text is copied. English family labels come from the same explicitly CC BY 4.0 IOC 15.2 archive cited above, joined by family ID/name.

The Thai learning glosses, informal Chinese/English group vocabulary, group boundaries and application changes were authored for this prototype and are supplied under the code’s MIT license. They are learning aids, not a new national checklist or an expert-reviewed translation standard. Pinyin is generated using the already-credited MIT build tool. CAS species membership and member lists continue to carry the baseline’s CC BY-NC 4.0 restriction.

## Chinese character meanings added in v0.3

**CC-CEDICT, published by MDBG, and its contributors. Snapshot dated 18 November 2026, 03:25:44 UTC.** Downloaded from the [official CC-CEDICT download](https://www.mdbg.net/chinese/dictionary?page=cc-cedict), under **[CC BY-SA 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)**. Original CEDICT copyright 1997, 1998 Paul Andrew Denisowski. Exact selected source lines, the original attribution/license header and a checksum manifest are retained in `source-notices/name-guide/`. The app includes 473 character headwords, relevant word entries and source references; it does not redistribute the full dictionary.

Adaptations: select entries relevant to the bundled names; convert numbered Pinyin to tone marks; format cross-references; add selected Thai learning translations and compound annotations; sort exact contextual readings first in the display while retaining alternate readings. **The dictionary and these adaptations, including the Thai character/compound glosses, are shared under CC BY-SA 4.0.** They are supplied as a separate language dataset, not relicensed under the app's MIT license or the bird checklist's noncommercial license. MDBG and dictionary contributors have not endorsed or reviewed the app. The separately identified modern-usage gloss for 鵟 follows CAS bird-name evidence, retaining CC BY-NC 4.0 source terms.

Selected naming notes are brief app-authored factual paraphrases, with links to individual MOE dictionary entries and a Kinmen Daily explanation. Original pages retain their own rights; no page text, images or recordings are bundled. These authored notes are MIT; dictionary-derived literal glosses remain CC BY-SA 4.0. Labels explicitly distinguish literal interpretation, word usage, cultural belief, a source's explanation and folklore. Coverage of character definitions does not imply complete or verified historical etymology coverage.

## Outbound eBird references added in v0.3.2

**eBird / Cornell Lab of Ornithology. eBird Taxonomy reference API, species-only snapshot retrieved 18 November 2026.** Source: `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species`; [taxonomy documentation](https://support.ebird.org/en/support/solutions/articles/48000837816-the-ebird-taxonomy). The retained reference file records selected factual identifiers and short scientific/common names solely to construct outbound species links, with the original response SHA-256 and retrieval date. The full taxonomy, field-guide prose, media, observations and range information are not redistributed. No open license is asserted for the publisher's complete checklist, and the code's MIT license does not license the content reached on eBird. Cornell/eBird have not reviewed or endorsed these links.

The generated link decisions are app-authored reading references against the already-attributed CAS names. Exact scientific-name equality and unique source aliases are distinguished from English common-name candidates; none is a verified taxonomic concept migration. Unmatched cases link to Explore for manual lookup. Following an external link is required to view content on eBird under its own terms. No eBird account, credentials or personal observations are imported.
