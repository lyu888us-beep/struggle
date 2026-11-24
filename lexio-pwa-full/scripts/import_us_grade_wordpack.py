#!/usr/bin/env python3
"""Import the selected US Grades 1-9 word packs into Lexio's bundled wordbank.

Usage:
    python3 scripts/import_us_grade_wordpack.py /path/to/spelling-bee-prep

The source JSON files are read from src/data/dictionaries/en-US/grade-{1..9}.json.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

EXPECTED_COUNTS = {1: 175, 2: 175, 3: 250, 4: 250, 5: 250, 6: 300, 7: 300, 8: 300, 9: 300}
GRADE_BOOK_PREFIX = "us-grade-"
RETIRED_FIELDS = (
    "id",
    "word",
    "category",
    "meaning",
    "example",
    "exampleSource",
    "exampleTranslation",
    "mnemonic",
    "mnemonicSource",
    "phonetic",
    "pos",
)


def read_source_books(source_repo: Path) -> list[dict[str, Any]]:
    source_dir = source_repo / "src" / "data" / "dictionaries" / "en-US"
    books: list[dict[str, Any]] = []
    for grade, expected_count in EXPECTED_COUNTS.items():
        path = source_dir / f"grade-{grade}.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        if str(payload.get("gradeLevel")) != str(grade):
            raise ValueError(f"Unexpected gradeLevel in {path}")
        source_words = payload.get("words")
        if not isinstance(source_words, list) or len(source_words) != expected_count:
            raise ValueError(f"Expected {expected_count} entries in {path}")

        words: list[dict[str, Any]] = []
        seen_spellings: set[str] = set()
        for item in source_words:
            spelling = str(item.get("word", "")).strip().lower()
            if not re.fullmatch(r"[a-z]{2,24}", spelling) or spelling in seen_spellings:
                raise ValueError(f"Invalid or duplicate spelling in {path}: {spelling!r}")
            seen_spellings.add(spelling)
            definition = str(item.get("definition", "")).strip()
            if not definition or re.search(r"[\u3400-\u9fff]", definition):
                raise ValueError(f"Missing or non-English definition for {spelling!r}")

            record: dict[str, Any] = {
                # Stable app IDs keep learning progress tied to the same word.
                "id": f"school-us{grade}-{spelling}",
                "word": spelling,
                "gradeLevel": str(grade),
                "difficulty": str(item.get("difficulty", "")).strip(),
                "meaning": definition,
                "pos": str(item.get("partOfSpeech", "")).strip(),
                "syllableCount": item.get("syllableCount"),
                "spellingPatterns": item.get("spellingPatterns", []),
                # A generic retrieval cue is not an etymology or source note.
                "mnemonicSource": "generated-recall-cue",
            }
            phonetic = item.get("phonetic")
            if isinstance(phonetic, str) and phonetic.strip():
                record["phonetic"] = phonetic.strip()
            phonetic_source = item.get("phoneticSource")
            if isinstance(phonetic_source, str) and phonetic_source.strip():
                record["phoneticSource"] = phonetic_source.strip()

            usage_example = item.get("usageExample")
            if isinstance(usage_example, str) and usage_example.strip():
                # Source examples are supplied with the target spelling blanked.
                # Lexio's flashcard is not a spelling quiz, so restore the word
                # for a readable usage sentence; leave absent examples absent.
                example = re.sub(r"_+", spelling, usage_example.strip())
                if "_" in example:
                    raise ValueError(f"Unfilled answer blank in example for {spelling!r}")
                record["example"] = example
                record["mnemonic"] = f"遮住释义，读例句，再尝试回忆 {spelling} 的意思和拼写。"
            else:
                record["mnemonic"] = f"遮住释义，先尝试回忆 {spelling} 的意思和拼写，再核对释义。"

            words.append(record)

        category = f"美国{grade}年级"
        books.append(
            {
                "id": f"{GRADE_BOOK_PREFIX}{grade}",
                "title": f"美国 {grade} 年级练习词包",
                "category": category,
                "wordCount": len(words),
                "words": words,
            }
        )
    return books


def retired_record(word: dict[str, Any], category: str) -> dict[str, Any]:
    record = {**word, "category": category}
    # Compare normalized fields only, so a user's edits to a former sample word
    # are retained during upgrade instead of being mistaken for the stock row.
    return {field: str(record.get(field) or "") for field in RETIRED_FIELDS}


def update_wordbank(wordbank_path: Path, source_books: list[dict[str, Any]]) -> dict[str, Any]:
    wordbank = json.loads(wordbank_path.read_text(encoding="utf-8"))
    metadata = wordbank.setdefault("metadata", {})
    old_us_books = [book for book in wordbank["books"] if book.get("id", "").startswith(GRADE_BOOK_PREFIX)]
    retired = list(metadata.get("retiredBundledWords", []))
    retired_by_id = {item.get("id"): item for item in retired}

    # Preserve the original 10-word demo rows for a guarded, ID-based removal
    # from users who already installed the previous bundle. Re-running this
    # importer on its own output is idempotent.
    for book in old_us_books:
        rows = book.get("words", [])
        if not rows or all(row.get("difficulty") and row.get("gradeLevel") for row in rows):
            continue
        for row in rows:
            record = retired_record(row, str(book.get("category", "")))
            retired_by_id.setdefault(record["id"], record)
    metadata["retiredBundledWords"] = list(retired_by_id.values())

    # The upstream spelling list may still omit pronunciations supplied by
    # Lexio's phonetic-enrichment pass. Keep those stable-ID values on later
    # imports unless the upstream record provides its own non-empty phonetic.
    old_us_by_id = {
        str(row.get("id", "")): row
        for book in old_us_books
        for row in book.get("words", [])
        if row.get("id")
    }
    for book in source_books:
        for row in book.get("words", []):
            previous = old_us_by_id.get(str(row.get("id", "")))
            if not previous or (isinstance(row.get("phonetic"), str) and row["phonetic"].strip()):
                continue
            old_phonetic = previous.get("phonetic")
            if isinstance(old_phonetic, str) and old_phonetic.strip():
                row["phonetic"] = old_phonetic
                old_source = previous.get("phoneticSource")
                if isinstance(old_source, str) and old_source.strip():
                    row["phoneticSource"] = old_source

    inserted = False
    books: list[dict[str, Any]] = []
    for book in wordbank["books"]:
        if book.get("id", "").startswith(GRADE_BOOK_PREFIX):
            if not inserted:
                books.extend(source_books)
                inserted = True
            continue
        books.append(book)
    if not inserted:
        books.extend(source_books)
    wordbank["books"] = books

    all_words = [word for book in books for word in book.get("words", [])]
    ids = [str(word.get("id", "")) for word in all_words]
    if len(ids) != len(set(ids)):
        raise ValueError("The merged wordbank contains duplicate IDs")

    stats = metadata.setdefault("stats", {})
    stats["importedEntries"] = len(all_words)
    stats["distinctSpellingsAcrossBooks"] = len(
        {str(word.get("word", "")).strip().casefold() for word in all_words if word.get("word")}
    )
    stats["withMeaning"] = sum(bool(str(word.get("meaning", "")).strip()) for word in all_words)
    stats["withMnemonic"] = sum(bool(str(word.get("mnemonic", "")).strip()) for word in all_words)
    stats["withExample"] = sum(bool(str(word.get("example", "")).strip()) for word in all_words)
    stats["withExampleTranslation"] = sum(
        bool(str(word.get("exampleTranslation", "")).strip()) for word in all_words
    )
    metadata["schoolRecords"] = sum(str(word.get("id", "")).startswith("school-") for word in all_words)

    wordbank_path.write_text(
        json.dumps(wordbank, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    return {
        "gradeCounts": {book["category"]: len(book["words"]) for book in source_books},
        "retiredPlaceholderRows": len(metadata["retiredBundledWords"]),
        "importedEntries": stats["importedEntries"],
        "distinctSpellingsAcrossBooks": stats["distinctSpellingsAcrossBooks"],
        "withExample": stats["withExample"],
        "withoutExample": stats["importedEntries"] - stats["withExample"],
        "schoolRecords": metadata["schoolRecords"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_repo", type=Path, help="Checkout of Coderrob/spelling-bee-prep")
    parser.add_argument(
        "--wordbank",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "original-site-wordbank.json",
    )
    args = parser.parse_args()
    summary = update_wordbank(args.wordbank, read_source_books(args.source_repo))
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
