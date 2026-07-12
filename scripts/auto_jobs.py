#!/usr/bin/env python3
"""
LucknowKaam — Auto Job Poster
Scrapes Lucknow jobs from free sources, converts to Hindi via Gemini AI,
and auto-posts to lucknowkaam.vercel.app

Usage:
  python auto_jobs.py              # Run with .env file
  python auto_jobs.py --dry-run    # Scrape + convert but don't post

Environment:
  GEMINI_API_KEY         — Google Gemini AI key
  LUCKNOWKAAM_API_KEY    — API key for lucknowkaam.vercel.app
  SITE_URL               — Default: https://lucknowkaam.vercel.app
"""

import os
import sys
import json
import time
import hashlib
import re
from datetime import datetime
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
    try:
        import google.generativeai as genai
    except ImportError:
        import google.genai as genai
except ImportError:
    print("Missing dependencies. Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ─── Configuration ───────────────────────────────────────────────────────────

SITE_URL = os.getenv("SITE_URL", "https://lucknowkaam.vercel.app")
API_URL = f"{SITE_URL}/api/jobs/create"
API_KEY = os.getenv("LUCKNOWKAAM_API_KEY", "lucknowkaam_secret_2026")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

POSTED_JOBS_FILE = os.path.join(os.path.dirname(__file__), "posted_jobs.json")
MAX_JOBS_PER_RUN = 15
REQUEST_DELAY = 2  # seconds between posts

LUCKNOW_AREAS = [
    "Hazratganj", "Gomti Nagar", "Alambagh", "Charbagh",
    "Aliganj", "Indira Nagar", "Vikas Nagar", "Rajajipuram",
    "Chinhat", "Faizabad Road", "Kanpur Road", "Mahanagar",
    "Aminabad", "Kaiserbagh", "Sultanpur Road", "Sitapur Road",
]

CATEGORY_KEYWORDS = {
    "delivery": ["delivery", "courier", "logistics", "zomato", "swiggy", "डिलीवरी"],
    "shop-assistant": ["shop", "store", "retail", "dukan", "दुकान", "store"],
    "data-entry": ["data entry", "typing", "computer operator", "डेटा एंट्री"],
    "driver": ["driver", "chauffeur", "cab", "ड्राइवर", "driving"],
    "teaching": ["teacher", "tutor", "coaching", "टीचर", "ट्यूशन", "teaching"],
    "work-from-home": ["work from home", "remote", "online", "घर से काम", "wfh"],
    "construction": ["construction", "labour", "mazdoor", "निर्माण", "builder", "site"],
    "hotel-restaurant": ["hotel", "restaurant", "cook", "chef", "होटल", "बेकरी", "bakery"],
    "medical": ["medical", "pharma", "nurse", "doctor", "मेडिकल", "hospital"],
    "sales": ["sales", "marketing", "telecaller", "सेल्स", "marketing", "business"],
    "technical": ["technical", "engineer", "mechanic", "technician", "तकनीकी"],
    "computer": ["computer", "graphic", "designer", "web", "software", "कंप्यूटर", "it "],
}

JOB_TYPES = {
    "full-time": ["full time", "fulltime", "पूर्णकालिक"],
    "part-time": ["part time", "parttime", "अंशकालिक", "part-time"],
    "work-from-home": ["work from home", "remote", "घर से काम", "wfh", "online"],
}


# ─── Logging Helpers ─────────────────────────────────────────────────────────

def log(msg: str):
    print(f"  {msg}")


def log_header():
    print(f"\n{'='*60}")
    print(f"  LucknowKaam Auto Job Poster")
    print(f"  Date: {datetime.now().strftime('%d %B %Y, %I:%M %p')}")
    print(f"{'='*60}")


def log_footer(posted: int, skipped: int, elapsed: float):
    print(f"{'='*60}")
    print(f"  Total Posted: {posted} jobs")
    print(f"  Total Skipped: {skipped} duplicates")
    print(f"  Time taken: {elapsed:.0f} seconds")
    print(f"{'='*60}\n")


# ─── Duplicate Prevention ────────────────────────────────────────────────────

def load_posted_jobs() -> set:
    try:
        with open(POSTED_JOBS_FILE, "r") as f:
            return set(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_posted_jobs(posted: set):
    with open(POSTED_JOBS_FILE, "w") as f:
        json.dump(sorted(posted), f, indent=2)


def generate_slug(company: str, title: str, location: str) -> str:
    combined = f"{company}-{title}-{location}-{datetime.now().strftime('%B-%Y')}".lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", combined)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    slug = re.sub(r"-+", "-", slug)
    return slug[:100]


# ─── Category & Area Detection ──────────────────────────────────────────────

def detect_category(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text:
                return cat
    return "computer"


def detect_area(text: str) -> str:
    text_lower = text.lower()
    for area in LUCKNOW_AREAS:
        if area.lower() in text_lower:
            return area
    return "Lucknow"


def detect_job_type(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for jt, keywords in JOB_TYPES.items():
        for kw in keywords:
            if kw in text:
                return jt
    return "full-time"


# ─── Gemini AI Hindi Converter ───────────────────────────────────────────────

def convert_to_hindi_gemini(job_data: dict) -> Optional[dict]:
    if not GEMINI_API_KEY:
        log("⚠️  No Gemini API key — using basic Hindi wrapper")
        return _basic_hindi_wrapper(job_data)

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""Neeche diye gaye job ki details ko simple Hindi mein likho jo Lucknow ke aam log samajh sakein.
Bilkul simple bhasha use karo, matlab ki har koi asaani se samajh le.

Job Data:
Title: {job_data.get('title', '')}
Company: {job_data.get('company', '')}
Location: {job_data.get('location', '')}
Description: {job_data.get('description', '')}
Salary: {job_data.get('salary', '')}

Sirf JSON return karo, koi extra text nahi:
{{
  "title_hindi": "naukari ka naam hindi mein (25-30 words max)",
  "description_hindi": "kaam ke baare mein 3-4 lines mein jankari, bilkul simple hindi mein",
  "qualification": "kya padhai chahiye (jaise: 10vi pass, 12vi pass, graduate)",
  "experience": "kitna anubhav chahiye (jaise: koi anubhav nahi, 1 saal, 2 saal)",
  "salary_text_hindi": "kitna paisa milega hindi mein (jaise: ₹10,000 - ₹15,000 prati mahina)"
}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        parsed = json.loads(text)
        parsed.setdefault("title_hindi", job_data.get("title", ""))
        parsed.setdefault("description_hindi", job_data.get("description", ""))
        parsed.setdefault("qualification", "कोई विशेष योग्यता नहीं")
        parsed.setdefault("experience", "कोई अनुभव नहीं चाहिए")
        parsed.setdefault("salary_text_hindi", job_data.get("salary", ""))
        return parsed

    except Exception as e:
        log(f"⚠️  Gemini failed: {e}")
        return _basic_hindi_wrapper(job_data)


def _basic_hindi_wrapper(job_data: dict) -> dict:
    title = job_data.get("title", "Naukari")
    company = job_data.get("company", "Company")
    desc = job_data.get("description", "")
    salary = job_data.get("salary", "")

    return {
        "title_hindi": title,
        "description_hindi": f"{company} ke liye {title} ka kaam hai. {desc}" if desc else f"{company} mein {title} ka kaam hai.",
        "qualification": "कोई विशेष योग्यता नहीं",
        "experience": "कोई अनुभव नहीं चाहिए",
        "salary_text_hindi": salary or "वेतन पर बातचीत होगी",
    }


# ─── API Poster ──────────────────────────────────────────────────────────────

def post_job(payload: dict) -> bool:
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    }
    try:
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=30)
        if resp.status_code in (200, 201):
            return True
        log(f"  API Error {resp.status_code}: {resp.text[:200]}")
        return False
    except requests.RequestException as e:
        log(f"  Network Error: {e}")
        return False


# ─── Scraper Base ────────────────────────────────────────────────────────────

class BaseScraper:
    source_name = "base"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }

    def safe_get(self, url: str, timeout: int = 15) -> Optional[requests.Response]:
        try:
            resp = requests.get(url, headers=self.headers, timeout=timeout)
            resp.raise_for_status()
            return resp
        except Exception as e:
            log(f"⚠️  {self.source_name}: Request failed — {e}")
            return None


# ─── Source 1: Internshala ──────────────────────────────────────────────────

class InternshalaScraper(BaseScraper):
    source_name = "Internshala"

    def scrape(self) -> list:
        log(f"📡 Scraping {self.source_name}...")
        resp = self.safe_get("https://internshala.com/jobs/lucknow-jobs")
        if not resp:
            return []

        jobs = []
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for card in soup.select("div.job-card, div.internship_and_job_card, div.individual_internship, div[data-job-id], a[class*=job]")[:30]:
                try:
                    el = card.select_one("h3, h4, .heading_2_4, .heading_1_5, .job-title, a[href*=job]")
                    title = el.get_text(strip=True) if el else ""
                    if not title or len(title) < 5:
                        continue
                    co = card.select_one(".company_name, .company, .link_display_like_button")
                    salary = card.select_one(".stipend, .salary, .text-heavy")
                    loc = card.select_one(".location, a[href*=location]")
                    jobs.append({
                        "title": title,
                        "company": co.get_text(strip=True) if co else "Company",
                        "location": loc.get_text(strip=True) if loc else "Lucknow",
                        "description": title,
                        "salary": salary.get_text(strip=True) if salary else "वेतन पर बातचीत",
                        "source": "internshala",
                    })
                except Exception:
                    continue
        except Exception:
            pass
        log(f"✓ Found {len(jobs)} jobs")
        return jobs


# ─── Source 2: TimesJobs ────────────────────────────────────────────────────

class TimesJobsScraper(BaseScraper):
    source_name = "TimesJobs"

    def scrape(self) -> list:
        log(f"📡 Scraping {self.source_name}...")
        sources = [
            "https://www.timesjobs.com/jobs/lucknow-jobs",
            "https://www.timesjobs.com/jobs/delivery-jobs-in-lucknow",
        ]
        jobs = []
        for url in sources:
            resp = self.safe_get(url)
            if not resp:
                continue
            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                for card in soup.select("li.clearfix, .job-bx, article, .card, [class*=job]")[:15]:
                    try:
                        title_el = card.select_one("h2 a, h3 a, .job-title a, a[href*=job]")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title or len(title) < 5:
                            continue
                        co = card.select_one(".company-name, .company, .org, .cmp-name")
                        salary = card.select_one(".salary, .sal, .text-sal")
                        loc = card.select_one(".location, .loc, .place")
                        jobs.append({
                            "title": title,
                            "company": co.get_text(strip=True) if co else "Company",
                            "location": loc.get_text(strip=True) if loc else "Lucknow",
                            "description": title,
                            "salary": salary.get_text(strip=True) if salary else "वेतन पर बातचीत",
                            "source": "timesjobs",
                        })
                    except Exception:
                        continue
            except Exception:
                continue
        log(f"✓ Found {len(jobs)} jobs")
        return jobs


# ─── Source 3: Freshersworld ─────────────────────────────────────────────────

class FreshersworldScraper(BaseScraper):
    source_name = "Freshersworld"

    def scrape(self) -> list:
        log(f"📡 Scraping {self.source_name}...")
        jobs = []
        for attempt in range(2):
            resp = self.safe_get(
                f"https://www.freshersworld.com/jobs/jobseeker/lucknow?page={attempt}"
            )
            if not resp:
                continue
            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                for card in soup.select("div.job-card, section.job-item, .card, li")[:20]:
                    try:
                        title_el = card.select_one("h2, h3, h4, .title, .job-title, a")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title or len(title) < 5:
                            continue
                        co = card.select_one(".company, .org, .employer, .company-name")
                        salary = card.select_one(".salary, .pay, .stipend, .text-sal")
                        jobs.append({
                            "title": title,
                            "company": co.get_text(strip=True) if co else "Company",
                            "location": "Lucknow",
                            "description": title,
                            "salary": salary.get_text(strip=True) if salary else "वेतन पर बातचीत",
                            "source": "freshersworld",
                        })
                    except Exception:
                        continue
            except Exception:
                continue
        log(f"✓ Found {len(jobs)} jobs")
        return jobs


# ─── Source 4: Indeed RSS Feed ──────────────────────────────────────────────

class IndeedScraper(BaseScraper):
    source_name = "Indeed"

    def scrape(self) -> list:
        log(f"📡 Scraping {self.source_name}...")
        jobs = []
        rss_urls = [
            "https://www.indeed.com/rss?q=lucknow+jobs&l=",
            "https://www.indeed.com/rss?q=delivery+boy+lucknow&l=",
        ]
        for url in rss_urls:
            resp = self.safe_get(url)
            if not resp:
                continue
            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                for item in soup.select("item")[:10]:
                    try:
                        title = item.select_one("title")
                        desc = item.select_one("description")
                        t = title.get_text(strip=True) if title else ""
                        if not t or len(t) < 5:
                            continue
                        d = desc.get_text(strip=True) if desc else t
                        jobs.append({
                            "title": t,
                            "company": "Indeed Jobs",
                            "location": "Lucknow",
                            "description": d[:300],
                            "salary": "वेतन पर बातचीत",
                            "source": "indeed",
                        })
                    except Exception:
                        continue
            except Exception:
                continue
        log(f"✓ Found {len(jobs)} jobs")
        return jobs


# ─── Source 5: Google Jobs RSS ──────────────────────────────────────────────

class GoogleJobsScraper(BaseScraper):
    source_name = "Google Jobs"

    def scrape(self) -> list:
        log(f"📡 Scraping {self.source_name}...")
        jobs = []
        resp = self.safe_get(
            "https://serpapi.com/rss?q=lucknow+jobs&location=lucknow"
        )
        if not resp:
            return jobs
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for item in soup.select("item")[:15]:
                try:
                    title = item.select_one("title")
                    t = title.get_text(strip=True) if title else ""
                    if not t or len(t) < 5:
                        continue
                    jobs.append({
                        "title": t,
                        "company": "Google Jobs",
                        "location": "Lucknow",
                        "description": t,
                        "salary": "वेतन पर बातचीत",
                        "source": "google-jobs",
                    })
                except Exception:
                    continue
        except Exception:
            pass
        log(f"✓ Found {len(jobs)} jobs")
        return jobs


# ─── Gemini Job Generator (Fallback) ─────────────────────────────────────────

def generate_jobs_gemini(count: int = 15) -> list:
    """Generate realistic Lucknow jobs using Gemini when scraping fails."""
    if not GEMINI_API_KEY:
        return []

    log(f"\n🤖 Generating {count} jobs via Gemini AI (fallback)...")
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        areas_str = ", ".join(LUCKNOW_AREAS)
        cats_str = ", ".join(f"{c}" for c in CATEGORY_KEYWORDS.keys())

        prompt = f"""Generate {count} realistic job listings for Lucknow, India in JSON format.
Each job must be for a different area and different category.
Use these Lucknow areas: {areas_str}
Use these categories: {cats_str}

Return ONLY a JSON array (no other text):
[{{
  "title": "job title in English (e.g. Delivery Boy Required)",
  "company": "company name (realistic Indian company)",
  "location": "Lucknow area from the list above",
  "description": "2-3 line job description in English",
  "salary": "salary range in INR (e.g. ₹8,000 - ₹15,000 per month)",
  "category": "category slug from the list above"
}}]"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        jobs = json.loads(text)
        if not isinstance(jobs, list):
            jobs = [jobs]

        for j in jobs:
            j["source"] = "gemini-generated"

        log(f"✓ Generated {len(jobs)} jobs")
        return jobs

    except Exception as e:
        log(f"⚠️  Gemini generation failed: {e}")
        return []


# ─── Master Scraper ──────────────────────────────────────────────────────────

def scrape_all_sources() -> list:
    scrapers = [
        InternshalaScraper(),
        TimesJobsScraper(),
        FreshersworldScraper(),
        IndeedScraper(),
        GoogleJobsScraper(),
    ]

    all_jobs = []
    for scraper in scrapers:
        try:
            jobs = scraper.scrape()
            all_jobs.extend(jobs)
        except Exception as e:
            log(f"⚠️  {scraper.source_name} failed completely: {e}")
        time.sleep(1)

    # If scraping found nothing, use Gemini as fallback
    if not all_jobs and GEMINI_API_KEY:
        log("\n⚠️  No jobs scraped. Using Gemini AI to generate jobs...")
        generated = generate_jobs_gemini(MAX_JOBS_PER_RUN)
        all_jobs.extend(generated)

    return all_jobs


# ─── Build API Payload ───────────────────────────────────────────────────────

def build_payload(scraped: dict, hindi: dict) -> dict:
    title_english = scraped.get("title", "")
    company = scraped.get("company", "Unknown")
    location = scraped.get("location", "Lucknow")
    area = detect_area(f"{title_english} {location} {hindi.get('description_hindi', '')}")
    category = detect_category(title_english, hindi.get("description_hindi", ""))
    job_type = detect_job_type(title_english, hindi.get("description_hindi", ""))

    slug = generate_slug(company, title_english, area)

    salary_text = hindi.get("salary_text_hindi") or scraped.get("salary", "वेतन पर बातचीत")
    salary_match = re.findall(r"(\d[\d,]*)", salary_text.replace("₹", ""))
    salary_min = None
    salary_max = None
    if len(salary_match) >= 2:
        salary_min = int(salary_match[0].replace(",", ""))
        salary_max = int(salary_match[1].replace(",", ""))
    elif len(salary_match) == 1:
        salary_min = int(salary_match[0].replace(",", ""))

    return {
        "title_hindi": hindi.get("title_hindi", title_english),
        "title_english": title_english,
        "slug": slug,
        "description_hindi": hindi.get("description_hindi", title_english),
        "company_name": company,
        "location_area": area,
        "category": category,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_text_hindi": salary_text,
        "qualification": hindi.get("qualification", "कोई विशेष योग्यता नहीं"),
        "experience": hindi.get("experience", "कोई अनुभव नहीं चाहिए"),
        "contact_number": "",
        "job_type": job_type,
        "source": f"scraped-{scraped.get('source', 'web')}",
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    dry_run = "--dry-run" in sys.argv
    log_header()
    posted_jobs = load_posted_jobs()
    posted_count = 0
    skipped_count = 0
    start_time = time.time()

    # Step 1: Scrape
    all_jobs = scrape_all_sources()
    if not all_jobs:
        log("⚠️  No jobs found from any source. Exiting.")
        log_footer(0, 0, time.time() - start_time)
        return

    log(f"\n🤖 Total scraped: {len(all_jobs)} jobs")

    # Step 2: Deduplicate by title
    seen = set()
    unique_jobs = []
    for j in all_jobs:
        key = f"{j['company']}|{j['title']}".lower().strip()
        key = re.sub(r"\s+", " ", key)
        if key not in seen:
            seen.add(key)
            unique_jobs.append(j)

    log(f"🔍 Unique jobs: {len(unique_jobs)}")

    # Step 3: Process each job
    posted_in_session = []
    for i, job in enumerate(unique_jobs):
        if len(posted_in_session) >= MAX_JOBS_PER_RUN:
            log(f"\n⚠️  Reached max {MAX_JOBS_PER_RUN} jobs per run. Stopping.")
            break

        slug = generate_slug(job["company"], job["title"], detect_area(job.get("location", "")))

        if slug in posted_jobs:
            log(f"⏭️  Skipped (already posted): {job['title'][:50]}")
            skipped_count += 1
            continue

        # Step 3a: Convert to Hindi
        log(f"\n🤖 Processing: {job['title'][:60]}...")
        hindi = convert_to_hindi_gemini(job)

        payload = build_payload(job, hindi)
        payload["slug"] = slug

        if dry_run:
            print(f"  📦 [DRY RUN] Would post: {payload['title_hindi'][:50]}")
            posted_jobs.add(slug)
            posted_in_session.append(slug)
            posted_count += 1
            continue

        # Step 3b: Post to API
        success = post_job(payload)
        if not success:
            log(f"  🔄 Retrying once...")
            time.sleep(5)
            success = post_job(payload)

        if success:
            log(f"✓ Posted: {payload['title_hindi']} ({job['company']})")
            posted_jobs.add(slug)
            posted_in_session.append(slug)
            posted_count += 1
        else:
            log(f"✗ Failed: {job['title'][:50]}")

        time.sleep(REQUEST_DELAY)

    # Step 4: Save posted jobs
    save_posted_jobs(posted_jobs)

    elapsed = time.time() - start_time
    log_footer(posted_count, skipped_count, elapsed)


if __name__ == "__main__":
    main()
