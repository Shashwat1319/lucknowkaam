from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class ShineScraper(BaseScraper):
    source_name = "Shine.com"

    def scrape(self) -> list:
        log(f"📡 Scraping Source 2: {self.source_name}...")
        resp = self.safe_get("https://www.shine.com/job-search/fresher-jobs-in-india/")
        if not resp:
            return []

        jobs = []
        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            for card in soup.select(".jobCard, .job-card, article, .card, li")[:20]:
                try:
                    title_el = card.select_one("h2, h3, .jobTitle, .title")
                    title = title_el.get_text(strip=True) if title_el else ""
                    if not title or len(title) < 5:
                        continue
                    co = card.select_one(".company, .org, .employer, .company-name, [class*=comp]")
                    loc = card.select_one(".location, .loc, .place, [class*=loc]")
                    sal = card.select_one(".salary, .sal, [class*=sal]")
                    company = clean_company_name(co.get_text(strip=True) if co else "")
                    location = detect_city(loc.get_text(strip=True) if loc else "India")
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": title,
                        "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                        "source": "shine",
                    })
                except Exception:
                    continue
        except Exception:
            pass

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs
