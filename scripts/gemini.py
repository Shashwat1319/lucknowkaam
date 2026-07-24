import json
import random
import os
import time
from typing import Optional

from scripts.utils import detect_category, detect_job_type, log

MAX_RETRIES = 3
INITIAL_BACKOFF = 2
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

QUALIFICATION_OPTIONS = [
    "कोई विशेष योग्यता नहीं",
    "10वीं पास",
    "12वीं पास",
    "ग्रेजुएट (कोई भी स्ट्रीम)",
    "ग्रेजुएट (कॉमर्स/साइंस)",
    "आईटीआई / डिप्लोमा धारक",
    "बी.एड / टीचिंग डिग्री",
    "बी.कॉम / एम.कॉम",
]

EXPERIENCE_OPTIONS = [
    "कोई अनुभव नहीं चाहिए (फ्रेशर्स भी आवेदन कर सकते हैं)",
    "0-1 साल का अनुभव",
    "1-2 साल का अनुभव",
    "2-3 साल का अनुभव",
    "3-5 साल का अनुभव",
]

SALARY_TEMPLATES = [
    "₹{min} - ₹{max} प्रति माह (अनुभव पर निर्भर)",
    "₹{min} प्रति माह (प्लस इन्सेंटिव)",
    "₹{min} - ₹{max} प्रति माह + PF/ESIC",
    "वेतन पर बातचीत होगी (₹{min} - ₹{max} तक)",
    "₹{min} प्रति माह (सीखने का मौका + सैलरी)",
]

