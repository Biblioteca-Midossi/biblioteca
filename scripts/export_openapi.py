#!/usr/bin/env python3
"""Export the FastAPI OpenAPI schema to openapi.json for client generation.

Run via `bun run openapi:export`. Fetches the schema from a running API
(default http://localhost:4000/api/openapi.json, override with OPENAPI_URL)
and injects the `/api` server URL so generated clients use the right base path.
"""

import json
import os
import urllib.request
from pathlib import Path

SCHEMA_PATH = Path("openapi.json")
DEFAULT_URL = "http://localhost:4000/api/openapi.json"


def main() -> None:
    url = os.environ.get("OPENAPI_URL", DEFAULT_URL)
    with urllib.request.urlopen(url) as response:
        schema = json.load(response)

    schema.setdefault("servers", [{"url": "/api"}])

    SCHEMA_PATH.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    print(f"OpenAPI schema ({len(schema.get('paths', {}))} paths) written to {SCHEMA_PATH}")


if __name__ == "__main__":
    main()
