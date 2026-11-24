#!/usr/bin/env python3
"""Fill missing US Grade 1–9 word pronunciations with broad en-US IPA.

Install the pinned dictionary data with:
    python3 -m pip install -r requirements-phonetics.txt
Then run from lexio-pwa-full/:
    python3 scripts/enrich_us_grade_phonetics.py

Existing non-empty phonetic values are never overwritten. CMUdict's ARPAbet
stress is retained; 32 words absent from CMUdict 1.1.3 use explicit manual IPA.
"""
from __future__ import annotations

import argparse
import importlib.metadata
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

CMUDICT_VERSION = "1.1.3"
CMU_SOURCE = f"CMUdict {CMUDICT_VERSION} · ARPAbet→en-US IPA"
MANUAL_SOURCE = "manual broad en-US IPA"
GRADE_RE = re.compile(r"us-grade-[1-9]")

# Broad General American IPA. This notation matches the bundled wordbank's
# existing style (stress marks, no surrounding slashes or syllable dots).
VOWELS = {
    "AA": "ɑ", "AE": "æ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ",
    "EH": "ɛ", "EY": "eɪ", "IH": "ɪ", "IY": "i", "OW": "oʊ",
    "OY": "ɔɪ", "UH": "ʊ", "UW": "u",
}
CONSONANTS = {
    "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f",
    "G": "ɡ", "HH": "h", "JH": "dʒ", "K": "k", "L": "l",
    "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "r",
    "S": "s", "SH": "ʃ", "T": "t", "TH": "θ", "V": "v",
    "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
}

# CMUdict has no entry for these spellings. Values are broad US pronunciations;
# uncommon British spellings retain their spelling but use an en-US reading.
MANUAL_IPA = {
    "authorise": "ˈɔθəraɪz",
    "bathhouse": "ˈbæθhaʊs",
    "colourful": "ˈkʌlərfəl",
    "courgette": "kʊrˈʒɛt",
    "duvet": "duˈveɪ",
    "footballer": "ˈfʊtˌbɔlɚ",
    "hairdryer": "ˈhɛrˌdraɪɚ",
    "jeweller": "ˈdʒuəlɚ",
    "labourer": "ˈleɪbɚɚ",
    "masseur": "ˌmæsˈɝ",
    "mediaeval": "ˌmɪdiˈivəl",
    "memorise": "ˈmɛmɚaɪz",
    "minimise": "ˈmɪnəmaɪz",
    "motorway": "ˈmoʊtərˌweɪ",
    "offence": "əˈfɛns",
    "omelette": "ˈɑmlət",
    "organised": "ˈɔrɡənaɪzd",
    "penalise": "ˈpinəlaɪz",
    "pullover": "ˈpʊloʊvɚ",
    "pyjamas": "pəˈdʒɑməz",
    "referent": "ˈrɛfɚənt",
    "scythe": "saɪð",  # CMUdict lists an erroneous short-I/voiceless alternate first.
    "skilful": "ˈskɪlfəl",
    "socialise": "ˈsoʊʃəlaɪz",
    "stonework": "ˈstoʊnˌwɝk",
    "summarise": "ˈsʌmɚaɪz",
    "toothache": "ˈtuθeɪk",
    "tumour": "ˈtumɚ",
    "unselfish": "ʌnˈsɛlfɪʃ",
    "utilise": "ˈjutəlaɪz",
    "waistcoat": "ˈweɪskoʊt",
    "webcam": "ˈwɛbkæm",
    "windscreen": "ˈwɪndˌskrin",
}

# Context-sensitive/common en-US pronunciations where CMUdict lists more than
# one form. Indices are zero-based and refer to cmudict.dict()[word].
PRONUNCIATION_VARIANT_OVERRIDES = {
    "digest": 1,   # noun: ˈdaɪdʒɛst (not verb dɪˈdʒɛst)
    "incense": 1,  # noun: ˈɪnsɛns (not verb ɪnˈsɛns)
    "penalize": 1, # common US "PEE-nuh-lize" form
    "vivid": 1,    # common US short-I in both syllables
}


