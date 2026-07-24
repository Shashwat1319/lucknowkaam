from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class IndeedScraper(BaseScraper):
    source_name = "Indeed India"

    def scrape(self) -> list:
        log(f"📡 Scraping Source: {self.source_name}...")
        jobs = []

        for start in [0, 10]:
            resp = self.safe_get(
                f"https://in.indeed.com/jobs?q=fresher&start={start}",
                timeout=15,
            )
            if not resp:
                continue

            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                cards = soup.select(".job_seen_beacon, .jobTitle, .job-card, div[data-jk]")
                if not cards:
                    cards = soup.select("table[class*='job'] tr, .resultContent, .cardOutline")
                for card in cards[:15]:
                    try:
                        title_el = card.select_one("h2, h3, .jobTitle, .title, a[data-jk]")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title or len(title) < 5:
                            continue

                        co = card.select_one(".companyName, .company, .employer, [data-company*='']")
                        loc = card.select_one(".companyLocation, .location, .loc")
                        sal = card.select_one(".salary-snippet, .salary, .sal, .metadata")

                        company = clean_company_name(co.get_text(strip=True) if co else "")
                        location = detect_city(loc.get_text(strip=True) if loc else "India")

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": title,
                            "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                            "source": "indeed",
                        })
                    except Exception:
                        continue
            except Exception:
                continue

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs
