# Content licenses and attribution

## US Grade 1–9 word-pack data

This work contains adapted material from the Grade 1–9 English-US word packs in [Coderrob/spelling-bee-prep](https://github.com/Coderrob/spelling-bee-prep/tree/0e48bbdab4f35f109e5b7062db322dbbc7bf38f3/src/data/dictionaries/en-US). That project's [`THIRD_PARTY-NOTICES.md`](https://github.com/Coderrob/spelling-bee-prep/blob/0e48bbdab4f35f109e5b7062db322dbbc7bf38f3/THIRD_PARTY-NOTICES.md) identifies the word-pack source as the **Grundwortschatz English lexical dataset** by **cstr**: <https://huggingface.co/datasets/cstr/grundwortschatz-voc-en>.

- **License for the adapted word-pack data:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
- **Changes made:** selected Grades 1–9 from the upstream K–12 catalog; transformed the records into Lexio's bundled-wordbank format; assigned stable Lexio IDs and practice categories; restored the answer in masked usage examples for readable flashcards; added generic recall cues; and left entries without an upstream usage example without an invented example.
- **Grade placement:** Grades 1–6 retain the source's estimated grade placements. Grades 7–9 use the source project's heuristic progression. These are practice groupings, not a nationally official US grade-level list.
- **Share-alike:** the adapted US Grade 1–9 word-pack content is made available under CC BY-SA 4.0. Redistributed adaptations must retain attribution, identify changes, link the license, and be shared under the same license.

The exercise interface intentionally omits per-entry source labels. This legal notice preserves the required attribution and licensing information. The bundled wordbank is a mixed-source collection; this CC BY-SA 4.0 notice applies to the adapted US Grade 1–9 word-pack subset, not automatically to every other record in `original-site-wordbank.json`. The application code remains governed by its applicable software license.

## US Grade 1–9 Chinese meanings

The English glosses in the 2,300 US Grade 1–9 records are retained as `meaningEn` for audit and migration; the card-facing `meaning` values are Chinese. Candidate glosses were derived from [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) at commit `39cfb9672c0906b63569e0453c2e6abfb9ab182a` (CSV SHA-256 `d1ecbdf9ee2b920afb6f430ca6b6bb9f559588cf0dff86e04bd255f9390843cc`), filtered by the pack's part of speech, then checked against the ECDICT lemma where needed. Three entries reuse same-spelling/same-POS glosses already in Lexio's local wordbank; 72 word-specific overrides address known POS, sense, or form mismatches. The source revision and method counts are recorded in `original-site-wordbank.json` and `us-grade-chinese-meanings.json`; `scripts/build_us_grade_meanings.py` regenerates the data from the pinned CSV and checksum. The source repository's MIT notice is reproduced in [`ECDICT-LICENSE.txt`](ECDICT-LICENSE.txt).

**Provenance caveat:** ECDICT's README says its dictionary combines several upstream sources (including EDictAZ, cdict, WordNet, and community additions), but this revision does not provide per-entry source/license metadata. The repository-level MIT license is therefore recorded for attribution, but it has not independently established the redistribution terms of every underlying gloss. The generated glosses are dictionary candidates, not 2,300 independently native-speaker-certified translations; the 72 targeted overrides do not constitute a complete manual semantic audit. Resolve both points before treating this as fully cleared, fully reviewed production content.

## US Grade 1–9 phonetic transcriptions

The existing non-empty source phonetics were preserved. Missing transcriptions were filled from the **Carnegie Mellon Pronouncing Dictionary (CMUdict) 1.1.3**, using its US English ARPAbet pronunciations converted to broad General American IPA. Entries absent from CMUdict were supplied as explicit broad US IPA exceptions; the wordbank metadata records the coverage and source counts. The CMUdict data copyright, BSD-style redistribution terms, and disclaimer are reproduced in [`CMUDICT-LICENSE.txt`](CMUDICT-LICENSE.txt). The conversion is reproducible with `requirements-phonetics.txt` and `scripts/enrich_us_grade_phonetics.py`.
