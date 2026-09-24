"""
Export service supporting CSV and JSON serialization for analytical findings.
"""

import os
import io
import csv
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

EXPORT_DIR = "reports/exports"
os.makedirs(EXPORT_DIR, exist_ok=True)


def export_to_csv(data: List[Dict[str, Any]], filename: str) -> str:
    """Exports list of dicts to CSV."""
    if not filename.endswith(".csv"):
        filename += ".csv"
    path = os.path.join(EXPORT_DIR, filename)
    if not data:
        with open(path, "w") as f:
            f.write("")
        return path

    keys = data[0].keys()
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    logger.info(f"Exported {len(data)} records to {path}")
    return path


def export_to_json(data: Any, filename: str) -> str:
    """Exports arbitrary object to JSON."""
    if not filename.endswith(".json"):
        filename += ".json"
    path = os.path.join(EXPORT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    logger.info(f"Exported JSON data to {path}")
    return path
