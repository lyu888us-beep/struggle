# Content licenses and attribution

## US Grade 1–9 word-pack data

This work contains adapted material from the Grade 1–9 English-US word packs in [Coderrob/spelling-bee-prep](https://github.com/Coderrob/spelling-bee-prep/tree/0e48bbdab4f35f109e5b7062db322dbbc7bf38f3/src/data/dictionaries/en-US). That project's [`THIRD_PARTY-NOTICES.md`](https://github.com/Coderrob/spelling-bee-prep/blob/0e48bbdab4f35f109e5b7062db322dbbc7bf38f3/THIRD_PARTY-NOTICES.md) identifies the word-pack source as the **Grundwortschatz English lexical dataset** by **cstr**: <https://huggingface.co/datasets/cstr/grundwortschatz-voc-en>.

- **License for the adapted word-pack data:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
- **Changes made:** selected Grades 1–9 from the upstream K–12 catalog; transformed the records into Lexio's bundled-wordbank format; assigned stable Lexio IDs and practice categories; restored the answer in masked usage examples for readable flashcards; added generic recall cues; and left entries without an upstream usage example without an invented example.
- **Grade placement:** Grades 1–6 retain the source's estimated grade placements. Grades 7–9 use the source project's heuristic progression. These are practice groupings, not a nationally official US grade-level list.
- **Share-alike:** the adapted US Grade 1–9 word-pack content is made available under CC BY-SA 4.0. Redistributed adaptations must retain attribution, identify changes, link the license, and be shared under the same license.

The exercise interface intentionally omits per-entry source labels. This legal notice preserves the required attribution and licensing information. The bundled wordbank is a mixed-source collection; this CC BY-SA 4.0 notice applies to the adapted US Grade 1–9 word-pack subset, not automatically to every other record in `original-site-wordbank.json`. The application code remains governed by its applicable software license.

## US Grade 1–9 phonetic transcriptions

The existing non-empty source phonetics were preserved. Missing transcriptions were filled from the **Carnegie Mellon Pronouncing Dictionary (CMUdict) 1.1.3**, using its US English ARPAbet pronunciations converted to broad General American IPA. Entries absent from CMUdict were supplied as explicit broad US IPA exceptions; the wordbank metadata records the coverage and source counts. The CMUdict data copyright, BSD-style redistribution terms, and disclaimer are reproduced in [`CMUDICT-LICENSE.txt`](CMUDICT-LICENSE.txt). The conversion is reproducible with `requirements-phonetics.txt` and `scripts/enrich_us_grade_phonetics.py`.
