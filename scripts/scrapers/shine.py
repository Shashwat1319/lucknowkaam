import re
import json

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class ShineScraper(BaseScraper):
    source_name = "Shine.com"

    def scrape(self) -> list:
        log(f"Scraping Source: {self.source_name}...")
        jobs = []

        resp = self.safe_get(
            "https://www.shine.com/job-search/fresher-jobs-in-india",
            timeout=20,
        )
        if not resp:
            log(f"  Found: 0 jobs")
            return jobs

        try:
            match = re.search(r'<script id="__NEXT_DATA__".*?>(.*?)</script>', resp.text, re.DOTALL)
            if not match:
                log("  No __NEXT_DATA__ found")
                return jobs

            data = json.loads(match.group(1))
            search_data = data.get("props", {}).get("pageProps", {}).get("initialState", {}).get("jsrp", {}).get("searchresult", {}).get("data", {})
            results = search_data.get("results", [])
            if not results:
                results = search_data.get("jobs", [])
            if not results and isinstance(search_data, list):
                results = search_data

            for j in results:
                try:
                    title = j.get("jJT") or j.get("title") or ""
                    if not title or len(title) < 5:
                        continue

                    company = clean_company_name(j.get("jCName") or j.get("jHF") or j.get("company") or "")
                    loc_raw = j.get("jLoc", [])
                    if isinstance(loc_raw, list):
                        location = detect_city(" ".join(loc_raw)) if loc_raw else "India"
                    else:
                        location = detect_city(str(loc_raw))

                    salary = j.get("jSal") or j.get("salary") or "वेतन पर बातचीत"
                    description = j.get("jJD") or j.get("description") or title

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": description,
                        "salary": salary,
                        "source": "shine",
                    })
                except Exception:
                    continue

        except Exception as e:
            log(f"  Error parsing Shine data: {e}")

        log(f"  Found: {len(jobs)} jobs")
        return jobs
