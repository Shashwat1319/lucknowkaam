from typing import Optional
import requests


class BaseScraper:
    source_name = "base"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/128.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    def safe_get(self, url: str, timeout: int = 15, verify: bool = True) -> Optional[requests.Response]:
        try:
            resp = requests.get(url, headers=self.headers, timeout=timeout, verify=verify)
            resp.raise_for_status()
            return resp
        except Exception as e:
            print(f"  ⚠️ {self.source_name}: Request failed — {e}")
            return None

    def scrape(self) -> list:
        raise NotImplementedError
