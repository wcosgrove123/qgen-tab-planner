#!/usr/bin/env python3
"""
Validate a Q-Gen project JSON against the master schema.

Usage:
  python validate_schema.py --schema qgen_schema.json --project sample_project.json
"""
import json, argparse, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--schema", required=True)
    ap.add_argument("--project", required=True)
    args = ap.parse_args()

    with open(args.schema, "r", encoding="utf-8") as f:
        schema = json.load(f)
    with open(args.project, "r", encoding="utf-8") as f:
        project = json.load(f)

    try:
        import jsonschema
        jsonschema.validate(instance=project, schema=schema)
        print("✅ Validation passed.")
        return 0
    except ModuleNotFoundError:
        print("⚠️  'jsonschema' not installed. Skipping strict validation.")
        # Do a very light structural smoke test instead
        if not isinstance(project, dict) or "project" not in project or "questions" not in project:
            print("❌ Basic structure check failed: top-level keys missing.")
            return 2
        if not isinstance(project["questions"], list) or len(project["questions"]) == 0:
            print("❌ Basic structure check failed: 'questions' must be non-empty list.")
            return 2
        print("✅ Basic smoke test passed (install 'jsonschema' for full validation).")
        return 0
    except jsonschema.ValidationError as e:
        print("❌ ValidationError:", e.message)
        # print path to the failing field
        if e.path:
            print("   at:", " -> ".join(map(str, e.path)))
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
