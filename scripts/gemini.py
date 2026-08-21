import json
import random
import re
import os
import time
from typing import Optional

import requests

from scripts.utils import detect_category, detect_job_type, log

MAX_RETRIES = 3
INITIAL_BACKOFF = 2
_groq_calls_today = 0
_GROQ_UNAVAILABLE = False

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

HINDI_PERSONAL_TEMPLATES = [
    "आप मेहनती और ईमानदार हैं। कंपनी में आपको अच्छा माहौल मिलेगा और सबसे बढ़कर, आपकी मेहनत की कदर होगी।",
    "यह नौकरी आपके करियर की शुरुआत हो सकती है। यहां सीखने को बहुत कुछ मिलेगा।",
    "अगर आप में कुछ नया सीखने का जुनून है तो यह जॉब आपके लिए ही है।",
    "कंपनी का माहौल बहुत अच्छा है। सभी कर्मचारी मिल-जुलकर काम करते हैं और एक-दूसरे की मदद करते हैं। स्टाफ फ्रेंडली है।",
    "अगर आप सच में काम करना चाहते हैं और पैसे कमाना चाहते हैं तो यह आपके लिए परफेक्ट मौका है।",
]

QUALIFICATION_OPTIONS = [
    "कोई विशेष योग्यता नहीं",
    "10वीं पास",
    "12वीं पास",
    "ग्रेजुएट (कोई भी स्ट्रीम)",
    "ग्रेजुएट (कॉमर्स/साइंस)",
    "आईटीआई / डिप्लोमा धारक",
    "बी.एड / टीचिंग डिग्री",
    "बी.कॉम / एम.कॉम",
]

EXPERIENCE_OPTIONS = [
    "कोई अनुभव नहीं चाहिए (फ्रेशर्स भी आवेदन कर सकते हैं)",
    "0-1 साल का अनुभव",
    "1-2 साल का अनुभव",
    "2-3 साल का अनुभव",
    "3-5 साल का अनुभव",
]

SALARY_TEMPLATES = [
    "₹{min} - ₹{max} प्रति माह (अनुभव पर निर्भर)",
    "₹{min} प्रति माह (प्लस इन्सेंटिव)",
    "₹{min} - ₹{max} प्रति माह + PF/ESIC",
    "वेतन पर बातचीत होगी (₹{min} - ₹{max} तक)",
    "₹{min} प्रति माह (सीखने का मौका + सैलरी)",
]

