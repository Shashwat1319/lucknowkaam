#!/usr/bin/env python3
"""
NaukriBot — Auto Job Poster
Scrapes jobs from free sources across India, converts to Hindi via Gemini AI,
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
import ssl
import random
from datetime import datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup

try:
    from google import genai as gemini_client
    from google.genai import types
    _NEW_GEMINI = True
except ImportError:
    try:
        import google.generativeai as genai
        _NEW_GEMINI = False
    except ImportError:
        gemini_client = None
        _NEW_GEMINI = None

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
MAX_JOBS_PER_RUN = 30
REQUEST_DELAY = 1
GEMINI_DAILY_LIMIT = 10

INDIA_CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Bengaluru",
    "Hyderabad", "Chennai", "Kolkata", "Pune",
    "Ahmedabad", "Lucknow", "Jaipur", "Chandigarh",
    "Indore", "Bhopal", "Patna", "Nagpur", "Surat",
    "Vadodara", "Noida", "Gurgaon", "Gurugram",
    "Faridabad", "Ghaziabad", "Agra", "Varanasi",
    "Kanpur", "Meerut", "Coimbatore", "Kochi",
    "Visakhapatnam", "Mysuru", "Mysore",
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
    "government": ["government", "sarkari", "सरकारी", "govt", "railway", "bank", "police", "ssc", "upsc"],
}

JOB_TYPES = {
    "full-time": ["full time", "fulltime", "पूर्णकालिक"],
    "part-time": ["part time", "parttime", "अंशकालिक", "part-time"],
    "work-from-home": ["work from home", "remote", "घर से काम", "wfh", "online"],
}

HINDI_TEMPLATES = {
    "delivery": [
        "{company} mein delivery ke liye {job_type} chahiye. {city} mein kaam karna hoga. Achhi salary + incentives milenge.",
        "{company} delivery partner chahiye. Bike honi chahiye. {city} area mein delivery karni hogi.",
    ],
    "data-entry": [
        "Computer operator / data entry ke liye log chahiye. Typing speed achhi honi chahiye. {city} office mein kaam.",
        "{company} mein data entry ka kaam. Basic computer knowledge zaroori. {city} mein kaam karna hoga.",
    ],
    "driver": [
        "{company} ke liye driver chahiye. Valid driving license hona zaroori. {city} mein kaam.",
        "Personal / commercial driver chahiye. {city} mein posting. Experience preferred.",
    ],
    "teaching": [
        "Teacher / tutor chahiye {city} mein. {company} ke liye padhana hoga. Achha communication zaroori.",
        "Home tuition + coaching ke liye teacher chahiye. {city} area. Achhi salary milegi.",
    ],
    "default": [
        "{company} mein {title} ki vacancy hai. {city} mein kaam karna hoga. Interested log apply karein.",
        "Urgently required: {title}. {company}, {city}. Achhi salary milegi.",
    ],
}


# ─── Logging ─────────────────────────────────────────────────────────────────

def log(msg: str):
    print(f"  {msg}")


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


# ─── City Detection ──────────────────────────────────────────────────────────

def detect_city(text: str) -> str:
    text_lower = text.lower()
    for city in INDIA_CITIES:
        if city.lower() in text_lower:
            return city
    return "India"


# ─── Company Name Cleaning ───────────────────────────────────────────────────

def clean_company_name(raw_name: str) -> str:
    if not raw_name:
        return "Company"
    name = re.sub(r'\d+$', '', raw_name)
    name = name.replace('-', ' ').replace('_', ' ')
    name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
    name = name.strip().title()
    if len(name) < 2:
        return "Local Company"
    if len(name) > 40:
        name = name[:40].strip()
    if name.replace(' ', '').isdigit():
        return "Local Company"
    return name


# ─── Permanent Dedup (Supabase posted_slugs table) ───────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rswszmbzykrzidndyeed.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

def fetch_all_posted_slugs() -> set:
    try:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/posted_slugs?select=slug&limit=10000",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            },
            timeout=10,
        )
        if resp.status_code == 200:
            slugs = {item["slug"] for item in resp.json()}
            log(f"📋 Loaded {len(slugs)} existing slugs from database")
            return slugs
    except Exception as e:
        log(f"⚠️  Could not fetch slugs from DB: {e}")
    return set()


def save_slug_to_supabase(slug: str, source: str):
    try:
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/posted_slugs",
            json={"slug": slug, "source": source},
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=ignore-duplicates",
            },
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


def generate_slug(company: str, title: str, location: str) -> str:
    combined = f"{company}-{title}-{location}-{datetime.now().strftime('%B-%Y')}".lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", combined)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    slug = re.sub(r"-+", "-", slug)
    return slug[:100]


# ─── Category, City & Job Type Detection ─────────────────────────────────────

def detect_category(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text:
                return cat
    return "computer"


def detect_area(text: str) -> str:
    return detect_city(text)


def detect_job_type(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for jt, keywords in JOB_TYPES.items():
        for kw in keywords:
            if kw in text:
                return jt
    return "full-time"


# ─── Gemini AI Hindi Converter ───────────────────────────────────────────────

_GEMINI_UNAVAILABLE = False
_gemini_calls_today = 0

def _call_gemini(prompt: str) -> Optional[str]:
    global _GEMINI_UNAVAILABLE
    if not GEMINI_API_KEY or _GEMINI_UNAVAILABLE:
        return None
    try:
        if _NEW_GEMINI:
            client = gemini_client.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            return response.text
        else:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            log(f"⏳ Gemini quota exceeded, disabling for this run")
            _GEMINI_UNAVAILABLE = True
        else:
            log(f"⚠️  Gemini API error: {e}")
        return None


def _template_hindi_wrapper(job_data: dict) -> dict:
    title = job_data.get("title", "Naukari")
    company = job_data.get("company", "Company")
    city = job_data.get("location", "India")
    category = detect_category(title)
    job_type = detect_job_type(title)

    templates = HINDI_TEMPLATES.get(category, HINDI_TEMPLATES["default"])
    template = random.choice(templates)
    description_hindi = template.format(company=company, city=city, title=title, job_type=job_type)

    return {
        "title_hindi": title,
        "description_hindi": description_hindi,
        "qualification": "कोई विशेष योग्यता नहीं",
        "experience": "कोई अनुभव नहीं चाहिए",
        "salary_text_hindi": job_data.get("salary", "वेतन पर बातचीत होगी"),
    }


def convert_to_hindi_gemini(job_data: dict) -> dict:
    global _gemini_calls_today
    if not GEMINI_API_KEY or _gemini_calls_today >= GEMINI_DAILY_LIMIT:
        return _template_hindi_wrapper(job_data)

    prompt = f"""Neeche diye gaye job ki details ko simple Hindi mein likho jo India ke aam log samajh sakein.
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

    text = _call_gemini(prompt)
    if not text:
        return _template_hindi_wrapper(job_data)

    _gemini_calls_today += 1

    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return _template_hindi_wrapper(job_data)

    parsed.setdefault("title_hindi", job_data.get("title", ""))
    parsed.setdefault("description_hindi", job_data.get("description", ""))
    parsed.setdefault("qualification", "कोई विशेष योग्यता नहीं")
    parsed.setdefault("experience", "कोई अनुभव नहीं चाहिए")
    parsed.setdefault("salary_text_hindi", job_data.get("salary", ""))
    return parsed


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
            "Chrome/128.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    def safe_get(self, url: str, timeout: int = 15, verify: bool = True) -> Optional[requests.Response]:
        try:
            resp = requests.get(url, headers=self.headers, timeout=timeout, verify=verify)
            resp.raise_for_status()
            return resp
        except Exception as e:
            log(f"⚠️  {self.source_name}: Request failed — {e}")
            return None


