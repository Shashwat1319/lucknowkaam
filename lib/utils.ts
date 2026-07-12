export function generateSlug(title: string): string {
  const hindiToEnglish: Record<string, string> = {
    "डिलीवरी": "delivery", "बॉय": "boy", "चाहिए": "required",
    "दुकान": "shop", "डेटा": "data", "एंट्री": "entry",
    "ड्राइवर": "driver", "नौकरी": "job", "टीचिंग": "teaching",
    "जॉब": "job", "घर": "home", "काम": "work",
    "निर्माण": "construction", "होटल": "hotel", "रेस्टोरेंट": "restaurant",
    "मेडिकल": "medical", "सेल्स": "sales", "मार्केटिंग": "marketing",
    "तकनीकी": "technical", "कंप्यूटर": "computer", "ऑपरेटर": "operator",
    "सिक्योरिटी": "security", "गार्ड": "guard", "कुक": "cook",
    "शेफ": "chef", "ट्यूशन": "tuition", "टीचर": "teacher",
    "टाइपिंग": "typing", "होम": "home"
  };

  let slug = title.toLowerCase();
  for (const [hi, en] of Object.entries(hindiToEnglish)) {
    slug = slug.replace(new RegExp(hi, "g"), en);
  }
  slug = slug.replace(/[^a-z0-9\s-]/g, "");
  slug = slug.replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  return slug.substring(0, 80);
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHrs < 1) return "अभी अभी";
  if (diffHrs < 24) return `${diffHrs} घंटे पहले`;
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} हफ्ते पहले`;
  return `${Math.floor(diffDays / 30)} महीने पहले`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAreaSlug(area: string): string {
  return area.toLowerCase().replace(/\s+/g, "-");
}

export function getCategoryNameHindi(slug: string): string {
  const map: Record<string, string> = {
    "delivery": "डिलीवरी का काम",
    "shop-assistant": "दुकान का काम",
    "data-entry": "डेटा एंट्री",
    "driver": "ड्राइवर की नौकरी",
    "teaching": "टीचिंग जॉब",
    "work-from-home": "घर से काम",
    "construction": "निर्माण कार्य",
    "hotel-restaurant": "होटल रेस्टोरेंट",
    "medical": "मेडिकल",
    "sales": "सेल्स मार्केटिंग",
    "technical": "तकनीकी काम",
    "computer": "कंप्यूटर का काम",
  };
  return map[slug] || slug;
}

export function getJobTypeHindi(type: string): string {
  const map: Record<string, string> = {
    "full-time": "पूर्णकालिक",
    "part-time": "अंशकालिक",
    "work-from-home": "घर से काम",
    "contract": "अनुबंध",
  };
  return map[type] || type;
}

export function getAreaHindi(area: string): string {
  return area;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