HINDI_TEMPLATES = {
    "delivery": [
        "🔥 {company} में डिलीवरी पार्टनर की निकली भर्ती! {city} में तुरंत जॉइन करें। प्रति महीना {salary} तक कमाएं। अपनी बाइक/स्कूटी होनी चाहिए। {experience}। इन्सेंटिव + बोनस अलग से मिलेगा।\n\nकाम का समय: फ्लेक्सिबल, आप अपनी सुविधा अनुसार काम कर सकते हैं। सुबह, दोपहर या शाम — जब चाहे डिलीवरी करें। ज्यादा डिलीवरी का मतलब ज्यादा कमाई। हर हफ्ते पेमेंट मिलता है, कैश या बैंक अकाउंट में। कंपनी की तरफ से फ्री यूनिफॉर्म और बैग दिया जाता है। अच्छी डिलीवरी रेटिंग पर बोनस भी मिलता है।\n\nकैसे अप्लाई करें: ऊपर दिए गए नंबर पर कॉल करें या WhatsApp करें। अपना नाम, उम्र और शहर बताएं। ड्राइविंग लाइसेंस की फोटो साथ में भेजें। कंपनी वाले आपको ट्रेनिंग देंगे और फिर जॉइन करा लेंगे।",
        "📦 {company} दे रहा है जबरदस्त मौका डिलीवरी बॉय बनने का! {city} में पोस्टिंग। रोजाना कैश आउट की सुविधा। {salary} + इन्सेंटिव। जल्दी करें, सीमित सीटें!\n\nक्या करना होगा: आपको कंपनी के ऑर्डर ग्राहकों तक पहुंचाने हैं। ऑर्डर लेने के लिए आपको एक मोबाइल ऐप दिया जाएगा जिसमें पिकअप और ड्रॉप लोकेशन दिखेगी। आपको शहर की लोकल मार्केट, रेस्टोरेंट और घरों में जाना होगा। \n\nयोग्यता: अपना खुद का वाहन (साइकिल/स्कूटर/बाइक) होना चाहिए। स्मार्टफोन होना जरूरी है क्योंकि सारे ऑर्डर ऐप पर आते हैं। 18 से 40 साल के लोग अप्लाई कर सकते हैं। अगर आपको शहर की लोकल जगहों की अच्छी जानकारी है तो और भी अच्छा।",
        "🛵 डिलीवरी जॉब {city} में — {company} के साथ जुड़ें। फ्लेक्सिबल टाइमिंग, अपनी मर्जी से काम करें। {salary} प्रति माह। {qualification}। 18 साल से ऊपर वाले आवेदन कर सकते हैं।\n\nफायदे: अपने घर के पास ही डिलीवरी करें, दूर जाने की जरूरत नहीं। जितना काम करोगे उतना पैसा मिलेगा — कोई फिक्स सैलरी का बंधन नहीं। महीने में 10,000 से 25,000 रुपये तक आसानी से कमा सकते हैं। अच्छे प्रदर्शन पर इन्सेंटिव और बोनस अलग से मिलता है।\n\nजरूरी दस्तावेज: आधार कार्ड, ड्राइविंग लाइसेंस, बैंक अकाउंट की डिटेल। अगर आपके पास अपना वाहन नहीं है तो भी कुछ कंपनियां कंपनी का वाहन देती हैं।",
        "⚡ {company} में उर्जेंट वैकेंसी: डिलीवरी एग्जीक्यूटिव! {city} लोकेशन। डेली पेमेंट ऑप्शन। {salary} + पेट्रोल अलाउंस। {experience}। देर मत कीजिए!\n\nकाम के घंटे: दिन में 6-8 घंटे काम करना होगा। आप सुबह या शाम की शिफ्ट चुन सकते हैं। हर दिन की कमाई रोज निकाल सकते हैं — कोई इंतजार नहीं। पेट्रोल का खर्च अलग से मिलता है इसलिए आपकी जेब से कुछ नहीं जाएगा।\n\nकौन अप्लाई कर सकता है: कोई भी व्यक्ति जिसके पास वैलिड ड्राइविंग लाइसेंस हो। भले ही आपने पहले कभी डिलीवरी न की हो, कंपनी आपको ट्रेनिंग देगी। फ्रेशर्स का स्वागत है। बस आप में काम करने का जुनून होना चाहिए।",
        "🏍️ {company} के लिए डिलीवरी पार्टनर चाहिए {city} में। सैलरी {salary} + फ्यूल अलाउंस + टिप्स। वैलिड ड्राइविंग लाइसेंस जरूरी। {experience}। आज ही अप्लाई करें।\n\nकैसे काम करता है: जब आप रजिस्टर करेंगे तो आपको एक ऐप पर एक्सेस मिलेगा। जैसे ही कोई ऑर्डर आएगा, आपको नोटिफिकेशन मिलेगा। आप ऑर्डर ले सकते हैं या नहीं भी ले सकते — कोई दबाव नहीं। पिकअप पॉइंट से ऑर्डर लेकर कस्टमर तक पहुंचाना है।\n\nटिप्स: पीक आवर्स (दोपहर 12-2 और रात 7-10) में काम करके ज्यादा कमाएं। अच्छी रेटिंग बनाए रखें तो ज्यादा ऑर्डर मिलेंगे। ग्राहकों से अच्छा व्यवहार करें तो टिप्स भी मिलेंगे।",
    ],
    "data-entry": [
        "💻 बैठे-बिठाए कमाएं! {company} में डेटा एंट्री ऑपरेटर चाहिए। {city} ऑफिस में काम करना होगा। {salary}। {qualification}। {experience}। टाइपिंग स्पीड अच्छी होनी चाहिए।\n\nकाम क्या है: आपको कंपनी के डेटा को कंप्यूटर में एंट्री करना है। इसमें ग्राहकों की जानकारी, इनवॉइस, रिपोर्ट और दूसरे दस्तावेज शामिल हैं। सारा काम कंप्यूटर पर MS Excel या कंपनी के सॉफ्टवेयर में करना होता है। \n\nस्किल्स चाहिए: बेसिक कंप्यूटर नॉलेज होना चाहिए। हिंदी और इंग्लिश टाइपिंग आनी चाहिए (कम से कम 25-30 शब्द प्रति मिनट)। MS Excel का बेसिक ज्ञान होना चाहिए। अगर नहीं आता तो भी कोई बात नहीं, सीखने का मौका मिलेगा।",
        "📊 {company} में कंप्यूटर ऑपरेटर / डेटा एंट्री के लिए फ्रेशर्स आवेदन कर सकते हैं। {city} में काम। {salary}। बेसिक कंप्यूटर नॉलेज चाहिए। {experience}।\n\nकाम का माहौल: एयर कंडीशन ऑफिस में काम करना होगा। सुबह 10 से शाम 6 बजे तक ऑफिस टाइमिंग है। हफ्ते में 6 दिन काम और रविवार को छुट्टी। सरकारी छुट्टियों पर भी ऑफिस बंद रहेगा। महिला और पुरुष दोनों अप्लाई कर सकते हैं।\n\nसैलरी और बेनिफिट: सैलरी {salary} होगी। साथ में PF और ESIC की सुविधा भी मिलेगी। त्योहारों पर बोनस और गिफ्ट दिए जाते हैं। अच्छा काम करने पर सैलरी बढ़ोतरी और प्रमोशन के भी मौके हैं।",
        "⌨️ डेटा एंट्री जॉब {city} — {company} के साथ। {salary} मिलेगा। {qualification}। {experience}। हिंदी और इंग्लिश टाइपिंग आनी चाहिए। ऑफिस टाइमिंग फिक्स।\n\nजरूरी बातें: आपको रोजाना कम से कम 500-1000 एंट्रीज करनी होंगी। काम में स्पीड और एक्यूरेसी दोनों जरूरी है। गलत डेटा एंट्री करने पर वापस करना पड़ता है इसलिए ध्यान से काम करें। \n\nट्रेनिंग: जॉब जॉइन करने के बाद पहले 7 दिन की ट्रेनिंग होगी। ट्रेनिंग के दौरान भी आपको स्टाइपेंड मिलेगा। उसके बाद आपको रेगुलर टीम में शामिल कर लिया जाएगा।",
        "🖥️ {company} में उर्जेंट वैकेंसी — डेटा एंट्री / बैक ऑफिस। {city} ऑफिस। {salary} + इंसेंटिव। {qualification}। कंप्यूटर का बेसिक ज्ञान जरूरी। {experience}।\n\nकौन से काम होंगे: डेटा एंट्री के अलावा आपको ईमेल हैंडल करना, डॉक्यूमेंट प्रिंट करना, फाइलिंग का काम और दूसरे एडमिन के काम भी करने होंगे। यह एक बैक ऑफिस की जॉब है जिसमें आपको कस्टमर्स से सीधे बात नहीं करनी होती।\n\nग्रोथ के मौके: अच्छा काम करने पर 6 महीने में सैलरी रिवीजन होता है। 1-2 साल में आपको सीनियर डेटा एंट्री ऑपरेटर या टीम लीड बनने का मौका मिल सकता है। कंपनी में करियर ग्रोथ के बहुत अच्छे अवसर हैं।",
    ],
    "driver": [
        "🚚 {company} में ड्राइवर चाहिए {city} में। {salary} + TA/DA अलग से। {qualification}। {experience}। वैलिड ड्राइविंग लाइसेंस (लाइट/हैवी) जरूरी है। नशा मुक्त उम्मीदवार चाहिए।\n\nकाम के बारे में: आपको कंपनी के वाहन को चलाना होगा। लोकल शहर के अंदर डिलीवरी या स्टाफ को लाने-लेजाने का काम हो सकता है। कभी-कभी बाहर शहर भी जाना पड़ सकता है जिसके लिए अलग से TA/DA मिलता है। \n\nशिफ्ट टाइमिंग: दिन या रात की शिफ्ट चुन सकते हैं। हर शिफ्ट 8-9 घंटे की होती है। ओवरटाइम का अलग पैसा मिलता है। कंपनी यूनिफॉर्म और सुरक्षा उपकरण भी देती है।",
        "🚛 {company} के लिए कमर्शियल ड्राइवर की भर्ती। {city} लोकल रूट। {salary} पर बातचीत। {experience}। सभी दस्तावेज पूरे होने चाहिए। तुरंत जॉइन करें।\n\nवाहन का प्रकार: कंपनी के पास छोटे और बड़े दोनों तरह के वाहन हैं। आपको जिस वाहन का लाइसेंस है उसी पर काम मिलेगा। सभी वाहनों का मेंटेनेंस कंपनी करती है। \n\nसुविधाएं: सैलरी के अलावा खाने का अलाउंस, मोबाइल रिचार्ज और हेल्थ इंश्योरेंस भी मिलता है. साल में एक बार वेतन वृद्धि होती है। 2 साल बाद आपको सीनियर ड्राइवर या फ्लीट सुपरवाइजर बनने का मौका मिल सकता है।",
        "🚐 {company} में पर्सनल/ऑफिस ड्राइवर चाहिए। {city} में काम। {salary}। {qualification}। {experience}। टाइम पंक्चुअलिटी जरूरी। गुड बिहेवियर उम्मीदवार को प्राथमिकता।\n\nक्या करना होगा: आपको कंपनी के मालिक या सीनियर स्टाफ को उनके घर से ऑफिस और वापस लाना-ले जाना है। कभी-कभी मीटिंग या दूसरे कामों के लिए भी बाहर जाना पड़ सकता है। गाड़ी की सफाई और मेंटेनेंस भी आपकी जिम्मेदारी होगी।\n\nजरूरी शर्तें: आपको शहर के सभी रास्तों की अच्छी जानकारी होनी चाहिए। ऑफिस टाइम से 30 मिनट पहले रिपोर्ट करना होगा। ड्रेस कोड में रहना है। स्मोकिंग और तंबाकू सख्त मना है।",
    ],
    "teaching": [
        "🎓 {company} में टीचर / ट्यूटर चाहिए {city} में। {salary}। {qualification}। {experience}। बच्चों को पढ़ाने का शौक होना चाहिए। अच्छा कम्युनिकेशन जरूरी।\n\nकिसको पढ़ाना है: आपको छोटे बच्चों से लेकर बड़े छात्रों तक को पढ़ाना हो सकता है। क्लास में 20-30 छात्र होंगे। आपको उन्हें अपने विषय की पढ़ाई करानी है, होमवर्क चेक करना है और एग्जाम लेने हैं। \n\nटाइमिंग और छुट्टी: सुबह या शाम की शिफ्ट उपलब्ध है। हफ्ते में 6 दिन काम और एक दिन छुट्टी। स्कूल/संस्थान की सभी छुट्टियां मिलेंगी। अगर आप पार्ट टाइम पढ़ाना चाहते हैं तो भी विकल्प है।",
        "📚 {company} को एक्सपीरियंस्ड टीचर की जरूरत है। सब्जेक्ट — {title}। {city} लोकेशन। {salary}। {qualification}। {experience}। फ्रेंडली एटमॉस्फियर।\n\nसुविधाएं: पढ़ाने के लिए स्मार्ट क्लासरूम, प्रोजेक्टर और अन्य आधुनिक उपकरण उपलब्ध हैं। कंपनी आपको साल में 2 बार ट्रेनिंग भेजेगी जिससे आपकी पढ़ाने की स्किल और बेहतर होगी। स्टाफ के लिए अलग से लंच और रेस्ट रूम है।\n\nएडिशनल बेनिफिट्स: प्रोविडेंट फंड, बोनस, फेस्टिवल गिफ्ट और हेल्थ इंश्योरेंस। बच्चों की पढ़ाई पर कंपनी डिस्काउंट देती है। अच्छे टीचर्स को जल्द प्रमोशन मिलता है और सैलरी बढ़ती है।",
        "🏫 प्राइवेट कोचिंग / स्कूल में टीचिंग जॉब। {company}, {city}। {salary}। {qualification} वाले शिक्षक अप्लाई करें। {experience}। क्लासरूम मैनेजमेंट स्किल्स चाहिए।\n\nजिम्मेदारियां: लेसन प्लान बनाना, स्टूडेंट्स की प्रोग्रेस ट्रैक करना, पेरेंट्स से मीटिंग करना और रिपोर्ट कार्ड तैयार करना। अगर स्टूडेंट्स को कोई दिक्कत हो तो उनकी मदद करना भी आपकी जिम्मेदारी है।\n\nकैसे अप्लाई करें: अपना रिज्यूमे और अपनी एक डेमो क्लास का वीडियो भेजें। इंटरव्यू में आपको अपने विषय पर एक डेमो क्लास देनी होगी। सेलेक्ट होने पर 15 दिन की ट्रेनिंग के बाद आपको क्लास अलॉट की जाएगी।",
    ],
    "security": [
        "🛡️ {company} में सिक्योरिटी गार्ड चाहिए। {city} लोकेशन। {salary}। {qualification}। {experience}। दिन/रात की शिफ्ट उपलब्ध। यूनिफॉर्म कंपनी देगी।\n\nकाम के बारे में: आपको कंपनी के मेन गेट या बिल्डिंग की सुरक्षा करनी है। आने-जाने वाले हर व्यक्ति की जांच करनी होगी। विजिटर का डेटा रजिस्टर में नोट करना होगा। रात की शिफ्ट में पूरी बिल्डिंग की पेट्रोलिंग करनी होगी। \n\nसुविधाएं: फ्री यूनिफॉर्म और जूते मिलेंगे। छुट्टी हफ्ते में एक दिन। ओवरटाइम का पैसा अलग से मिलता है। त्योहारों पर बोनस और नए साल पर गिफ्ट दिया जाता है।",
        '🔒 {company} को सिक्योरिटी स्टाफ चाहिए {city} में। {salary}। {qualification}। {experience}। हाइट कम से कम 5\'6" चाहिए। फिजिकली फिट उम्मीदवार।\n\nक्या चाहिए: आपकी हाइट कम से कम 5 फीट 6 इंच होनी चाहिए। शारीरिक रूप से फिट होना जरूरी है। आपको 50 मीटर दौड़ना, 10 पुशअप्स करना और 20 किलो वजन उठाना आना चाहिए। फिजिकल टेस्ट के बाद ही सेलेक्शन होगा।\n\nकाम के घंटे: 12 घंटे की शिफ्ट (दिन या रात)। हर हफ्ते शिफ्ट बदलती है। रविवार को हॉलिडे या उसके बदले अतिरिक्त पैसे। सरकारी नौकरी जैसी सिक्योरिटी — जब तक अच्छा काम करेंगे, नौकरी पक्की है।',
    ],
    "sales": [
        "💰 {company} में सेल्स / मार्केटिंग के लिए भर्ती। {city} में काम। {salary} + टार्गेट बोनस। {qualification}। {experience}। कम्युनिकेशन स्किल्स चाहिए। करियर ग्रोथ अच्छी है।\n\nकाम क्या है: आपको कंपनी के प्रोडक्ट या सेवाएं लोगों को बेचनी हैं। ग्राहकों से मिलना, उन्हें प्रोडक्ट के बारे में बताना और सेल करना। अपने एरिया में नए ग्राहक बनाना और पुराने ग्राहकों को मेंटेन करना। आपको रोजाना कम से कम 10-15 कस्टमर्स से मिलना होगा।\n\nसैलरी स्ट्रक्चर: बेसिक सैलरी {salary} + इन्सेंटिव + कन्वेंस अलाउंस। टार्गेट पूरा करने पर एक्स्ट्रा बोनस। अच्छे परफॉर्मर्स के लिए महीने का बेस्ट सेल्समैन अवॉर्ड और गिफ्ट वाउचर। साल में 2 बार सैलरी रिवीजन।",
        "📈 {company} में बिजनेस डेवलपमेंट एग्जीक्यूटिव चाहिए। {city} मार्केट। {salary} + इन्सेंटिव। {qualification}। {experience}। सेल्स वालों के लिए सुनहरा मौका।\n\nकरियर ग्रोथ: यहां जॉब से ज्यादा करियर है। 6 महीने में आप टीम लीड बन सकते हैं। 1 साल में ब्रांच मैनेजर। 2-3 साल में रीजनल हेड। सेल्स में मेहनत करने वालों के लिए तरक्की के असीम मौके हैं। \n\nट्रेनिंग: जॉइन करने पर 1 हफ्ते की ट्रेनिंग होगी। जिसमें आपको प्रोडक्ट की जानकारी, सेल्स तकनीक और ग्राहकों से बात करने का तरीका सिखाया जाएगा। फील्ड में सीनियर सेल्समैन के साथ जाकर प्रैक्टिकल ट्रेनिंग भी मिलेगी।",
    ],
    "default": [
        "🔔 {company} में {title} की निकली वैकेंसी! {city} में काम करने का मौका। सैलरी {salary}। {qualification}। {experience}। ज्यादा उम्मीदवार नहीं चाहिए, तो जल्दी करें।\n\nकाम का विवरण: इस पद पर आपको कंपनी की जरूरत के अनुसार काम करना होगा। आपकी जिम्मेदारियां आपके सुपरवाइजर तय करेंगे। कंपनी का माहौल अच्छा है और सभी स्टाफ मिलजुल कर काम करता है। नए लोगों को सीखने में कोई दिक्कत नहीं आएगी क्योंकि हर कोई हेल्प करता है।\n\nआवेदन कैसे करें: ऊपर दिए गए नंबर पर फोन करें या WhatsApp करें। अपना नाम, उम्र और अनुभव बताएं। कंपनी वाले आपको इंटरव्यू के लिए बुलाएंगे। इंटरव्यू में बेसिक सवाल पूछे जाएंगे। आपको फटाफट जॉइन करा दिया जाएगा।",
        "✅ {company} दे रहा है नौकरी का मौका — {title}। {city} में पोस्टिंग। {salary}। {qualification}। {experience}। इंटरव्यू के लिए बुलाया जाएगा।\n\nकंपनी के बारे में: {company} एक भरोसेमंद संस्थान है जो अपने क्षेत्र में काम कर रहा है। यहां काम करने वाले कर्मचारी संतुष्ट हैं। कंपनी में बुनियादी सुविधाएं उपलब्ध हैं।\n\nदस्तावेज: आवेदन के समय आधार कार्ड, पैन कार्ड, 2 फोटो और शैक्षणिक प्रमाणपत्र साथ लाएं। अगर आपके पास अनुभव प्रमाणपत्र है तो वह भी लाएं।",
        "🔥 उर्जेंट हायरिंग: {company} को चाहिए {title}। {city} लोकेशन। {salary}। {qualification}। {experience}। आज ही अप्लाई करें, कल जॉइन करें।\n\nसुविधाएं: समय पर सैलरी, PF/ESIC की सुविधा, सालाना बोनस और हेल्थ इंश्योरेंस। कंपनी की तरफ से फ्री यूनिफॉर्म और अन्य सुविधाएं भी दी जाती हैं। कर्मचारियों के लिए कैंटीन की सुविधा है जहां सस्ता और साफ खाना मिलता है।\n\nचयन प्रक्रिया: आवेदन करने के बाद आपको 2 दिन के अंदर कॉल आ जाएगा। फिर एक छोटा सा इंटरव्यू होगा। इंटरव्यू पास करने के तुरंत बाद आपको जॉइनिंग लेटर दे दिया जाएगा।",
        "📣 {company} — {title} पद के लिए इच्छुक उम्मीदवार आवेदन करें। जॉब लोकेशन: {city}। {salary}। क्वालिफिकेशन: {qualification}। {experience}। फुल टाइम / पार्ट टाइम।\n\nकाम का समय: सुबह 9:30 से शाम 6 बजे तक। हफ्ते में 6 दिन काम और एक दिन छुट्टी। दोपहर में 1 घंटे का लंच ब्रेक मिलेगा। सुबह चाय और नाश्ते का टाइम भी मिलता है। ओवरटाइम करने पर एक्स्ट्रा पैसे मिलते हैं।\n\nजॉब लोकेशन: कंपनी शहर के बीचोबीच स्थित है, जहां आसानी से बस, ऑटो या मेट्रो से पहुंचा जा सकता है। आसपास खाने की अच्छी दुकानें हैं। पार्किंग की भी सुविधा है।",
        "🎯 {company} में {title} की निकली भर्ती। {city}। {salary}। {qualification}। {experience}। सीमित पद, जल्दी करें।\n\nआपके लिए यह नौकरी क्यों सही है: अगर आप अपने शहर में एक अच्छी और स्थिर नौकरी की तलाश में हैं तो यह आपके लिए एक अच्छा मौका है। किसी भी तरह की कोई फीस नहीं लगती है। न ही कोई एजेंट, न ही कोई कमीशन। सीधे कंपनी के साथ जुड़ें और काम करें।\n\nसंपर्क करें: अधिक जानकारी के लिए ऊपर दिए गए नंबर पर कॉल करें या संपर्क पेज पर जाएं। कृपया ध्यान दें: कोई भी पैसे न दें। नौकरी दिलाने के नाम पर पैसे मांगने वाले धोखेबाज हैं।",
    ],
}


