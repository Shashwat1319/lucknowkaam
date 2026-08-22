import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "नौकरी पोस्ट करें | Post a Job | LucknowKaam",
  description: "सिर्फ ₹299 में अपनी नौकरी पोस्ट करें। 90 दिनों तक हजारों job seekers को आपकी vacancy दिखेगी।",
};

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