HINDI_TEMPLATES = {
    "delivery": [
        "🔥 {company} में डिलीवरी पार्टनर की निकली भर्ती! {city} में तुरंत जॉइन करें। प्रति महीना {salary} तक कमाएं। अपनी बाइक/स्कूटी होनी चाहिए। {experience}। इन्सेंटिव + बोनस अलग से मिलेगा।",
        "📦 {company} दे रहा है जबरदस्त मौका डिलीवरी बॉय बनने का! {city} में पोस्टिंग। रोजाना कैश आउट की सुविधा। {salary} + इन्सेंटिव। जल्दी करें, सीमित सीटें!",
        "🛵 डिलीवरी जॉब {city} में — {company} के साथ जुड़ें। फ्लेक्सिबल टाइमिंग, अपनी मर्जी से काम करें। {salary} प्रति माह। {qualification}। 18 साल से ऊपर वाले आवेदन कर सकते हैं।",
        "⚡ {company} में उर्जेंट वैकेंसी: डिलीवरी एग्जीक्यूटिव! {city} लोकेशन। डेली पेमेंट ऑप्शन। {salary} + पेट्रोल अलाउंस। {experience}। देर मत कीजिए!",
        "🏍️ {company} के लिए डिलीवरी पार्टनर चाहिए {city} में। सैलरी {salary} + फ्यूल अलाउंस + टिप्स। वैलिड ड्राइविंग लाइसेंस जरूरी। {experience}। आज ही अप्लाई करें।",
    ],
    "data-entry": [
        "💻 बैठे-बिठाए कमाएं! {company} में डेटा एंट्री ऑपरेटर चाहिए। {city} ऑफिस में काम करना होगा। {salary}। {qualification}। {experience}। टाइपिंग स्पीड अच्छी होनी चाहिए।",
        "📊 {company} में कंप्यूटर ऑपरेटर / डेटा एंट्री के लिए फ्रेशर्स आवेदन कर सकते हैं। {city} में काम। {salary}। बेसिक कंप्यूटर नॉलेज चाहिए। {experience}।",
        "⌨️ डेटा एंट्री जॉब {city} — {company} के साथ। {salary} मिलेगा। {qualification}। {experience}। हिंदी और इंग्लिश टाइपिंग आनी चाहिए। ऑफिस टाइमिंग फिक्स।",
        "🖥️ {company} में उर्जेंट वैकेंसी — डेटा एंट्री / बैक ऑफिस। {city} ऑफिस। {salary} + इंसेंटिव। {qualification}। कंप्यूटर का बेसिक ज्ञान जरूरी। {experience}।",
        "📋 बड़ी कंपनी {company} में एडमिन / डेटा एंट्री की जॉब। {city} में पोस्टिंग। {salary} - {experience}। {qualification} वाले अप्लाई करें। परफेक्ट काम का माहौल।",
    ],
    "driver": [
        "🚚 {company} में ड्राइवर चाहिए {city} में। {salary} + TA/DA अलग से। {qualification}। {experience}। वैलिड ड्राइविंग लाइसेंस (लाइट/हैवी) जरूरी है। नशा मुक्त उम्मीदवार चाहिए।",
        "🚛 {company} के लिए कमर्शियल ड्राइवर की भर्ती। {city} लोकल रूट। {salary} पर बातचीत। {experience}। सभी दस्तावेज पूरे होने चाहिए। तुरंत जॉइन करें।",
        "🚐 {company} में पर्सनल/ऑफिस ड्राइवर चाहिए। {city} में काम। {salary}। {qualification}। {experience}। टाइम पंक्चुअलिटी जरूरी। गुड बिहेवियर उम्मीदवार को प्राथमिकता।",
        "🛻 {company} के ट्रांसपोर्ट डिपार्टमेंट में ड्राइवर चाहिए। {city} में पोस्टिंग। {salary} + ओवरटाइम अलाउंस। {experience}। {qualification}।",
        "🚘 उर्जेंट ड्राइवर जॉब {city} — {company} में। सैलरी {salary}। {experience}। क्लीन ड्राइविंग रिकॉर्ड चाहिए। {qualification}। रहने की व्यवस्था कंपनी करेगी।",
    ],
    "teaching": [
        "🎓 {company} में टीचर / ट्यूटर चाहिए {city} में। {salary}। {qualification}। {experience}। बच्चों को पढ़ाने का शौक होना चाहिए। अच्छा कम्युनिकेशन जरूरी।",
        "📚 {company} को एक्सपीरियंस्ड टीचर की जरूरत है। सब्जेक्ट — {title}। {city} लोकेशन। {salary}। {qualification}। {experience}। फ्रेंडली एटमॉस्फियर।",
        "🏫 प्राइवेट कोचिंग / स्कूल में टीचिंग जॉब। {company}, {city}। {salary}। {qualification} वाले शिक्षक अप्लाई करें। {experience}। क्लासरूम मैनेजमेंट स्किल्स चाहिए।",
        "👩‍🏫 {company} के लिए भर्ती: शिक्षक (सभी विषय)। {city} में पोस्टिंग। सैलरी {salary}। {qualification}। {experience}। ट्रेनिंग दी जाएगी। नौकरी स्टेबल है।",
        "📖 {company} में ट्यूटर / होम ट्यूशन के लिए शिक्षक चाहिए। {city} एरिया। {salary}। {qualification}। {experience}। पार्ट टाइम / फुल टाइम दोनों चलेंगे।",
    ],
    "security": [
        "🛡️ {company} में सिक्योरिटी गार्ड चाहिए। {city} लोकेशन। {salary}। {qualification}। {experience}। दिन/रात की शिफ्ट उपलब्ध। यूनिफॉर्म कंपनी देगी।",
        '🔒 {company} को सिक्योरिटी स्टाफ चाहिए {city} में। {salary}। {qualification}। {experience}। हाइट कम से कम 5\'6" चाहिए। फिजिकली फिट उम्मीदवार।',
    ],
    "sales": [
        "💰 {company} में सेल्स / मार्केटिंग के लिए भर्ती। {city} में काम। {salary} + टार्गेट बोनस। {qualification}। {experience}। कम्युनिकेशन स्किल्स चाहिए। करियर ग्रोथ अच्छी है।",
        "📈 {company} में बिजनेस डेवलपमेंट एग्जीक्यूटिव चाहिए। {city} मार्केट। {salary} + इन्सेंटिव। {qualification}। {experience}। सेल्स वालों के लिए सुनहरा मौका।",
    ],
    "default": [
        "🔔 {company} में {title} की निकली वैकेंसी! {city} में काम करने का मौका। सैलरी {salary}। {qualification}। {experience}। ज्यादा उम्मीदवार नहीं चाहिए, तो जल्दी करें।",
        "✅ {company} दे रहा है नौकरी का सुनहरा मौका — {title}। {city} में पोस्टिंग। {salary}। {qualification}। {experience}। इंटरव्यू की कोई जरूरत नहीं, सीधा सेलेक्शन।",
        "🔥 उर्जेंट हायरिंग: {company} को चाहिए {title}। {city} लोकेशन। {salary}। {qualification}। {experience}। आज ही अप्लाई करें, कल जॉइन करें।",
        "📣 {company} — {title} पद के लिए इच्छुक उम्मीदवार आवेदन करें। जॉब लोकेशन: {city}। {salary}। क्वालिफिकेशन: {qualification}। {experience}। फुल टाइम / पार्ट टाइम।",
        "🎯 {company} में {title} की निकली भर्ती। लाखों लोगों ने अप्लाई किया है, आप भी करें। {city}। {salary}। {qualification}। {experience}। सीमित पद, जल्दी करें।",
    ],
}


