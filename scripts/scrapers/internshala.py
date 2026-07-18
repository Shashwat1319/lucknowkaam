import json
import re
from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


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
