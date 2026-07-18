import json
import random
import os
from typing import Optional

from scripts.utils import detect_category, detect_job_type, log

GEMINI_DAILY_LIMIT = 10
_gemini_calls_today = 0
_GEMINI_UNAVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

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


def convert_to_hindi(job_data: dict) -> dict:
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
