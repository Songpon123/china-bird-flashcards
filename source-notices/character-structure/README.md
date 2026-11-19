# Character structure sources

`data/character-structure.json` is built offline by `scripts/build_character_structure.py`
from two pinned files kept in this folder:

| File | Source | Retrieved | SHA-256 | License |
| --- | --- | --- | --- | --- |
| `makemeahanzi-dictionary.txt` | `dictionary.txt` from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), commit `618dbab8a8dd` (16 Oct 2018): <https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt> | 19 Nov 2026 | `744bb05d5b0742e9ee35c37791f94d56a173349b3367569e7ca11e510364d203` | LGPL-3.0-or-later (`LGPL-3.0.txt`, which incorporates `GPL-3.0.txt`) |
| `Unihan.zip` | Unicode Han Database, Unicode 18.0.0: <https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip> | 19 Nov 2026 | `4c93ea9c1f636451729a840978f1667a53886af37ba854fdcce109721c63d43e` | Unicode License V3 (`UNICODE-LICENSE-V3.txt`) |

Make Me a Hanzi's `dictionary.txt` is itself derived from Unihan and CJKlib.

What is used:

- **Make Me a Hanzi**: the radical and the `etymology` field, which says how each
  character is built: a meaning part plus a sound part (pictophonetic), a
  combination of meanings (ideographic) or a picture (pictographic), with a short
  English hint.
- **Unihan**: `kTotalStrokes` (stroke count).
- **Authored**: the structure of 11 bird-name characters that Make Me a Hanzi does
  not include (䳭 䴓 䴕 䴘 䴙 鳽 鵙 鵟 鹀 鹟 鹲, each 鸟/鳥 plus the part that gives the
  reading), and Thai meanings of the meaning parts.

`data/character-structure.json` is a modified subset of `dictionary.txt` and is
distributed under LGPL-3.0-or-later, with the Unicode notice for the stroke counts.
The two original files are omitted from the GitHub repository because of their size;
download them from the URLs above into this folder before rebuilding. The builder
checks both hashes and uses no network access.
