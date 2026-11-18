# Verification record

Checked locally on 18 November 2026. This is a runnable prototype, not an expert-reviewed national taxonomic edition.

## Source integrity and reproduction

- Original source archives are preserved with SHA-256 hashes in the dataset metadata. The builder refuses files whose hashes differ from the pinned releases.
- Independently compared the source IDs of every accepted, two-word Aves record in the original CAS archive with the bundled IDs: identical sets, 1,445 species, no missing or extra source species.
- Rebuilt from the included original files using Python, openpyxl 3.1.5 and pypinyin 0.55.0. The normalized dataset, coverage report and raw Aves extract were byte-identical before and after rebuilding.
- Dataset SHA-256: `da4361a0465e9986b461aded863f5344dc9b6ba1fa653a0ef988393e375fb630`.
- Coverage report SHA-256: `0c8f5151c23252e97861dd2a6981914b550f3ff7b358ace835ef8ab09f90ca31`.

## Automated checks

`npm test`: **8 passed, 0 failed**. Tests cover bundled-data integrity, tone-marked Pinyin and search variants, review intervals and lapses, independent directions, due-card ordering and daily limits, quoted CSV round trips, unsafe import identities, taxonomy updates and backup validation. A full 1,445-record CSV export/import round trip also preserved the normalized records.

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

Eleven automated tests now pass, including the complete 54-species duck/goose/swan partition, Thai and Pinyin family search, reserved ID safety, term progress and full vocabulary backups, plus compatibility with older backups. New source labels were checked against exact Wikidata P225 scientific names; the group builder checks the pinned input hashes.

Browser checks: the duck shortcut opened exactly 38 source species; a family term displayed 鸭科 / yā kē / Ducks, Geese, Swans / Anatidae; recording Good scheduled it for tomorrow; Undo removed only that test review; the reverse card displayed English first. Free practice kept rating controls disabled. Existing species progress was retained. Phone 390 × 844 and iPad 768 × 1024 viewport overrides produced effective content widths of 375 and 753 pixels respectively, with no document overflow. These were browser viewport checks, not tests on physical Apple hardware.

The public Pages edition uses relative URLs and a root `.nojekyll` file. Home Screen support is supplied through a web manifest; no offline cache or cloud synchronization is claimed.
