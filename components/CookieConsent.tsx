"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem("cookie-consent");
    if (!consented) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[100] bg-secondary text-white p-4 rounded-xl shadow-2xl max-w-md mx-auto md:mx-4">
      <p className="text-sm mb-3 leading-relaxed">
        हम आपके अनुभव को बेहतर बनाने और वैयक्तिकृत विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करते हैं।
        <a href="/privacy" className="text-primary hover:underline ml-1">और जानें</a>
      </p>
      <div className="flex gap-2">
        <button onClick={accept} className="btn-primary text-sm flex-1 py-2">
          स्वीकार करें
        </button>
        <button onClick={() => setVisible(false)} className="bg-gray-600 hover:bg-gray-700 text-white text-sm flex-1 py-2 rounded-lg font-medium transition-colors">
          अस्वीकार करें
        </button>
      </div>
    </div>
  );
}
