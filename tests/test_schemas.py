#!/usr/bin/env python3
import os
import glob
import json

schemas_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "schemas"))
schema_files = glob.glob(os.path.join(schemas_dir, "*.json"))

print(f"[*] Validating {len(schema_files)} schemas in {schemas_dir}...")

assert len(schema_files) >= 17, f"Expected at least 17 schemas, found {len(schema_files)}"

for sf in schema_files:
    with open(sf, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            assert "$schema" in data or "type" in data or "properties" in data, f"Schema {os.path.basename(sf)} missing basic schema keys"
            print(f"  [+] Valid JSON schema: {os.path.basename(sf)}")
        except Exception as e:
            print(f"  [-] Failed parsing {sf}: {e}")
            raise

print("[✓] ALL SCHEMAS VALID!")
