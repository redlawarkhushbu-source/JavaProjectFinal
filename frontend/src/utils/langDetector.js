/**
 * Highly Accurate Language Auto-Detection for Shet Samarthan
 * Distinguishes English, Marathi, and Hindi accurately (including Devanagari script & Romanized text).
 */

// Unique Marathi characters in Devanagari: 'ळ' (U+0933) is exclusively used in Marathi
const MARATHI_EXCLUSIVE_CHARS = /[\u0933]/;

// High-confidence Marathi keywords & inflection patterns
const MARATHI_MARKERS = [
  'आहे', 'आहेत', 'नाही', 'नाहीत', 'होतो', 'होते', 'होती', 'असा', 'असे', 'असू',
  'काय', 'कसा', 'कशी', 'कसे', 'कधी', 'कुठे', 'कोण', 'कशामुळे', 'कशासाठी',
  'करा', 'करावे', 'करावेस', 'करावी', 'करू', 'करायचे', 'पाहिजे', 'नको',
  'सांगा', 'दाखवा', 'उघडा', 'बघा', 'द्या', 'द्यावे', 'द्यावा',
  'शेती', 'शेतकरी', 'शेत', 'पीक', 'पिकांची', 'पिकांचे', 'पिके', 'पिकावर',
  'खत', 'खते', 'खतांची', 'फवारणी', 'फवारा', 'पाणी', 'कीड', 'रोगाचे', 'रोगाची', 'रोगावर',
  'औषध', 'औषधे', 'भाव', 'बाजारभाव', 'कांदा', 'सोयाबीन', 'गहू', 'ज्वारी', 'कापूस', 'बाजरी',
  'च्या', 'चे', 'ची', 'ला', 'ना', 'मध्ये', 'साठी', 'कडून', 'वरून', 'हून', 'वर',
  'तोय', 'तेय', 'तात', 'णार', 'णारा', 'णारी', 'णारे'
];

// High-confidence Hindi keywords & inflection patterns
const HINDI_MARKERS = [
  'है', 'हैं', 'नहीं', 'था', 'थी', 'थे', 'होगा', 'होगी', 'होंगे',
  'क्या', 'क्यों', 'कैसे', 'कैसा', 'कैसी', 'कब', 'कहाँ', 'कहां', 'कौन', 'किसका', 'कितना', 'कितनी',
  'करना', 'करो', 'करें', 'कीजिए', 'चाहिए', 'बताएं', 'बताइए', 'खोलें', 'दिखाएं',
  'किसान', 'खेती', 'खेत', 'फसल', 'फसलें', 'फसलों', 'बीमारी', 'बीमारियां',
  'रोकथाम', 'उपचार', 'छिड़काव', 'खाद', 'दवा', 'दवाई', 'कीटनाशक', 'मौसम', 'दाम',
  'रहा है', 'रही है', 'रहे हैं', 'सकता है', 'सकती है', 'सकते हैं', 'के लिए', 'का', 'की', 'के', 'को', 'में', 'से', 'पर'
];

// Romanized Marathi words
const ROMAN_MARATHI_MARKERS = [
  'aahe', 'aahet', 'nahi', 'nahit', 'kaay', 'kay', 'kasa', 'kashi', 'kase', 'kadhi', 'kuthe',
  'sheti', 'shetkari', 'favarni', 'aushadh', 'paani', 'kanda', 'bhav', 'saanga', 'ughada', 'pahije'
];

// Romanized Hindi words
const ROMAN_HINDI_MARKERS = [
  'hai', 'hain', 'nahi', 'kya', 'kyun', 'kaise', 'kaisa', 'kab', 'kahan', 'kitna',
  'kisan', 'kheti', 'fasal', 'khet', 'dawa', 'batao', 'bataiye', 'kholo', 'chahiye', 'roktham'
];

// Common English words
const ENGLISH_COMMON_WORDS = [
  'what', 'how', 'when', 'where', 'why', 'which', 'who', 'weather', 'crop', 'plant',
  'disease', 'pest', 'leaf', 'tomato', 'onion', 'cotton', 'spray', 'pesticide',
  'fertilizer', 'store', 'nearby', 'open', 'show', 'tell', 'help', 'temperature',
  'rain', 'rainfall', 'humidity', 'wind', 'soil', 'water', 'hello', 'hi'
];

/**
 * Detect language of input query or message
 * @param {string} text - User message, transcript, or typed text
 * @param {string} fallbackLang - Default fallback language ('mr', 'hi', or 'en')
 * @returns {'mr' | 'hi' | 'en'}
 */
export function detectLanguage(text, fallbackLang = 'mr') {
  if (!text || typeof text !== 'string') return fallbackLang;
  const clean = text.trim();
  if (!clean) return fallbackLang;

  // 1. Check for Latin characters (English)
  const latinCount = (clean.match(/[a-zA-Z]/g) || []).length;
  const totalLetters = (clean.match(/[\p{L}]/gu) || []).length;

  if (totalLetters > 0 && latinCount / totalLetters > 0.6) {
    const lower = clean.toLowerCase();
    
    // Check if Romanized Marathi or Hindi
    let romanMrScore = 0;
    let romanHiScore = 0;
    
    for (const w of ROMAN_MARATHI_MARKERS) {
      if (lower.includes(w)) romanMrScore += 2;
    }
    for (const w of ROMAN_HINDI_MARKERS) {
      if (lower.includes(w)) romanHiScore += 2;
    }

    if (romanMrScore > romanHiScore && romanMrScore >= 2) return 'mr';
    if (romanHiScore > romanMrScore && romanHiScore >= 2) return 'hi';

    // Otherwise standard English
    return 'en';
  }

  // 2. Check for Devanagari script
  const devanagariCount = (clean.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount === 0) {
    // If predominantly ASCII / English symbols
    if (latinCount > 0) return 'en';
    return fallbackLang;
  }

  // Definite Marathi indicator: Unique Marathi character 'ळ'
  if (MARATHI_EXCLUSIVE_CHARS.test(clean)) {
    return 'mr';
  }

  // Count matches for Marathi vs Hindi markers
  let mrScore = 0;
  let hiScore = 0;

  for (const marker of MARATHI_MARKERS) {
    // Exact word or boundary match
    const regex = new RegExp(`(^|\\s|[.,!?।])${marker}($|\\s|[.,!?।])`, 'u');
    if (regex.test(clean)) {
      mrScore += 3;
    } else if (clean.includes(marker)) {
      mrScore += 1;
    }
  }

  for (const marker of HINDI_MARKERS) {
    const regex = new RegExp(`(^|\\s|[.,!?।])${marker}($|\\s|[.,!?।])`, 'u');
    if (regex.test(clean)) {
      hiScore += 3;
    } else if (clean.includes(marker)) {
      hiScore += 1;
    }
  }

  if (mrScore > hiScore) {
    return 'mr';
  }
  if (hiScore > mrScore) {
    return 'hi';
  }

  // Tie-breaker: If ambiguous, preserve fallback language if Devanagari compatible ('mr' or 'hi')
  if (fallbackLang === 'hi' || fallbackLang === 'mr') {
    return fallbackLang;
  }

  return 'mr'; // Regional state default
}