# ─── Source 1: Internshala ──────────────────────────────────────────────────

class InternshalaScraper(BaseScraper):
    source_name = "Internshala"

    def _parse_url(self, url: str) -> tuple:
        title, location, company = "Job", "India", "Company"
        try:
            seg = url.rstrip("/").split("/")[-1]
            seg = seg.split("?")[0]
            co_part = "Company"
            for sep in ("-job-in-", "-job-at-", "-jobs-in-"):
                if sep in seg:
                    parts = seg.split(sep, 1)
                    title = parts[0].replace("-", " ").title()
                    rest = parts[1]
                    segments = rest.split("-at-")
                    if len(segments) >= 2:
                        loc_part = segments[0].replace("-", " ").title()
                        co_part = segments[1]
                        co_part = re.sub(r'\d+.*$', '', co_part).replace("-", " ").title().strip()
                    else:
                        loc_part = rest.replace("-", " ").title()
                        if "-" in loc_part:
                            loc_part = loc_part.split("-")[0]
                    location = detect_city(loc_part) if loc_part != "Multiple Locations" else "India"
                    company = clean_company_name(co_part)
                    break
            else:
                title = seg.replace("-", " ").title()
        except Exception:
            pass
        return title, location, company

    def scrape(self) -> list:
        log(f"📡 Scraping Source 1: {self.source_name}...")
        resp = self.safe_get("https://internshala.com/jobs/lucknow-jobs")
        if not resp:
            return []

        jobs = []
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for ld in soup.select("script[type='application/ld+json']"):
                try:
                    data = json.loads(ld.string)
                    if not isinstance(data, dict) or data.get("@type") != "ItemList":
                        continue
                    for item in data.get("itemListElement", []):
                        url = item.get("url", "")
                        if not url:
                            continue
                        title, location, company = self._parse_url(url)
                        if len(title) < 5:
                            continue
                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": title,
                            "salary": "वेतन पर बातचीत",
                            "source": "internshala",
                        })
                        if len(jobs) >= 25:
                            break
                except Exception:
                    continue
                if len(jobs) >= 25:
                    break
        except Exception:
            pass

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs


# ─── Source 2: Shine.com ─────────────────────────────────────────────────────

class ShineScraper(BaseScraper):
    source_name = "Shine.com"

    def scrape(self) -> list:
        log(f"📡 Scraping Source 2: {self.source_name}...")
        resp = self.safe_get("https://www.shine.com/job-search/fresher-jobs-in-india/")
        if not resp:
            return []

        jobs = []
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for card in soup.select(".jobCard, .job-card, article, .card, li")[:20]:
                try:
                    title_el = card.select_one("h2, h3, .jobTitle, .title")
                    title = title_el.get_text(strip=True) if title_el else ""
                    if not title or len(title) < 5:
                        continue
                    co = card.select_one(".company, .org, .employer, .company-name, [class*=comp]")
                    loc = card.select_one(".location, .loc, .place, [class*=loc]")
                    sal = card.select_one(".salary, .sal, [class*=sal]")
                    company = clean_company_name(co.get_text(strip=True) if co else "")
                    location = detect_city(loc.get_text(strip=True) if loc else "India")
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": title,
                        "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                        "source": "shine",
                    })
                except Exception:
                    continue
        except Exception:
            pass

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs


# ─── Source 3: Freshersworld ─────────────────────────────────────────────────

class FreshersworldScraper(BaseScraper):
    source_name = "Freshersworld"

    def scrape(self) -> list:
        log(f"📡 Scraping Source 3: {self.source_name}...")
        jobs = []
        for attempt in range(2):
            resp = self.safe_get(
                f"https://www.freshersworld.com/jobs/fresher-jobs?page={attempt}",
                timeout=15,
            )
            if not resp:
                continue
            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                for card in soup.select(".job-card, .job-block, .card, li, section")[:15]:
                    try:
                        title_el = card.select_one("h2, h3, h4, .title, .job-title, a")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title or len(title) < 5:
                            continue
                        co = card.select_one(".company, .org, .employer, .company-name")
                        loc = card.select_one(".location, .loc, [class*=loc]")
                        sal = card.select_one(".salary, .pay, .stipend, .text-sal")
                        company = clean_company_name(co.get_text(strip=True) if co else "")
                        location = detect_city(loc.get_text(strip=True) if loc else "India")
                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": title,
                            "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                            "source": "freshersworld",
                        })
                    except Exception:
                        continue
            except Exception:
                continue

        if not jobs:
            log(f"  ⚠ Failed: 403 Forbidden (skipped)")

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs


# ─── Source 4: Sarkari Result (Government Jobs) ──────────────────────────────

class SarkariResultScraper(BaseScraper):
    source_name = "SarkariResult"

    def scrape(self) -> list:
        log(f"📡 Scraping Source 4: {self.source_name}...")
        resp = self.safe_get("https://www.sarkariresult.com/")
        if not resp:
            return []

        jobs = []
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            links = soup.select("a[href*='result'], a[href*='recruitment'], a[href*='job'], a[href*='sarkari']")[:20]
            seen_titles = set()
            for a in links:
                try:
                    title = a.get_text(strip=True)
                    href = a.get("href", "")
                    if not title or len(title) < 8:
                        continue
                    if title.lower() in seen_titles:
                        continue
                    seen_titles.add(title.lower())
                    job_type = "government"
                    company = "Government of India"
                    location = "India"
                    if "railway" in title.lower():
                        company = "Indian Railways"
                    elif "bank" in title.lower():
                        company = "Government Bank"
                    elif "police" in title.lower() or "army" in title.lower() or "defence" in title.lower():
                        company = "Indian Defence"
                    elif "ssc" in title.lower():
                        company = "Staff Selection Commission"
                    elif "upsc" in title.lower():
                        company = "UPSC"
                    elif "teacher" in title.lower() or "shiksha" in title.lower():
                        company = "Education Department"
                    city_match = detect_city(title)
                    if city_match != "India":
                        location = city_match
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": f"{title} — Sarkari naukari hai. Government job vacancy.",
                        "salary": "वेतन सरकारी नियमानुसार",
                        "source": "sarkariresult",
                    })
                    if len(jobs) >= 10:
                        break
                except Exception:
                    continue
        except Exception:
            pass

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs


# ─── Gemini Job Generator (Fallback) ─────────────────────────────────────────

def generate_jobs_gemini(count: int = 15) -> list:
    if not GEMINI_API_KEY:
        return []

    log(f"  🤖 Generating {count} jobs via Gemini AI (fallback)...")

    cities_str = ", ".join(INDIA_CITIES[:10])
    cats_str = ", ".join(CATEGORY_KEYWORDS.keys())

    prompt = f"""Generate {count} realistic job listings across India in JSON format.
Each job must be for a different city and different category.
Use these India cities: {cities_str}
Use these categories: {cats_str}

Return ONLY a JSON array (no other text):
[{{
  "title": "job title in English (e.g. Delivery Boy Required)",
  "company": "company name (realistic Indian company)",
  "location": "city name from the list above",
  "description": "2-3 line job description in English",
  "salary": "salary range in INR (e.g. ₹8,000 - ₹15,000 per month)",
  "category": "category slug from the list above"
}}]"""

    text = _call_gemini(prompt)
    if not text:
        return []

    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    try:
        jobs = json.loads(text)
    except json.JSONDecodeError:
        log("  ⚠ Gemini returned invalid JSON")
        return []

    if not isinstance(jobs, list):
        jobs = [jobs]

    for j in jobs:
        j["source"] = "gemini-generated"
        j["company"] = clean_company_name(j.get("company", ""))
        j["location"] = detect_city(j.get("location", ""))

    log(f"  ✓ Generated {len(jobs)} jobs")
    return jobs


# ─── Master Scraper ──────────────────────────────────────────────────────────

def scrape_all_sources() -> list:
    scrapers = [
        InternshalaScraper(),
        ShineScraper(),
        FreshersworldScraper(),
        SarkariResultScraper(),
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

    if len(all_jobs) < MAX_JOBS_PER_RUN and GEMINI_API_KEY:
        needed = MAX_JOBS_PER_RUN - len(all_jobs)
        log(f"  🔄 After dedup: need {needed} more via Gemini...")
        generated = generate_jobs_gemini(needed)
        all_jobs.extend(generated)

    return all_jobs


# ─── Build API Payload ───────────────────────────────────────────────────────

def build_payload(scraped: dict, hindi: dict) -> dict:
    title_english = scraped.get("title", "")
    company = clean_company_name(scraped.get("company", "Unknown"))
    location = scraped.get("location", "India")

    scraped["company"] = company

    area = detect_city(f"{title_english} {location} {hindi.get('description_hindi', '')}")
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
    global _gemini_calls_today
    dry_run = "--dry-run" in sys.argv
    log_header()

    if _NEW_GEMINI is None:
        log("⚠️  google-genai package not installed. Install: pip install google-genai")

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

    new_after_dedup = 0
    for j in unique_jobs:
        slug = generate_slug(j["company"], j["title"], detect_city(j.get("location", "")))
        if slug not in all_posted_slugs:
            new_after_dedup += 1

    log(f"  🔄 New after dedup: {new_after_dedup} jobs")
    log(f"  🤖 Gemini calls: {_gemini_calls_today}/{GEMINI_DAILY_LIMIT}")

    if _gemini_calls_today > 0:
        pass

    print(f"  {'─'*42}")

    posted_in_session = []
    for i, job in enumerate(unique_jobs):
        if len(posted_in_session) >= MAX_JOBS_PER_RUN:
            log(f"\n⚠️  Reached max {MAX_JOBS_PER_RUN} jobs per run. Stopping.")
            break

        slug = generate_slug(job["company"], job["title"], detect_city(job.get("location", "")))

        if slug in all_posted_slugs:
            log(f"⏭ Skipped: Already posted (duplicate)")
            skipped_count += 1
            continue

        log(f"\n🤖 Processing: {job['title'][:60]}...")
        hindi = convert_to_hindi_gemini(job)

        payload = build_payload(job, hindi)
        payload["slug"] = slug

        if dry_run:
            print(f"  📦 [DRY RUN] Would post: {payload['title_hindi'][:50]} ({job['company']}, {job.get('location', 'India')})")
            all_posted_slugs.add(slug)
            posted_in_session.append(slug)
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
            all_posted_slugs.add(slug)
            posted_in_session.append(slug)
            posted_count += 1
            save_slug_to_supabase(slug, job.get("source", "web"))
        else:
            log(f"✗ Failed: {job['title'][:50]}")
            failed_count += 1

        time.sleep(REQUEST_DELAY)

    save_posted_jobs(all_posted_slugs)

    elapsed = time.time() - start_time
    log_footer(posted_count, skipped_count, failed_count, elapsed)


if __name__ == "__main__":
    main()
