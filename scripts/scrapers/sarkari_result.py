from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, log


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
