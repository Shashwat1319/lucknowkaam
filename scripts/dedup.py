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


def _fetch_all_paginated(table: str, select: str, key: str, key_name: str) -> set:
    if not key:
        return set()
    all_items = set()
    offset = 0
    limit = 2000
    while True:
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table}?select={select}&limit={limit}&offset={offset}",
                headers=_supabase_headers(key),
                timeout=10,
            )
            if resp.status_code != 200:
                log(f"  ⚠️  DB fetch ({key_name}): HTTP {resp.status_code}")
                return all_items if all_items else set()
            items = resp.json()
            if not items:
                break
            for item in items:
                all_items.add(item.get("slug", ""))
            if len(items) < limit:
                break
            offset += limit
        except Exception as e:
            log(f"  ⚠️  DB fetch ({key_name}): {e}")
            return all_items if all_items else set()
    return all_items


def fetch_all_posted_slugs() -> set:
    for key_name, key in [("service", SUPABASE_SERVICE_KEY), ("anon", SUPABASE_ANON_KEY)]:
        if not key:
            continue
        slugs = _fetch_all_paginated("posted_slugs", "slug", key, key_name)
        if slugs:
            log(f"  📋 Loaded {len(slugs)} slugs from posted_slugs ({key_name} key)")
            return slugs
    log("  ⚠️  Could not fetch slugs from DB — falling back to local file")
    return set()


def save_slug_to_supabase(slug: str, source: str):
    key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
    if not key:
        return
    try:
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/posted_slugs",
            json={"slug": slug, "source": source},
            headers=_supabase_headers(key),
            timeout=10,
        )
        if resp.status_code not in (200, 201, 409):
            log(f"  ⚠️  Failed to save slug '{slug[:40]}': HTTP {resp.status_code}")
    except Exception as e:
        log(f"  ⚠️  Failed to save slug '{slug[:40]}': {e}")


def fetch_jobs_slugs() -> set:
    for key_name, key in [("service", SUPABASE_SERVICE_KEY), ("anon", SUPABASE_ANON_KEY)]:
        if not key:
            continue
        slugs = _fetch_all_paginated("jobs?is_active=eq.true", "slug", key, key_name)
        if slugs:
            log(f"  📋 Loaded {len(slugs)} slugs from jobs table ({key_name} key)")
            return slugs
    return set()


def load_posted_jobs() -> set:
    slugs = fetch_all_posted_slugs()
    if slugs:
        return slugs

    slugs = fetch_jobs_slugs()
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


def enough_jobs_posted_today(threshold: int) -> bool:
    try:
        with open(POSTED_JOBS_FILE, "r") as f:
            data = json.load(f)
            meta = data.get("__meta__", {}) if isinstance(data, dict) else {}
            if meta.get("last_run") == datetime.now().strftime("%Y-%m-%d") and meta.get("count", 0) >= threshold:
                return True
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return False


already_ran_today = enough_jobs_posted_today
