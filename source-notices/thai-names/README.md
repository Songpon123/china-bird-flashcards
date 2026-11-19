# Thai bird names: source

`data/thai-names.json` is built by `scripts/build_thai_names.py` from one workbook:

| File in this folder | Source | SHA-256 |
| --- | --- | --- |
| `thai-bird-checklist-2025-02.xlsx` | *Revised Checklist of Thai birds, February 2025*, sheet “Listing” (workbook supplied by the project owner as “Thai-bird-conservation-status 2.xlsx”; author in its metadata: Wachara Sanguansombat) | `ab09607f5698d9549f3c7e549b381f56ab6b8a5b37f4cc0bfacde74c635d9b5e` |

The workbook states no licence. It is kept only in the local project folder: it is listed in `.gitignore` and left out of the download package, so it is not redistributed. The app uses the Thai name of each matched species, with the checklist's scientific and English names for transparency, and credits the checklist.

Columns read: `Scientific name`, `Common name`, `Thai name`, and the English names in `IOC (v 14.2)`, `HBW and BirdLife (v 6)`, `Clements (v 2023)` and `Howard & Moore 4.1`. Conservation-status columns are not used.

To rebuild, place the workbook here under the filename above and run:

```sh
.venv/bin/python scripts/build_thai_names.py
```
