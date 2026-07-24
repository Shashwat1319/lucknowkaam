from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class FreshersworldScraper(BaseScraper):
    source_name = "Freshersworld"

    def scrape(self) -> list:
        log(f"📡 Scraping Source 3: {self.source_name}...")
        jobs = []
        for attempt in range(2):
            resp = self.safe_get(
                f"https://www.freshersworld.com/jobs/fresher-jobs?page={attempt}",
                timeout=15,
            )
            if not resp:
                continue
            try:
                soup = BeautifulSoup(resp.text, "html.parser")
                for card in soup.select(".job-card, .job-block, .card, li, section")[:15]:
                    try:
                        title_el = card.select_one("h2, h3, h4, .title, .job-title, a")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title or len(title) < 5:
                            continue
                        co = card.select_one(".company, .org, .employer, .company-name")
                        loc = card.select_one(".location, .loc, [class*=loc]")
                        sal = card.select_one(".salary, .pay, .stipend, .text-sal")
                        company = clean_company_name(co.get_text(strip=True) if co else "")
                        location = detect_city(loc.get_text(strip=True) if loc else "India")
                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": title,
                            "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                            "source": "freshersworld",
                        })
                    except Exception:
                        continue
            except Exception:
                continue

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs
