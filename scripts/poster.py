import os
import re
import time

import requests

from scripts.utils import detect_city, detect_category, detect_job_type, generate_slug, clean_company_name

SITE_URL = os.getenv("SITE_URL", "https://lucknowkaam.vercel.app")
API_URL = f"{SITE_URL}/api/jobs/create"
API_KEY = os.getenv("LUCKNOWKAAM_API_KEY", "lucknowkaam_secret_2026")
REQUEST_DELAY = 1


def post_job(payload: dict) -> bool:
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    }
    try:
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=30)
        if resp.status_code in (200, 201):
            return True
        print(f"  API Error {resp.status_code}: {resp.text[:200]}")
        return False
    except requests.RequestException as e:
        print(f"  Network Error: {e}")
        return False


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
