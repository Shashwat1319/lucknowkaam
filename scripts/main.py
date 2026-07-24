#!/usr/bin/env python3
"""
NaukriBot — Auto Job Poster
Scrapes jobs from free sources across India, converts to Hindi via Gemini AI,
and auto-posts to lucknowkaam.vercel.app

Usage:
  python scripts/main.py              # Run with .env file
  python scripts/main.py --dry-run    # Scrape + convert but don't post
"""

import sys
import os
import time
import re
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from scripts.utils import log
from scripts.dedup import (
    load_posted_jobs, save_posted_jobs, save_slug_to_supabase, already_ran_today,
)
from scripts.gemini import convert_to_hindi, _gemini_calls_today
from scripts.poster import post_job, build_payload
from scripts.scrapers import (
    InternshalaScraper, ShineScraper, IndeedScraper,
)

MAX_JOBS_PER_RUN = 30


def log_header():
    print(f"\n{'='*60}")
    print(f"  🚀 NaukriBot — Auto Job Poster")
    print(f"  📅 Date: {datetime.now().strftime('%d %B %Y, %I:%M %p')}")
    print(f"{'='*60}")


def log_footer(posted: int, skipped: int, failed: int, elapsed: float):
    print(f"{'='*60}")
    print(f"  📈 SUMMARY:")
    print(f"     Posted:   {posted} jobs")
    print(f"     Skipped:  {skipped} duplicates")
    print(f"     Failed:   {failed}")
    print(f"     Time:     {elapsed:.0f} seconds")
    print(f"{'='*60}\n")


def scrape_all_sources() -> list:
    scrapers = [
        InternshalaScraper(),
        IndeedScraper(),
        ShineScraper(),
    ]

    all_jobs = []
    for scraper in scrapers:
        try:
            jobs = scraper.scrape()
            all_jobs.extend(jobs)
        except Exception as e:
            log(f"⚠️  {scraper.source_name} failed completely: {e}")
        time.sleep(0.5)

    print(f"  {'─'*42}")
    log(f"📊 Total scraped: {len(all_jobs)} jobs")
    return all_jobs


def main():
    dry_run = "--dry-run" in sys.argv
    log_header()

    all_posted_slugs = load_posted_jobs()
    posted_count = 0
    skipped_count = 0
    failed_count = 0
    start_time = time.time()

    if already_ran_today(5):
        log(f"✓ Already ran today ({len(all_posted_slugs)} jobs posted). Exiting.")
        log_footer(0, 0, 0, time.time() - start_time)
        return

    all_jobs = scrape_all_sources()
    if not all_jobs:
        log("⚠️  No jobs found from any source. Exiting.")
        log_footer(0, 0, 0, time.time() - start_time)
        return

    seen = set()
    unique_jobs = []
    for j in all_jobs:
        key = f"{j['company']}|{j['title']}".lower().strip()
        key = re.sub(r"\s+", " ", key)
        if key not in seen:
            seen.add(key)
            unique_jobs.append(j)

    new_after_dedup = sum(
        1 for j in unique_jobs
        if j.get("slug") or not _job_slug_in_posted(j, all_posted_slugs)
    )

    log(f"  🔄 New after dedup: {new_after_dedup} jobs")
    log(f"  🤖 Gemini calls: {_gemini_calls_today}")

    print(f"  {'─'*42}")

    posted_in_session = []
    for i, job in enumerate(unique_jobs):
        if len(posted_in_session) >= MAX_JOBS_PER_RUN:
            log(f"\n⚠️  Reached max {MAX_JOBS_PER_RUN} jobs per run. Stopping.")
            break

        slug = _make_slug(job)
        if slug in all_posted_slugs:
            log(f"⏭ Skipped: Already posted (duplicate)")
            skipped_count += 1
            continue

        log(f"\n🤖 Processing: {job['title'][:60]}...")
        hindi = convert_to_hindi(job)
        payload = build_payload(job, hindi)
        payload["slug"] = slug

        if dry_run:
            print(f"  📦 [DRY RUN] Would post: {payload['title_hindi'][:50]} ({job['company']}, {job.get('location', 'India')})")
            _record_posted(slug, job, all_posted_slugs, posted_in_session)
            posted_count += 1
            save_slug_to_supabase(slug, job.get("source", "dry-run"))
            continue

        success = post_job(payload)
        if not success:
            log(f"  🔄 Retrying once...")
            time.sleep(3)
            success = post_job(payload)

        if success:
            log(f"✓ Posted: {payload['title_hindi'][:50]} ({job['company']}, {job.get('location', 'India')})")
            _record_posted(slug, job, all_posted_slugs, posted_in_session)
            posted_count += 1
            save_slug_to_supabase(slug, job.get("source", "web"))
        else:
            log(f"✗ Failed: {job['title'][:50]}")
            failed_count += 1

        time.sleep(1)

    save_posted_jobs(all_posted_slugs)

    elapsed = time.time() - start_time
    log_footer(posted_count, skipped_count, failed_count, elapsed)


def _make_slug(job: dict) -> str:
    from scripts.utils import generate_slug as gs, detect_city
    return gs(job["company"], job["title"], detect_city(job.get("location", "")))


def _job_slug_in_posted(job: dict, posted: set) -> bool:
    return _make_slug(job) in posted


def _record_posted(slug: str, job: dict, all_posted: set, session: list):
    all_posted.add(slug)
    session.append(slug)


if __name__ == "__main__":
    main()
