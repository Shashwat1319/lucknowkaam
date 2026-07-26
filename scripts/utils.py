import re
import hashlib
import json
import os
from datetime import datetime
from typing import Optional

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
    "shop-assistant": ["shop", "store", "retail", "dukan", "दुकान"],
    "data-entry": ["data entry", "typing", "computer operator", "डेटा एंट्री"],
    "driver": ["driver", "chauffeur", "cab", "ड्राइवर", "driving"],
    "teaching": ["teacher", "tutor", "coaching", "टीचर", "ट्यूशन", "teaching"],
    "work-from-home": ["work from home", "remote", "online", "घर से काम", "wfh"],
    "construction": ["construction", "labour", "mazdoor", "निर्माण", "builder", "site"],
    "hotel-restaurant": ["hotel", "restaurant", "cook", "chef", "होटल", "बेकरी", "bakery"],
    "medical": ["medical", "pharma", "nurse", "doctor", "मेडिकल", "hospital"],
    "sales": ["sales", "marketing", "telecaller", "सेल्स", "business"],
    "technical": ["technical", "engineer", "mechanic", "technician", "तकनीकी"],
    "computer": ["computer", "graphic", "designer", "web", "software", "कंप्यूटर"],
    "security": ["security", "guard", "सिक्योरिटी", "watchman", "चौकीदार"],
    "government": ["government", "sarkari", "सरकारी", "govt", "railway", "bank", "police", "ssc", "upsc"],
}

JOB_TYPES = {
    "full-time": ["full time", "fulltime", "पूर्णकालिक"],
    "part-time": ["part time", "parttime", "अंशकालिक"],
    "work-from-home": ["work from home", "remote", "घर से काम", "wfh", "online"],
}


def log(msg: str):
    print(f"  {msg}")


def detect_city(text: str) -> str:
    text_lower = text.lower()
    found = "India"
    for city in INDIA_CITIES:
        if city.lower() in text_lower:
            found = city
    return found


def _word_match(text: str, keyword: str) -> bool:
    pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
    return bool(re.search(pattern, text.lower()))


def detect_category(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if _word_match(text, kw):
                return cat
    return "computer"


def detect_job_type(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for jt, keywords in JOB_TYPES.items():
        for kw in keywords:
            if _word_match(text, kw):
                return jt
    return "full-time"


CITY_MAP = {
    "bengaluru": "Bangalore",
    "gurugram": "Gurgaon",
    "mysuru": "Mysore",
}


def clean_company_name(raw_name: str) -> str:
    if not raw_name:
        return "Company"
    name = raw_name.strip()
    name = re.sub(r'\d+$', '', name)
    name = re.sub(r'[^a-zA-Z0-9\s\.\&\'\-\–\—]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    if len(name) < 2:
        return "Local Company"
    if len(name) > 40:
        name = name[:40].strip()
    if name.replace(' ', '').isdigit():
        return "Local Company"
    return name


def generate_slug(company: str, title: str, location: str) -> str:
    content = f"{company}-{title}-{location}".lower()
    hash_part = hashlib.md5(content.encode()).hexdigest()[:8]
    slug = re.sub(r"[^a-z0-9\s-]", "", content)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    slug = re.sub(r"-+", "-", slug)
    slug = slug[:80].strip("-")
    return f"{slug}-{hash_part}"
