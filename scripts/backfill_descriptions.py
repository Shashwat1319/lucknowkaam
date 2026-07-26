import os
import sys
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from gemini import convert_to_hindi
except ImportError:
    print("Error: convert_to_hindi import failed")
    sys.exit(1)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://rswszmbzykrzidndyeed.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("Error: Missing SUPABASE_SERVICE_KEY env var")
    sys.exit(1)

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

def supabase_select():
    url = f"{SUPABASE_URL}/rest/v1/jobs"
    params = {
        "select": "id,title_english,company_name,location_area,description_hindi,salary_text_hindi,title_hindi,qualification,experience",
        "is_active": "eq.true",
        "order": "posted_at.asc",
    }
    resp = requests.get(url, headers=HEADERS, params=params)
    resp.raise_for_status()
    jobs = resp.json()
    for j in jobs:
        j["title"] = j.get("title_english", "")
        j["company"] = j.get("company_name", "")
        j["location"] = j.get("location_area", "")
        j["description"] = j.get("description_hindi", "")
        j["salary"] = j.get("salary_text_hindi", "")
    return jobs

def supabase_update(job_id: str, data: dict):
    url = f"{SUPABASE_URL}/rest/v1/jobs"
    params = {"id": f"eq.{job_id}"}
    resp = requests.patch(url, headers=HEADERS, params=params, json=data)
    resp.raise_for_status()

jobs = supabase_select()
print(f"Found {len(jobs)} active jobs")

updated = 0
failed = 0
skipped_long = 0

for job in jobs:
    desc = (job.get("description_hindi") or "").strip()
    if len(desc) > 120:
        print(f"  SKIP id={job['id'][:8]}... already long ({len(desc)} chars)")
        skipped_long += 1
        continue

    print(f"  PROCESS id={job['id'][:8]}... {job.get('title_english','')[:40]} ({job.get('company_name','')})")
    print(f"    current description: {len(desc)} chars")

    try:
        result_data = convert_to_hindi(job)
        if result_data and "description_hindi" in result_data:
            supabase_update(job["id"], {
                "title_hindi": result_data.get("title_hindi", job.get("title_hindi", "")),
                "description_hindi": result_data.get("description_hindi", ""),
                "qualification": result_data.get("qualification", job.get("qualification", "")),
                "experience": result_data.get("experience", job.get("experience", "")),
                "salary_text_hindi": result_data.get("salary_text_hindi", job.get("salary_text_hindi", "")),
            })
            updated += 1
            print(f"    UPDATED: {len(result_data.get('description_hindi', ''))} chars")
        else:
            failed += 1
            print(f"    FAILED: no result from convert_to_hindi")
    except Exception as e:
        failed += 1
        print(f"    ERROR: {e}")

    time.sleep(1.5)

print(f"\nDone: {updated} updated, {failed} failed, {skipped_long} skipped (already long)")
