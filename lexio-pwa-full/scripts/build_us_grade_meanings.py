#!/usr/bin/env python3
"""Build and apply Chinese meanings for the US Grade 1–9 word pack.

Use the pinned ECDICT CSV (see data/CONTENT-LICENSES.md):
    python3 scripts/build_us_grade_meanings.py /path/to/ecdict.csv

The script selects dictionary meanings by the pack's part of speech, falls back
through ECDICT's lemma field when needed, applies the small reviewed override
file, and keeps each original upstream English definition as `meaningEn`.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

SOURCE_NAME = "ECDICT 简明英汉词典"
SOURCE_REPOSITORY = "https://github.com/skywind3000/ECDICT"
SOURCE_REVISION = "39cfb9672c0906b63569e0453c2e6abfb9ab182a"
SOURCE_FILE_SHA256 = "d1ecbdf9ee2b920afb6f430ca6b6bb9f559588cf0dff86e04bd255f9390843cc"
SOURCE_LICENSE = "MIT License; see data/ECDICT-LICENSE.txt"
ECDICT_MEANING_SOURCE = f"ECDICT · {SOURCE_REVISION[:12]} · 按词性筛选的中文释义"
GRADE_RE = re.compile(r"us-grade-[1-9]")
CJK_RE = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")

# ECDICT translation-line labels grouped into the parts of speech used by the
# upstream US pack. Unknown/domain-only labels are not treated as POS matches.
POS_LABELS = {
    "n": "noun",
    "pl": "noun",
    "v": "verb",
    "vt": "verb",
    "vi": "verb",
    "vbl": "verb",
    "a": "adjective",
    "adj": "adjective",
    "s": "adjective",
    "adv": "adverb",
    "ad": "adverb",
    "r": "adverb",
    "pron": "other",
    "pro": "other",
    "prep": "other",
    "conj": "other",
    "int": "other",
    "interj": "other",
    "art": "other",
    "det": "other",
    "abbr": "other",
    "num": "other",
    "aux": "other",
}
TAGGED_LINE_RE = re.compile(r"^((?:[A-Za-z]+\.\s*(?:&|/)?\s*)+)(.*)$")
EXCHANGE_LEMMA_RE = re.compile(r"(?:^|/)0:([^/]+)")
INFLECTION_NOTE_RE = re.compile(
    r"[（(][^）)]*(?:的复数|复数形式|名词复数|过去式|过去形式|过去分词|现在分词|ing形式|第三人称单数|三单|比较级|最高级|动名词)[^）)]*[）)]"
)
INLINE_INFLECTION_RE = re.compile(
    r"[A-Za-z][A-Za-z'-]*的(?:复数|复数形式|名词复数|过去式|过去形式|过去分词|现在分词|ing形式|第三人称单数|三单|比较级|最高级|动名词)"
)


def project_data_path(name: str) -> Path:
    return Path(__file__).resolve().parents[1] / "data" / name


def load_grade_words(wordbank_path: Path) -> list[dict[str, Any]]:
    payload = json.loads(wordbank_path.read_text(encoding="utf-8"))
    words = [
        word
        for book in payload.get("books", [])
        if GRADE_RE.fullmatch(str(book.get("id", "")))
        for word in book.get("words", [])
    ]
    if len(words) != 2300:
        raise SystemExit(f"Expected 2,300 US grade words, found {len(words)}")
    return words


def normalize_pos(value: str) -> set[str]:
    value = str(value or "").strip().casefold()
    aliases = {
        "noun": "noun", "n": "noun", "n.": "noun", "pl": "noun",
        "verb": "verb", "v": "verb", "v.": "verb", "vt": "verb", "vi": "verb",
        "vbl": "verb", "nvt": "verb", "nv": "verb",
        "adjective": "adjective", "adj": "adjective", "a": "adjective", "s": "adjective",
        "adverb": "adverb", "adv": "adverb", "ad": "adverb", "r": "adverb",
        "pron": "other", "pro": "other", "prep": "other", "conj": "other",
        "int": "other", "interj": "other", "art": "other", "det": "other",
        "num": "other", "aux": "other", "other": "other",
    }
    pieces = re.findall(r"[a-z]+", value)
    return {aliases[token] for token in pieces if token in aliases}


def read_local_glosses(wordbank_path: Path) -> dict[str, list[tuple[int, str, str, str]]]:
    payload = json.loads(wordbank_path.read_text(encoding="utf-8"))
    result: dict[str, list[tuple[int, str, str, str]]] = {}
    for book in payload.get("books", []):
        book_id = str(book.get("id", ""))
        if GRADE_RE.fullmatch(book_id):
            continue
        priority = 0 if book_id.startswith("pep-") else 1 if book_id == "gaokao" else 2
        for word in book.get("words", []):
            gloss = str(word.get("meaning") or "").strip()
            if not gloss or not CJK_RE.search(gloss):
                continue
            key = str(word.get("word") or "").strip().casefold()
            if not key:
                continue
            result.setdefault(key, []).append((priority, book_id, str(word.get("pos") or ""), gloss))
    return result


def read_ecdict(path: Path, target_words: set[str]) -> dict[str, dict[str, str]]:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != SOURCE_FILE_SHA256:
        raise SystemExit(
            "The ECDICT CSV does not match the pinned revision/file checksum. "
            f"Expected {SOURCE_FILE_SHA256}, found {digest}; refusing unreviewed data."
        )
    result: dict[str, dict[str, str]] = {}
    target_lemmas: set[str] = set()
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            key = str(row.get("word") or "").strip().casefold()
            if key not in target_words:
                continue
            if key in result:
                raise SystemExit(f"Duplicate ECDICT entry for grade word candidate: {key!r}")
            result[key] = row
            lemma = lemma_for(row)
            if lemma and lemma != key:
                target_lemmas.add(lemma)
    missing = target_words - result.keys()
    if missing:
        raise SystemExit(f"ECDICT is missing exact grade headwords: {', '.join(sorted(missing)[:30])}")

    # The first pass is bounded to grade headwords and records their explicit
    # ECDICT lemmas. The second reads only those lemma rows, allowing inflected
    # spellings to use a real matching-POS gloss without retaining 760k rows.
    missing_lemmas = target_lemmas - result.keys()
    if missing_lemmas:
        with path.open("r", encoding="utf-8-sig", newline="") as source:
            for row in csv.DictReader(source):
                key = str(row.get("word") or "").strip().casefold()
                if key in missing_lemmas:
                    result[key] = row
                    missing_lemmas.remove(key)
                    if not missing_lemmas:
                        break
    return result


def split_translation_lines(value: str) -> list[str]:
    # ECDICT stores line breaks as literal backslash-n sequences in CSV cells.
    return [part.strip() for part in re.split(r"\r?\n|\\n", value or "") if part.strip()]


def parse_translation_line(line: str) -> tuple[set[str], str]:
    match = TAGGED_LINE_RE.match(line.strip())
    if not match:
        return set(), line.strip()
    labels = {token.lower() for token in re.findall(r"[A-Za-z]+", match.group(1))}
    if not labels or not labels.issubset(POS_LABELS):
        return set(), line.strip()
    return labels, match.group(2).strip()


def selected_lines(row: dict[str, str], pos: str) -> list[str]:
    parsed = [parse_translation_line(line) for line in split_translation_lines(row.get("translation", ""))]
    matching = [
        gloss
        for labels, gloss in parsed
        if labels and any(POS_LABELS[label] == pos for label in labels)
    ]
    return matching


def clean_gloss(value: str) -> list[str]:
    value = value.strip()
    # Ignore website-only cross-reference lines when useful dictionary glosses
    # are available. Other square-bracket tags are source/domain labels only.
    if value.startswith("[网络]"):
        return []
    value = re.sub(r"\[[^\]]+\]\s*", "", value)
    value = INFLECTION_NOTE_RE.sub("", value)
    value = INLINE_INFLECTION_RE.sub("", value)
    # Remove untranslated English parentheticals that precede a Chinese gloss,
    # such as (playing cards)(正式)一副纸牌. Keep Chinese explanations.
    value = re.sub(r"\(([^()]*)\)(?=[\u3400-\u9fff])", "", value)
    value = re.sub(r"[（(]([^（）()]*)[）)]", lambda m: "" if not CJK_RE.search(m.group(1)) else m.group(0), value)
    value = re.sub(r"\s+", " ", value).strip(" \t，,；;、。:：/")
    if not CJK_RE.search(value):
        return []
    pieces = re.split(r"[，,；;、]\s*", value)
    cleaned: list[str] = []
    for piece in pieces:
        piece = piece.strip(" \t，,；;、。:：/")
        piece = re.sub(r"^(?:and|or)\s+", "", piece, flags=re.I)
        if not piece or not CJK_RE.search(piece):
            continue
        # De-duplicate tiny formatting variants without collapsing traditional
        # source characters inside a legitimate Chinese gloss.
        key = re.sub(r"\s+", "", piece).casefold()
        if all(re.sub(r"\s+", "", item).casefold() != key for item in cleaned):
            cleaned.append(piece)
    return cleaned


def format_translation(glosses: list[str]) -> str:
    unique: list[str] = []
    seen: set[str] = set()
    for gloss in glosses:
        for part in clean_gloss(gloss):
            key = re.sub(r"\s+", "", part).casefold()
            if key in seen:
                continue
            seen.add(key)
            unique.append(part)
    # A compact selection is easier to learn from than ECDICT's full legacy
    # list of synonyms and technical/domain notes.
    return "；".join(unique[:8])


def useful_glosses(glosses: list[str]) -> list[str]:
    return [gloss for gloss in glosses if clean_gloss(gloss)]


def lemma_for(row: dict[str, str]) -> str:
    match = EXCHANGE_LEMMA_RE.search(str(row.get("exchange") or ""))
    return match.group(1).strip().casefold() if match else ""


def dictionary_meaning(
    word: dict[str, Any],
    ecdict: dict[str, dict[str, str]],
    local_glosses: dict[str, list[tuple[int, str, str, str]]],
) -> tuple[str, str]:
    spelling = str(word.get("word") or "").strip().casefold()
    pos = str(word.get("pos") or "other").strip().casefold()
    row = ecdict.get(spelling)
    if not row:
        raise ValueError(f"ECDICT has no exact entry for {spelling!r}")

    glosses = useful_glosses(selected_lines(row, pos))
    method = "exact-headword-and-POS"
    if not glosses:
        lemma = lemma_for(row)
        lemma_row = ecdict.get(lemma) if lemma else None
        if lemma_row:
            glosses = useful_glosses(selected_lines(lemma_row, pos))
            if glosses:
                method = "ECDICT-lemma-and-POS"

    if not glosses:
        wanted_pos = POS_LABELS.get(pos, pos)
        matches = [
            item for item in local_glosses.get(spelling, [])
            if wanted_pos in normalize_pos(item[2])
        ]
        if matches:
            matches.sort(key=lambda item: (item[0], len(item[3]), item[1]))
            _, book_id, source_pos, local_meaning = matches[0]
            meaning = format_translation([local_meaning])
            if meaning:
                return meaning, f"local-wordbank-POS-match:{book_id}:{source_pos}"

    if not glosses:
        # Only use an untagged headword gloss as the last dictionary option.
        # Do not silently substitute another part of speech or a domain label.
        untagged = [
            gloss
            for labels, gloss in map(parse_translation_line, split_translation_lines(row.get("translation", "")))
            if not labels and not re.match(r"^\s*\[[^\]]+\]", gloss)
        ]
        glosses = untagged
        method = "exact-headword-untagged"
    meaning = format_translation(glosses)
    if not meaning or not CJK_RE.search(meaning):
        raise ValueError(f"No POS-matched Chinese gloss for {spelling!r}: {row.get('translation')!r}")
    return meaning, method


def meaning_source(method: str) -> str:
    if method == "reviewed-override":
        return "Lexio · 词条专属中文校订"
    if method.startswith("local-wordbank-POS-match:"):
        return "Lexio · 已有本地词库中同词性的中文释义"
    if method == "exact-headword-untagged":
        return f"ECDICT · {SOURCE_REVISION[:12]} · 未标注词性的精确词头释义"
    return ECDICT_MEANING_SOURCE


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ecdict_csv", type=Path, help="Pinned ECDICT ecdict.csv file")
    parser.add_argument(
        "--wordbank",
        type=Path,
        default=project_data_path("original-site-wordbank.json"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=project_data_path("us-grade-chinese-meanings.json"),
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=project_data_path("us-grade-meaning-overrides.json"),
    )
    args = parser.parse_args()

    words = load_grade_words(args.wordbank)
    expected_spellings = {str(word.get("word") or "").strip().casefold() for word in words}
    ecdict = read_ecdict(args.ecdict_csv, expected_spellings)
    local_glosses = read_local_glosses(args.wordbank)
    overrides: dict[str, str] = json.loads(args.overrides.read_text(encoding="utf-8"))
    unknown_overrides = set(overrides) - expected_spellings
    if unknown_overrides:
        raise SystemExit(f"Overrides do not match this word pack: {', '.join(sorted(unknown_overrides))}")

    entries: dict[str, dict[str, str]] = {}
    methods = Counter()
    for word in words:
        spelling = str(word.get("word") or "").strip().casefold()
        if spelling in overrides:
            meaning, method = overrides[spelling].strip(), "reviewed-override"
        else:
            meaning, method = dictionary_meaning(word, ecdict, local_glosses)
        if not meaning or not CJK_RE.search(meaning):
            raise SystemExit(f"Missing Chinese translation for {word.get('id')}: {meaning!r}")
        entries[str(word["id"])] = {
            "word": str(word["word"]),
            "pos": str(word.get("pos") or ""),
            "meaningEn": str(word.get("meaningEn") or word.get("meaning") or ""),
            "meaning": meaning,
            "meaningSource": meaning_source(method),
            "method": method,
        }
        methods[method] += 1

    if len(entries) != 2300:
        raise SystemExit(f"Expected 2,300 translated word IDs, found {len(entries)}")

    metadata = {
        "source": SOURCE_NAME,
        "sourceRepository": SOURCE_REPOSITORY,
        "sourceRevision": SOURCE_REVISION,
        "sourceFile": "ecdict.csv",
        "sourceFileSha256": SOURCE_FILE_SHA256,
        "license": SOURCE_LICENSE,
        "method": "Matched exact ECDICT headword and selected simplified Chinese glosses by the US-pack part of speech; used the ECDICT exchange lemma when its exact form had no gloss for that part of speech; otherwise used a matching-POS gloss already bundled elsewhere in the local wordbank or a word-specific reviewed override. Unmatched dictionary abbreviations/domain-only glosses are not used as silent cross-POS fallbacks. Original upstream English definitions remain in meaningEn for audit and are not displayed as the card meaning.",
        "coverage": len(entries),
        "manualOverrides": sorted(overrides),
        "methodCounts": dict(methods),
    }
    output_payload = {"metadata": metadata, "entries": entries}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    payload = json.loads(args.wordbank.read_text(encoding="utf-8"))
    by_id = entries
    for book in payload.get("books", []):
        if not GRADE_RE.fullmatch(str(book.get("id", ""))):
            continue
        for word in book.get("words", []):
            entry = by_id[str(word.get("id", ""))]
            word["meaningEn"] = entry["meaningEn"]
            word["meaning"] = entry["meaning"]
            word["meaningSource"] = entry["meaningSource"]
    wordbank_metadata = payload.setdefault("metadata", {})
    wordbank_metadata["usGradeChineseMeaningEnrichment"] = metadata
    field_migrations = wordbank_metadata.setdefault("wordFieldMigrations", {})
    migration_count = 0
    for book in payload.get("books", []):
        if not GRADE_RE.fullmatch(str(book.get("id", ""))):
            continue
        for word in book.get("words", []):
            old_meaning = str(word.get("meaningEn") or "").strip()
            new_meaning = str(word.get("meaning") or "").strip()
            if not old_meaning or not new_meaning or old_meaning == new_meaning:
                raise SystemExit(f"Cannot create meaning migration for {word.get('id')}")
            fields = field_migrations.setdefault(str(word["id"]), {})
            prior = fields.get("meaning", {})
            from_values = prior.get("from", []) if isinstance(prior, dict) else []
            if not isinstance(from_values, list):
                from_values = [from_values]
            from_values = [str(value) for value in from_values if str(value) and str(value) != new_meaning]
            if old_meaning not in from_values:
                from_values.append(old_meaning)
            fields["meaning"] = {"from": from_values, "to": new_meaning}
            migration_count += 1
    metadata["migrationCount"] = migration_count
    wordbank_metadata["usGradeChineseMeaningEnrichment"] = metadata
    args.wordbank.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"coverage": len(entries), "methodCounts": dict(methods), "overrides": len(overrides)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
