import json
import os
from datetime import datetime

import requests

from scripts.utils import log

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rswszmbzykrzidndyeed.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
POSTED_JOBS_FILE = os.path.join(os.path.dirname(__file__), "posted_jobs.json")


def _supabase_headers(key: str) -> dict:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def fetch_all_posted_slugs() -> set:
    for key_name, key in [("service", SUPABASE_SERVICE_KEY), ("anon", SUPABASE_ANON_KEY)]:
        if not key:
            continue
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/posted_slugs?select=slug&limit=10000",
                headers=_supabase_headers(key),
                timeout=10,
            )
            if resp.status_code == 200:
                slugs = {item["slug"] for item in resp.json()}
                log(f"  📋 Loaded {len(slugs)} slugs from DB ({key_name} key)")
                return slugs
            log(f"  ⚠️  DB fetch ({key_name}): HTTP {resp.status_code}")
        except Exception as e:
            log(f"  ⚠️  DB fetch ({key_name}): {e}")

    log("  ⚠️  Could not fetch slugs from DB — falling back to local file")
    return set()


def save_slug_to_supabase(slug: str, source: str):
    key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
    if not key:
        return
    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/posted_slugs",
            json={"slug": slug, "source": source},
            headers=_supabase_headers(key),
            timeout=10,
        )
    except Exception:
        pass


def load_posted_jobs() -> set:
    slugs = fetch_all_posted_slugs()
    if slugs:
        return slugs
    try:
        with open(POSTED_JOBS_FILE, "r") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return set(data.get("slugs", []))
            return set(data)
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_posted_jobs(posted: set):
    today = datetime.now().strftime("%Y-%m-%d")
    data = {"slugs": sorted(posted), "__meta__": {"last_run": today, "count": len(posted)}}
    with open(POSTED_JOBS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def already_ran_today(posted_count: int) -> bool:
    try:
        with open(POSTED_JOBS_FILE, "r") as f:
            data = json.load(f)
            meta = data.get("__meta__", {}) if isinstance(data, dict) else {}
            if meta.get("last_run") == datetime.now().strftime("%Y-%m-%d") and meta.get("count", 0) >= posted_count:
                return True
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return False
