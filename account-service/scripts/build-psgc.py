#!/usr/bin/env python3
"""Offline, standard-library-only transform of the exact IDE0177 PSA workbook.

No network calls, random IDs, timestamps, population, coordinates or old codes.
Run from any directory: python3 build-psgc.py SOURCE.xlsx OUTPUT_DIRECTORY
"""
import hashlib
import json
import posixpath
import re
import sys
import uuid
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter
from pathlib import Path

SOURCE_SHA256 = "31892bc2bdde3ea0682562d9412b5bab4d45a0be5e5a5b4f6c9d7714b94bca5d"
SOURCE_SIZE = 3250889
SOURCE_URL = "https://psa.gov.ph/system/files/scd/PSGC-2Q-2026-Publication-Datafile.xlsx"
RELEASE_URL = "https://psa.gov.ph/content/second-quarter-2026-psgc-updates-renaming-one-municipality-and-one-barangay-and-correction"
N = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
EXPECTED = {"Reg": 18, "Prov": 82, "City": 149, "Mun": 1493, "Bgy": 42010, "SubMun": 14, None: 2}
TABLES = {"Reg": "regions", "Prov": "provinces", "City": "cities", "Mun": "cities", "Bgy": "barangays"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def identity(code):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "https://balhinbalay.com/reference/psgc/" + code))


def sheet_rows(archive, title):
    """Resolve the worksheet by title; read shared/inline strings and numbers.

    The pinned workbook has no formulas in the PSGC/Metadata source columns.
    Reject formulas rather than trusting a cached result in the authoritative data.
    """
    strings = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    shared = ["".join(si.itertext()) if not si.findall("s:t", N) and not si.findall("s:r", N)
              else "".join(t.text or "" for t in si.findall(".//s:t", N))
              for si in strings.findall("s:si", N)]
    relations = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {r.attrib["Id"]: r.attrib["Target"] for r in relations}
    book = ET.fromstring(archive.read("xl/workbook.xml"))
    sheet = next((s for s in book.findall("s:sheets/s:sheet", N) if s.attrib["name"] == title), None)
    require(sheet is not None, "Required worksheet missing: " + title)
    target = targets[sheet.attrib[R]]
    path = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
    root = ET.fromstring(archive.read(path))
    for row in root.findall("s:sheetData/s:row", N):
        cells = {}
        for c in row.findall("s:c", N):
            column = re.match(r"[A-Z]+", c.attrib["r"]).group()
            require(c.find("s:f", N) is None, "Formula in source worksheet " + title)
            value = c.find("s:v", N)
            if c.attrib.get("t") == "s":
                cells[column] = shared[int(value.text)]
            elif c.attrib.get("t") == "inlineStr":
                cells[column] = "".join(t.text or "" for t in c.findall(".//s:t", N))
            elif value is not None:
                cells[column] = value.text
        yield cells


