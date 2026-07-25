from .base import BaseScraper
from scripts.utils import detect_city, clean_company_name, log


class TimesJobsScraper(BaseScraper):
    source_name = "TimesJobs"

    def scrape(self) -> list:
        log(f"Scraping Source: {self.source_name}...")
        jobs = []

        try:
            import requests as req
            resp = req.post(
                "https://tjapi.timesjobs.com/search/api/v1/search/jobs/list",
                json={
                    "keyword": "fresher",
                    "location": "India",
                    "experience": "0,2",
                    "page": 1,
                    "size": 25,
                },
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Content-Type": "application/json",
                    "Origin": "https://www.timesjobs.com",
                    "Referer": "https://www.timesjobs.com/",
                },
                timeout=15,
            )
            if resp.status_code != 200:
                log(f"  API returned HTTP {resp.status_code}")
                log(f"  Found: 0 jobs")
                return jobs

            data = resp.json()
            job_list = data.get("jobs", []) or data.get("data", []) or data.get("results", [])
            if isinstance(job_list, dict):
                job_list = job_list.get("jobs", [])

            for j in job_list:
                try:
                    title = j.get("title") or j.get("jobTitle") or j.get("job_title") or ""
                    if not title or len(title) < 5:
                        continue

                    company = clean_company_name(
                        j.get("company") or j.get("companyName") or j.get("employer") or ""
                    )
                    loc_raw = j.get("location") or j.get("jobLocation") or j.get("city") or ""
                    location = detect_city(loc_raw)

                    salary = j.get("salary") or j.get("pay") or j.get("compensation") or "वेतन पर बातचीत"
                    description = j.get("description") or j.get("jobDescription") or j.get("job_description") or title

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": description,
                        "salary": salary,
                        "source": "timesjobs",
                    })
                except Exception:
                    continue

        except Exception as e:
            log(f"  Error: {e}")

        log(f"  Found: {len(jobs)} jobs")
        return jobs
