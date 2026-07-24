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
    "security": ["security", "guard", "सिक्योरिटी", "watchman", "चौकीदार"],
    "government": ["government", "sarkari", "सरकारी", "govt", "railway", "bank", "police", "ssc", "upsc"],
}

JOB_TYPES = {
    "full-time": ["full time", "fulltime", "पूर्णकालिक"],
    "part-time": ["part time", "parttime", "अंशकालिक", "part-time"],
    "work-from-home": ["work from home", "remote", "घर से काम", "wfh", "online"],
}


def log(msg: str):
    print(f"  {msg}")


def detect_city(text: str) -> str:
    text_lower = text.lower()
    for city in INDIA_CITIES:
        if city.lower() in text_lower:
            return city
    return "India"


def detect_category(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text:
                return cat
    return "computer"


def detect_job_type(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    for jt, keywords in JOB_TYPES.items():
        for kw in keywords:
            if kw in text:
                return jt
    return "full-time"


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


def generate_slug(company: str, title: str, location: str) -> str:
    combined = f"{company}-{title}-{location}-{datetime.now().strftime('%B-%Y')}".lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", combined)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    slug = re.sub(r"-+", "-", slug)
    return slug[:100]
