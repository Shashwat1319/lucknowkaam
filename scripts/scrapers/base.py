import random
from typing import Optional
import requests


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
]


class BaseScraper:
    source_name = "base"

    def _headers(self, referer: str = "https://www.google.com/") -> dict:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Referer": referer,
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
        }

    def safe_get(self, url: str, timeout: int = 15) -> Optional[requests.Response]:
        for attempt in range(3):
            headers = self._headers()
            try:
                resp = requests.get(url, headers=headers, timeout=timeout)
                if resp.status_code == 200:
                    return resp
                if resp.status_code == 403:
                    print(f"  ⚠️ {self.source_name}: Got 403 (attempt {attempt+1}/3), retrying with different UA...")
                    continue
                resp.raise_for_status()
            except requests.RequestException as e:
                if attempt < 2:
                    print(f"  ⚠️ {self.source_name}: {e} (attempt {attempt+1}/3), retrying...")
                    continue
                print(f"  ⚠️ {self.source_name}: Request failed — {e}")
                return None
        print(f"  ⚠️ {self.source_name}: Failed after 3 attempts")
        return None

    def scrape(self) -> list:
        raise NotImplementedError
