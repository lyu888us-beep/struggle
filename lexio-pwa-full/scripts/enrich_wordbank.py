#!/usr/bin/env python3
"""Fill every bundled Lexio word with an example and a memory cue.

Real sentence/mnemonic fields are taken from the bundled, licensed study data
archive when an exact headword match is available. Remaining rows get an
explicitly generic, meaning-accurate study prompt (not a fabricated etymology).
Existing hand-curated Lexio records are never overwritten.
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORD_BANK = Path(__file__).resolve().parents[1] / "data" / "original-site-wordbank.json"
SOURCE_ARCHIVE = ROOT / "premium-english-learning-landing-page (1).zip"
SOURCE_FILES = {
    "雅思": "data_raw/IELTS_2.json",
    "考研": "data_raw/kaoyan_3/KaoYan_3.json",
    "四级": "data_raw/cet4_3/CET4_3.json",
    "六级": "data_raw/cet6_3/CET6_3.json",
}


def key_for(word: str) -> str:
    return re.sub(r"\s+", " ", str(word or "").strip()).casefold()


def read_source_rows(archive: zipfile.ZipFile) -> dict[str, list[dict[str, str]]]:
    by_word: dict[str, list[dict[str, str]]] = defaultdict(list)
    for category, member in SOURCE_FILES.items():
        raw = archive.read(member).decode("utf-8-sig")
        for line in raw.splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            headword = row.get("headWord", "")
            content = row.get("content", {}).get("word", {}).get("content", {})
            sentences = content.get("sentence", {}).get("sentences", [])
            sentence = next(
                (str(item.get("sContent", "")).strip() for item in sentences
                 if str(item.get("sContent", "")).strip()),
                "",
            )
            translation = next(
                (str(item.get("sCn", "")).strip() for item in sentences
                 if str(item.get("sCn", "")).strip()),
                "",
            )
            mnemonic = str(content.get("remMethod", {}).get("val", "")).strip()
            if key_for(headword) and (sentence or mnemonic):
                by_word[key_for(headword)].append({
                    "category": category,
                    "example": sentence,
                    "translation": translation,
                    "mnemonic": mnemonic,
                })
    return by_word


def primary_gloss(meaning: str) -> str:
    text = re.split(r"[；;。\n]", str(meaning or "").strip(), maxsplit=1)[0].strip()
    return text or "本词释义"


def choose_source(candidates: list[dict[str, str]], category: str) -> dict[str, str] | None:
    # Prefer the same exam list, then a source sentence for the same spelling.
    ordered = sorted(candidates, key=lambda item: (item["category"] != category, not bool(item["example"])))
    return next((item for item in ordered if item["example"] or item["mnemonic"]), None)


def main() -> int:
    if not SOURCE_ARCHIVE.exists():
        print(f"Missing source archive: {SOURCE_ARCHIVE}", file=sys.stderr)
        return 2

    payload = json.loads(WORD_BANK.read_text(encoding="utf-8"))
    records = [word for book in payload["books"] for word in book.get("words", [])]
    with zipfile.ZipFile(SOURCE_ARCHIVE) as archive:
        source_index = read_source_rows(archive)

    sourced_examples = 0
    sourced_mnemonics = 0
    generated_examples = 0
    generated_cues = 0
    for book in payload["books"]:
        category = str(book.get("category", ""))
        for word in book.get("words", []):
            candidates = source_index.get(key_for(word.get("word", "")), [])
            source = choose_source(candidates, category)
            gloss = primary_gloss(word.get("meaning", ""))

            if not str(word.get("example", "")).strip():
                if source and source["example"]:
                    word["example"] = source["example"]
                    word["exampleTranslation"] = source["translation"] or (
                        f"在本句中，“{word['word']}”表示“{gloss}”。"
                    )
                    word["exampleSource"] = f"dictionary:{source['category']}"
                    sourced_examples += 1
                else:
                    # A semantically honest fallback that teaches the gloss
                    # without inventing a usage or an etymology.
                    word["example"] = f'The word “{word["word"]}” means “{gloss}” in this context.'
                    word["exampleTranslation"] = f'在这个语境中，“{word["word"]}”表示“{gloss}”。'
                    word["exampleSource"] = "generated-gloss-prompt"
                    generated_examples += 1

            if not str(word.get("exampleTranslation", "")).strip():
                if source and source["translation"]:
                    word["exampleTranslation"] = source["translation"]
                else:
                    word["exampleTranslation"] = f'在这个语境中，“{word["word"]}”表示“{gloss}”。'

            if not str(word.get("mnemonic", "")).strip():
                if source and source["mnemonic"]:
                    word["mnemonic"] = source["mnemonic"]
                    word["mnemonicSource"] = f"dictionary:{source['category']}"
                    sourced_mnemonics += 1
                else:
                    word["mnemonic"] = (
                        f'回忆线索：先观察“{word["word"]}”的拼写，尝试回想“{gloss}”，'
                        "再遮住释义，用自己的话复述例句。"
                    )
                    word["mnemonicSource"] = "generated-recall-cue"
                    generated_cues += 1

    stats = payload.setdefault("metadata", {}).setdefault("stats", {})
    stats["withExample"] = sum(bool(str(word.get("example", "")).strip()) for word in records)
    stats["withExampleTranslation"] = sum(bool(str(word.get("exampleTranslation", "")).strip()) for word in records)
    stats["withMnemonic"] = sum(bool(str(word.get("mnemonic", "")).strip()) for word in records)
    stats["dictionaryExamplesAdded"] = sourced_examples
    stats["generatedGlossPromptsAdded"] = generated_examples
    stats["dictionaryMnemonicsAdded"] = sourced_mnemonics
    stats["generatedRecallCuesAdded"] = generated_cues
    payload["metadata"]["enrichment"] = {
        "source": "premium-english-learning-landing-page (1).zip dictionary sentence/remMethod fields",
        "generatedFallbackPolicy": "When no sourced sentence or memory method exists, use a gloss-based example prompt and an explicit retrieval-practice cue; no etymologies are invented.",
    }
    WORD_BANK.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    print(f"records={len(records)}")
    print(f"sourced examples added={sourced_examples}; generated example prompts={generated_examples}")
    print(f"sourced mnemonics added={sourced_mnemonics}; generated recall cues={generated_cues}")
    print(f"final with example={stats['withExample']}; translation={stats['withExampleTranslation']}; mnemonic={stats['withMnemonic']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