def _generate_salary_text(salary_raw: str) -> str:
    if not salary_raw or salary_raw == "वेतन पर बातचीत होगी":
        return "वेतन पर बातचीत होगी"
    nums = re.findall(r"\d[\d,]*", salary_raw)
    if len(nums) >= 2:
        try:
            mn = int(nums[0].replace(",", ""))
            mx = int(nums[1].replace(",", ""))
            return random.choice(SALARY_TEMPLATES).format(min=mn, max=mx)
        except ValueError:
            pass
    elif len(nums) == 1:
        try:
            mn = int(nums[0].replace(",", ""))
            return f"₹{mn} प्रति माह"
        except ValueError:
            pass
    return "वेतन पर बातचीत होगी"


def _call_groq(prompt: str) -> Optional[str]:
    global _GROQ_UNAVAILABLE
    if not GROQ_API_KEY or _GROQ_UNAVAILABLE:
        return None

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            if resp.status_code in (401, 403):
                log(f"⛔ Groq auth error: HTTP {resp.status_code} — disabling Groq")
                _GROQ_UNAVAILABLE = True
                return None
            if resp.status_code in (429, 500, 502, 503):
                retry_after = INITIAL_BACKOFF * (2 ** attempt)
                kind = "quota" if resp.status_code == 429 else "server"
                log(f"⏳ Groq {kind} error (attempt {attempt+1}/{MAX_RETRIES}), waiting {retry_after}s...")
                time.sleep(retry_after)
                continue
            log(f"⚠️  Groq API error: HTTP {resp.status_code}")
            break
        except Exception as e:
            last_err = e
            log(f"⚠️  Groq API error: {e}")
            break

    if last_err:
        log(f"⛔ Groq unavailable after {MAX_RETRIES} retries, disabling for this run")
        _GROQ_UNAVAILABLE = True
    return None


