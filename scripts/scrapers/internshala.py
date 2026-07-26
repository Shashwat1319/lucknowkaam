import json
import re
from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class InternshalaScraper(BaseScraper):
    source_name = "Internshala"

    def _parse_url(self, url: str) -> tuple:
        title, location, company = "Job", "India", "Internshala"
        try:
            seg = url.rstrip("/").split("/")[-1]
            seg = seg.split("?")[0]

            for sep in ("-job-in-", "-jobs-in-"):
                if sep in seg:
                    parts = seg.split(sep, 1)
                    before = parts[0]
                    rest = parts[1]
                    segments = rest.split("-at-")
                    loc_part = segments[0].replace("-", " ").title()
                    location = detect_city(loc_part) if loc_part != "Multiple Locations" else "India"

                    before_parts = before.rsplit("-", 1)
                    if len(before_parts) > 1 and before_parts[1] in ["fresher", "internship", "part", "full"]:
                        title = before_parts[0].replace("-", " ").title()
                    else:
                        title = before.replace("-", " ").title()

                    if len(segments) >= 2:
                        co_raw = segments[1]
                        co_raw = re.sub(r'\d+.*$', '', co_raw).replace("-", " ").title().strip()
                        if co_raw and co_raw.lower() != "multiple locations":
                            company = clean_company_name(co_raw)
                    break
            else:
                for sep in ("-at-",):
                    if sep in seg:
                        parts = seg.split(sep, 1)
                        title = parts[0].replace("-", " ").title()
                        rest = parts[1]
                        loc_match = re.search(r'(?:-in-|$)', rest)
                        if loc_match:
                            co_raw = rest[:loc_match.start()].replace("-", " ").title().strip()
                            if co_raw and co_raw.lower() != "multiple locations":
                                company = clean_company_name(co_raw)
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
                            "description": f"Internshala ki {location} mein {title} ki bharti",
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
