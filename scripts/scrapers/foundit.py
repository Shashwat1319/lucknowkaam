from bs4 import BeautifulSoup

from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class FounditScraper(BaseScraper):
    source_name = "Foundit"

    def scrape(self) -> list:
        log(f"📡 Scraping Source: {self.source_name}...")
        jobs = []

        resp = self.safe_get(
            "https://www.foundit.in/jobs/fresher",
            timeout=15,
        )
        if not resp:
            log(f"  ✓ Found: 0 jobs")
            return jobs

        try:
            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select(".job-card, .jobRow, .card, article, .job-result, li[data-job]")
            if not cards:
                cards = soup.select("div[class*='job'], section[class*='job']")
            for card in cards[:20]:
                try:
                    title_el = card.select_one("h2, h3, .job-title, .title, a[class*='title']")
                    title = title_el.get_text(strip=True) if title_el else ""
                    if not title or len(title) < 5:
                        continue

                    co = card.select_one(".company, .org, .employer, .company-name, .comp")
                    loc = card.select_one(".location, .loc, [class*=loc]")
                    sal = card.select_one(".salary, .sal, .pay, [class*=sal]")

                    company = clean_company_name(co.get_text(strip=True) if co else "")
                    location = detect_city(loc.get_text(strip=True) if loc else "India")

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": title,
                        "salary": sal.get_text(strip=True) if sal else "वेतन पर बातचीत",
                        "source": "foundit",
                    })
                except Exception:
                    continue
        except Exception:
            pass

        log(f"  ✓ Found: {len(jobs)} jobs")
        return jobs