def _template_hindi_wrapper(job_data: dict) -> dict:
    title = job_data.get("title", "Naukari")
    company = job_data.get("company", "Company")
    city = job_data.get("location", "India")
    salary_raw = job_data.get("salary", "")
    category = detect_category(title)
    job_type = detect_job_type(title)

    templates = HINDI_TEMPLATES.get(category, HINDI_TEMPLATES["default"])
    template = random.choice(templates)
    salary_text = _generate_salary_text(salary_raw)
    qualification = random.choice(QUALIFICATION_OPTIONS)
    experience = random.choice(EXPERIENCE_OPTIONS)

    description_hindi = template.format(
        company=company, city=city, title=title,
        job_type=job_type, salary=salary_text,
        qualification=qualification, experience=experience,
    )

    title_templates = [
        f"{company} में {title} की भर्ती, {city} — {salary_text}",
        f"🔥 {title} — {company}, {city} | {salary_text}",
        f"{title} जॉब {city} में — {company} के साथ | {salary_text}",
        f"नौकरी: {title} — {company}, {city} ({salary_text})",
    ]
    title_hindi = random.choice(title_templates)

    return {
        "title_hindi": title_hindi,
        "description_hindi": description_hindi,
        "qualification": qualification,
        "experience": experience,
        "salary_text_hindi": salary_text,
    }


def convert_to_hindi(job_data: dict) -> dict:
    global _groq_calls_today
    if not GROQ_API_KEY or _GROQ_UNAVAILABLE:
        return _template_hindi_wrapper(job_data)

    personal = random.choice(HINDI_PERSONAL_TEMPLATES)

    prompt = f"""Neeche diye gaye job details ko aisi simple Hindi mein likho jaise koi dost naukri ke baare mein bata raha ho. Bilkul natural aur relatable language use karo. Ghatiya translation jaisa na lage.

Job Data:
Title: {job_data.get('title', '')}
Company: {job_data.get('company', '')}
Location: {job_data.get('location', '')}
Description English: {job_data.get('description', '')}
Salary: {job_data.get('salary', '')}

description_hindi exactly 120-180 words mein likho jisme ye sab ho:
- Yeh job kiske liye suitable hai
- Kaam kya karna hoga (steps, daily routine, type of work)
- Kaam ke ghante, shifts, week off
- Salary kitni milegi, kya additional benefits hain (PF, bonus, insurance)
- Kaise apply karein (call, WhatsApp, walk-in)
- Ek personal touch do: {personal}

Sirf JSON return karo, koi extra text nahi:
{{
  "title_hindi": "15-20 words mein aakarshak job title Hindi mein. Jaise: 🔥 {company_name} mein {title_name} chahiye, {loc_name} — urgent hiring",
  "description_hindi": "120-180 words mein simple Hindi, aise jaise koi apna dost bata raha ho",
  "qualification": "kya qualification chahiye (jaise: 10vi pass, 12vi pass, graduate, koi degree nahi)",
  "experience": "kitna anubhav chahiye (jaise: koi anubhav nahi, 0-1 saal, 1-2 saal)",
  "salary_text_hindi": "kitna paisa milega hindi mein (jaise: ₹10,000 - ₹15,000 prati mahina)"
}}""".format(company_name=job_data.get('company', ''), title_name=job_data.get('title', ''), loc_name=job_data.get('location', ''))

    text = _call_groq(prompt)
    if not text:
        log("  → Groq unavailable, using Hindi template")
        return _template_hindi_wrapper(job_data)

    _groq_calls_today += 1

    text = text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end+1]
    else:
        log("  → No JSON found in Groq response, using Hindi template")
        return _template_hindi_wrapper(job_data)

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        log("  → Groq returned bad JSON, using Hindi template")
        return _template_hindi_wrapper(job_data)

    parsed.setdefault("title_hindi", job_data.get("title", ""))
    parsed.setdefault("description_hindi", job_data.get("description", ""))
    parsed.setdefault("qualification", "कोई विशेष योग्यता नहीं")
    parsed.setdefault("experience", "कोई अनुभव नहीं चाहिए")
    parsed.setdefault("salary_text_hindi", job_data.get("salary", ""))
    return parsed