def _generate_salary_text(salary_raw: str) -> str:
    if not salary_raw or salary_raw == "वेतन पर बातचीत होगी":
        return "वेतन पर बातचीत होगी"

    import re
    nums = re.findall(r"\d[\d,]*", salary_raw.replace(",", ""))
    if len(nums) >= 2:
        try:
            mn = int(nums[0].replace(",", ""))
            mx = int(nums[1].replace(",", ""))
            return random.choice(SALARY_TEMPLATES).format(min=mn, max=mx)
        except ValueError:
            pass
    elif len(nums) == 1:
        try:
            mn = int(nums[0].replace(",", ""))
            return f"₹{mn} प्रति माह"
        except ValueError:
            pass
    return "वेतन पर बातचीत होगी"


def _call_gemini(prompt: str) -> Optional[str]:
    global _GEMINI_UNAVAILABLE
    if not GEMINI_API_KEY or _GEMINI_UNAVAILABLE:
        return None

    last_err = None
    for attempt in range(MAX_RETRIES):
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
                model = genai.GenerativeModel("gemini-2.0-flash")
                response = model.generate_content(prompt)
                return response.text
        except Exception as e:
            last_err = e
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                retry_after = INITIAL_BACKOFF * (2 ** attempt)
                log(f"⏳ Gemini quota hit (attempt {attempt+1}/{MAX_RETRIES}), waiting {retry_after}s...")
                time.sleep(retry_after)
                continue
            log(f"⚠️  Gemini API error: {e}")
            break

    if "429" in str(last_err) or "RESOURCE_EXHAUSTED" in str(last_err):
        log(f"⛔ Gemini quota exhausted after {MAX_RETRIES} retries, disabling for this run")
        _GEMINI_UNAVAILABLE = True
    return None


def _template_hindi_wrapper(job_data: dict) -> dict:
    title = job_data.get("title", "Naukari")
    company = job_data.get("company", "Company")
    city = job_data.get("location", "India")
    salary_raw = job_data.get("salary", "")
    category = detect_category(title)
    job_type = detect_job_type(title)

    templates = HINDI_TEMPLATES.get(category, HINDI_TEMPLATES["default"])
    template = random.choice(templates)
    salary_text = _generate_salary_text(salary_raw)
    qualification = random.choice(QUALIFICATION_OPTIONS)
    experience = random.choice(EXPERIENCE_OPTIONS)

    description_hindi = template.format(
        company=company, city=city, title=title,
        job_type=job_type, salary=salary_text,
        qualification=qualification, experience=experience,
    )

    title_templates = [
        f"{company} में {title} की भर्ती, {city} — {salary_text}",
        f"🔥 {title} — {company}, {city} | {salary_text}",
        f"{title} जॉब {city} में — {company} के साथ | {salary_text}",
        f"नौकरी: {title} — {company}, {city} ({salary_text})",
    ]
    title_hindi = random.choice(title_templates)

    return {
        "title_hindi": title_hindi,
        "description_hindi": description_hindi,
        "qualification": qualification,
        "experience": experience,
        "salary_text_hindi": salary_text,
    }


def convert_to_hindi(job_data: dict) -> dict:
    global _gemini_calls_today
    if not GEMINI_API_KEY or _GEMINI_UNAVAILABLE:
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
        log("  → Gemini unavailable, using Hindi template")
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
        log("  → Gemini returned bad JSON, using Hindi template")
        return _template_hindi_wrapper(job_data)

    parsed.setdefault("title_hindi", job_data.get("title", ""))
    parsed.setdefault("description_hindi", job_data.get("description", ""))
    parsed.setdefault("qualification", "कोई विशेष योग्यता नहीं")
    parsed.setdefault("experience", "कोई अनुभव नहीं चाहिए")
    parsed.setdefault("salary_text_hindi", job_data.get("salary", ""))
    return parsed
