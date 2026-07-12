export interface Job {
  id: string;
  title_hindi: string;
  title_english: string;
  slug: string;
  description_hindi: string;
  company_name: string;
  location_area: string;
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_text_hindi: string;
  qualification: string;
  experience: string;
  contact_number: string;
  apply_link: string;
  job_type: string;
  is_featured: boolean;
  is_active: boolean;
  is_paid: boolean;
  source: string;
  posted_at: string;
  expires_at: string;
  views: number;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name_hindi: string;
  name_english: string;
  slug: string;
  icon: string;
  job_count: number;
}

export interface PaidListing {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  job_title: string;
  job_description: string;
  payment_status: string;
  amount: number;
  created_at: string;
}

export const INDIA_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad",
  "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Lucknow", "Jaipur", "Chandigarh", "Indore",
  "Bhopal", "Patna", "Nagpur", "Noida",
  "Gurgaon", "Surat", "Varanasi", "Agra", "Kanpur"
] as const;

export const CATEGORIES: Category[] = [
  { id: "1", name_hindi: "डिलीवरी का काम", name_english: "Delivery Job", slug: "delivery", icon: "🚚", job_count: 0 },
  { id: "2", name_hindi: "दुकान का काम", name_english: "Shop Assistant", slug: "shop-assistant", icon: "🏪", job_count: 0 },
  { id: "3", name_hindi: "डेटा एंट्री", name_english: "Data Entry", slug: "data-entry", icon: "💻", job_count: 0 },
  { id: "4", name_hindi: "ड्राइवर की नौकरी", name_english: "Driver Job", slug: "driver", icon: "🚗", job_count: 0 },
  { id: "5", name_hindi: "टीचिंग जॉब", name_english: "Teaching Job", slug: "teaching", icon: "📚", job_count: 0 },
  { id: "6", name_hindi: "घर से काम", name_english: "Work From Home", slug: "work-from-home", icon: "🏠", job_count: 0 },
  { id: "7", name_hindi: "निर्माण कार्य", name_english: "Construction Work", slug: "construction", icon: "🏗️", job_count: 0 },
  { id: "8", name_hindi: "होटल रेस्टोरेंट", name_english: "Hotel/Restaurant", slug: "hotel-restaurant", icon: "🍽️", job_count: 0 },
  { id: "9", name_hindi: "मेडिकल", name_english: "Medical/Health", slug: "medical", icon: "🏥", job_count: 0 },
  { id: "10", name_hindi: "सेल्स मार्केटिंग", name_english: "Sales/Marketing", slug: "sales", icon: "💰", job_count: 0 },
  { id: "11", name_hindi: "तकनीकी काम", name_english: "Technical Work", slug: "technical", icon: "🔧", job_count: 0 },
  { id: "12", name_hindi: "कंप्यूटर का काम", name_english: "Computer Work", slug: "computer", icon: "📱", job_count: 0 },
  { id: "13", name_hindi: "सरकारी नौकरी", name_english: "Government Job", slug: "government", icon: "🏛️", job_count: 0 }
];