def transform(source):
    raw = source.read_bytes()
    require(len(raw) == SOURCE_SIZE and hashlib.sha256(raw).hexdigest() == SOURCE_SHA256,
            "Authoritative source size/SHA256 mismatch; no output generated")
    with zipfile.ZipFile(source) as archive:
        metadata = {r.get("A"): r.get("B") for r in sheet_rows(archive, "Metadata") if r.get("A")}
        require(metadata["Title:"] == "Philippine Standard Geographic Code (PSGC)" and
                metadata["Originator:"] == "Philippine Statistics Authority (PSA)" and
                metadata["Publication date:"] == "30 June 2026", "Unexpected source metadata")
        rows = list(sheet_rows(archive, "PSGC"))
    require(rows[0].get("A") == "10-digit PSGC" and rows[0].get("B") == "Name" and
            rows[0].get("D") == "Geographic Level", "Unexpected PSGC headers")
    records = []
    seen = set()
    for row in rows[1:]:
        if not any(row.values()):
            continue
        code, name, level = row.get("A"), row.get("B"), row.get("D")
        require(isinstance(code, str) and re.fullmatch(r"\d{10}", code), "Invalid authoritative code")
        require(code not in seen and isinstance(name, str) and name.strip(), "Duplicate code or empty name")
        seen.add(code)
        records.append({"code": code, "name": name, "level": level, "class": row.get("F")})
    require(dict(Counter(r["level"] for r in records)) == EXPECTED, "Unexpected source level counts")
    regions = {r["code"]: r for r in records if r["level"] == "Reg"}
    provinces = {r["code"]: r for r in records if r["level"] == "Prov"}
    cities = {r["code"]: r for r in records if r["level"] in ("City", "Mun")}
    sub = {r["code"]: r for r in records if r["level"] == "SubMun"}
    containers = {r["code"]: r["name"] for r in records if r["level"] is None}
    require(containers == {"0990100000": "City of Isabela (Not a Province)", "1999900000": "Special Geographic Area"},
            "Unexpected non-province routing containers")
    require(all(c[:5] + "00000" == "1380600000" for c in sub), "Unexpected SubMun hierarchy")
    package = {t: [] for t in ("regions", "provinces", "cities", "barangays")}
    null_provinces = []
    manila_barangays = 0
    for record in records:
        code, name, level = record["code"], record["name"], record["level"]
        if level not in TABLES:
            continue
        value = {"id": identity(code), "code": code, "name": name}
        if level in ("Prov", "City", "Mun"):
            parent = code[:2] + "00000000"
            require(parent in regions, "Missing region for " + code)
            value["region_code"] = parent
        if level in ("City", "Mun"):
            parent = code[:5] + "00000"
            if parent in provinces:
                require(parent[:2] == code[:2], "Province/region mismatch")
                value["province_code"] = parent
            else:
                require(record["class"] == "HUC" or code.startswith("138") or parent in containers,
                        "Unexplained missing province for " + code)
                value["province_code"] = None
                null_provinces.append(code)
            value["locality_type"] = "CITY" if level == "City" else "MUNICIPALITY"
        if level == "Bgy":
            parent = code[:7] + "000"
            if parent in sub:
                # PSA Notes A.1: these Manila districts are not municipalities.
                parent = parent[:5] + "00000"
                manila_barangays += 1
            require(parent in cities, "Missing city/municipality for " + code)
            value["city_code"] = parent
        package[TABLES[level]].append(value)
    for table in package:
        package[table].sort(key=lambda r: r["code"])
    summary = {"counts": {t: len(v) for t, v in package.items()},
               "city_types": {"CITY": 149, "MUNICIPALITY": 1493},
               "province_null_locality_codes": sorted(null_provinces),
               "manila_barangays_mapped_through_14_submunicipalities": manila_barangays,
               "excluded_routing_rows": [{"code": r["code"], "name": r["name"], "source_level": r["level"]}
                                         for r in sorted(records, key=lambda r: r["code"]) if r["level"] not in TABLES],
               "duplicate_codes": 0, "orphan_parents": 0,
               "names": "Exact source Unicode and whitespace retained; no renaming or normalisation",
               "uuid_identity": "UUIDv5(NAMESPACE_URL, https://balhinbalay.com/reference/psgc/ + 10-digit PSGC code)"}
    return package, summary, metadata


def encode(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def main():
    require(len(sys.argv) == 3, "Usage: build-psgc.py SOURCE.xlsx OUTPUT_DIRECTORY")
    package, summary, metadata = transform(Path(sys.argv[1]))
    output = Path(sys.argv[2])
    generated = {t + ".json": encode(v) for t, v in package.items()}
    generated["hierarchy.json"] = encode(summary)
    manifest = {"format": "balhinbalay-psgc-2q2026-v1", "effective_date": "2026-06-30", "release_date": "2026-07-13",
                "source": {"title": "PSGC 2Q 2026 Publication Datafile", "url": SOURCE_URL, "release_url": RELEASE_URL,
                           "filename": "PSGC-2Q-2026-Publication-Datafile.xlsx", "size_bytes": SOURCE_SIZE, "sha256": SOURCE_SHA256,
                           "access_constraints": metadata["Access constraints:"], "use_constraints": metadata["Use constraints:"],
                           "website_licence": "CC BY 4.0 unless otherwise stated; PSA release page footer"},
                "counts": summary["counts"],
                "files": {n: {"size_bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()} for n, b in generated.items()}}
    generated["manifest.json"] = encode(manifest)
    output.mkdir(parents=True, exist_ok=True)
    for name, content in generated.items():
        (output / name).write_bytes(content)
    print(json.dumps({"counts": summary["counts"], "province_null": len(summary["province_null_locality_codes"]),
                      "manila_barangays": summary["manila_barangays_mapped_through_14_submunicipalities"],
                      "manifest_sha256": hashlib.sha256(generated["manifest.json"]).hexdigest()}))


if __name__ == "__main__":
    main()