def arpabet_to_ipa(phones: list[str]) -> str:
    """Convert one CMUdict ARPAbet pronunciation to broad en-US IPA."""
    output: list[str] = []
    for phone in phones:
        match = re.fullmatch(r"([A-Z]+)([012]?)", phone)
        if not match:
            raise ValueError(f"Unrecognized CMUdict phone: {phone!r}")
        base, stress = match.groups()
        if base in VOWELS or base in {"AH", "ER"}:
            if stress == "1":
                output.append("ˈ")
            elif stress == "2":
                output.append("ˌ")
            if base == "AH":
                output.append("ə" if stress == "0" else "ʌ")
            elif base == "ER":
                output.append("ɚ" if stress == "0" else "ɝ")
            else:
                output.append(VOWELS[base])
        elif base in CONSONANTS and not stress:
            output.append(CONSONANTS[base])
        else:
            raise ValueError(f"Unsupported CMUdict phone: {phone!r}")
    return "".join(output)


def grade_words(payload: dict[str, Any]) -> list[dict[str, Any]]:
    books = [book for book in payload.get("books", []) if GRADE_RE.fullmatch(str(book.get("id", "")))]
    return [word for book in books for word in book.get("words", [])]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--wordbank",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "original-site-wordbank.json",
    )
    args = parser.parse_args()

    try:
        installed_version = importlib.metadata.version("cmudict")
    except importlib.metadata.PackageNotFoundError as error:
        raise SystemExit("Install the pinned CMUdict data first: python3 -m pip install -r requirements-phonetics.txt") from error
    if installed_version != CMUDICT_VERSION:
        raise SystemExit(f"Expected cmudict=={CMUDICT_VERSION}, found {installed_version}; refusing an unreviewed data change.")

    import cmudict

    pronunciations = cmudict.dict()
    payload = json.loads(args.wordbank.read_text(encoding="utf-8"))
    words = grade_words(payload)
    if len(words) != 2300:
        raise SystemExit(f"Expected 2,300 US grade words, found {len(words)}")

    added = Counter()
    for word in words:
        current = str(word.get("phonetic") or "").strip()
        spelling = str(word.get("word") or "").strip().lower()
        source_before = str(word.get("phoneticSource") or "")
        # Preserve all originally supplied values; allow the converter's own
        # generated value to be upgraded when a reviewed manual correction is
        # added later (currently scythe).
        if current and not (source_before in {CMU_SOURCE, MANUAL_SOURCE} and spelling in MANUAL_IPA):
            continue
        if spelling in MANUAL_IPA:
            ipa, source = MANUAL_IPA[spelling], MANUAL_SOURCE
        else:
            variants = pronunciations.get(spelling)
            if not variants:
                raise SystemExit(f"No CMUdict pronunciation or manual IPA for {spelling!r}")
            variant_index = PRONUNCIATION_VARIANT_OVERRIDES.get(spelling, 0)
            if variant_index >= len(variants):
                raise SystemExit(f"Pronunciation override {variant_index} is missing for {spelling!r}")
            ipa, source = arpabet_to_ipa(variants[variant_index]), CMU_SOURCE
        if not ipa or not re.search(r"[ɑæɔaɛeɪiouʊʌəɚɝ]", ipa):
            raise SystemExit(f"Invalid IPA generated for {spelling!r}: {ipa!r}")
        word["phonetic"] = ipa
        word["phoneticSource"] = source
        added[source] += 1

    missing = [str(word.get("word") or "") for word in words if not str(word.get("phonetic") or "").strip()]
    if missing:
        raise SystemExit(f"Missing IPA after enrichment: {', '.join(missing)}")

    source_counts = Counter(str(word.get("phoneticSource") or "existing source value") for word in words)
    metadata = payload.setdefault("metadata", {})
    metadata["phoneticEnrichment"] = {
        "source": f"Carnegie Mellon Pronouncing Dictionary (CMUdict) {CMUDICT_VERSION}, US English ARPAbet data",
        "converter": "scripts/enrich_us_grade_phonetics.py",
        "conversion": "Broad General American IPA; primary/secondary stress retained as ˈ/ˌ; AH0→ə and ER0→ɚ; other CMU phonemes mapped directly.",
        "multiplePronunciationPolicy": "Use the first en-US variant except for documented, context-sensitive overrides in the converter.",
        "cmudictEntries": source_counts[CMU_SOURCE],
        "manualEntries": source_counts[MANUAL_SOURCE],
        "preexistingEntriesPreserved": source_counts["existing source value"],
        "coverage": len(words),
        "cmudictMissingWords": sorted(set(MANUAL_IPA) - set(pronunciations)),
        "manualCorrections": sorted(set(MANUAL_IPA) & set(pronunciations)),
        "license": "CMUDICT-LICENSE.txt (CMU data BSD-style license)",
    }
    args.wordbank.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(metadata["phoneticEnrichment"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
