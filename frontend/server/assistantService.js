import fs from 'fs';
import path from 'path';

const DEFAULT_OPENROUTER_KEY = '';
const DEFAULT_SARVAM_KEY = '';

const SYSTEM_INSTRUCTION = `You are Shet Samarth Assistant, a helpful, practical, and trustworthy AI assistant for farmers.
Your primary purpose is to help farmers understand crop health, plant diseases, farming practices, irrigation, soil management, crop protection, agricultural technology, and relevant features available on the Shet Samarth platform.
Communicate naturally and respectfully. Be clear, concise, and useful. Prefer simple language that farmers can understand.

CRITICAL LANGUAGE AUTO-DETECTION RULE:
- Automatically identify and strictly reply in the user's language:
  • If the farmer asks in English -> You MUST respond 100% in English.
  • If the farmer asks in Marathi (मराठी) -> You MUST respond 100% in authentic Marathi.
  • If the farmer asks in Hindi (हिन्दी) -> You MUST respond 100% in authentic Hindi.
- Note: Marathi and Hindi both use Devanagari, so distinguish them carefully:
  Marathi uses markers like 'आहे', 'नाही', 'काय', 'कसा', 'शेती', 'पिकांची', 'ळ'; 
  Hindi uses markers like 'है', 'नहीं', 'क्या', 'कैसा', 'खेती', 'फसल'.
- Always return your response in the exact language detected from the farmer's query.

For spoken responses, use short, conversational sentences suitable for text-to-speech (2 to 4 natural sentences). Avoid unnecessary Markdown, tables, complex formatting, and long lists.
Use the application's available crop-diagnosis results when relevant, but never invent results.
Do not invent pesticide dosages or agricultural facts. Clearly communicate uncertainty and recommend an expert when appropriate.
If the user specifically asks to open or navigate to a page (e.g. open weather, open crop diagnosis, open 3D farm, show nearby stores, or change language), add an action code at the very end on its own line: [[ACTION:navigate_weather]], [[ACTION:navigate_diagnosis]], [[ACTION:navigate_3dfarm]], [[ACTION:navigate_suppliers]], [[ACTION:change_lang_mr]], [[ACTION:change_lang_hi]], [[ACTION:change_lang_en]], or [[ACTION:open_location_modal]].`;

function detectServerLanguage(text, fallback = 'mr') {
  if (!text || typeof text !== 'string') return fallback;
  const clean = text.trim();
  if (!clean) return fallback;
  const latinCount = (clean.match(/[a-zA-Z]/g) || []).length;
  const totalLetters = (clean.match(/[\p{L}]/gu) || []).length;
  if (totalLetters > 0 && latinCount / totalLetters > 0.6) {
    const lower = clean.toLowerCase();
    const mrWords = ['sheti', 'shetkari', 'aahe', 'nahit', 'kaay', 'kasa', 'kashi', 'favarni', 'aushadh', 'paani'];
    const hiWords = ['kisan', 'kheti', 'hai', 'hain', 'nahi', 'kya', 'kaise', 'batao', 'fasal', 'dawa'];
    let mrScore = 0, hiScore = 0;
    for (const w of mrWords) if (lower.includes(w)) mrScore++;
    for (const w of hiWords) if (lower.includes(w)) hiScore++;
    if (mrScore > hiScore && mrScore >= 1) return 'mr';
    if (hiScore > mrScore && hiScore >= 1) return 'hi';
    return 'en';
  }
  if (/[\u0933]/.test(clean)) return 'mr'; // 'ळ' character
  const mrMarkers = ['आहे', 'नाही', 'काय', 'कसा', 'कशी', 'कसे', 'कधी', 'कुठे', 'कोण', 'शेती', 'शेतकरी', 'पीक', 'खत', 'फवारणी', 'पाणी', 'च्या', 'मध्ये', 'साठी', 'सांगा', 'उघडा', 'पाहिजे'];
  const hiMarkers = ['है', 'नहीं', 'क्या', 'क्यों', 'कैसे', 'कैसा', 'कब', 'कहाँ', 'किसान', 'खेती', 'फसल', 'खाद', 'छिड़काव', 'दवा', 'बताएं', 'खोलें', 'चाहिए', 'रहा है', 'सकता है'];
  let mrScore = 0, hiScore = 0;
  for (const m of mrMarkers) if (clean.includes(m)) mrScore++;
  for (const m of hiMarkers) if (clean.includes(m)) hiScore++;
  if (mrScore > hiScore) return 'mr';
  if (hiScore > mrScore) return 'hi';
  return fallback;
}

function getEnvKey(keyName, defaultVal) {
  if (process.env[keyName] && !process.env[keyName].includes('your_')) {
    return process.env[keyName].trim();
  }
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), 'frontend/.env')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(new RegExp(`^${keyName}=(.+)$`, 'm'));
        if (match && match[1]) {
          const v = match[1].trim().replace(/^["']|["']$/g, '');
          if (v && !v.includes('your_')) return v;
        }
      } catch (e) {}
    }
  }
  return defaultVal;
}

export async function askAssistant({
  message,
  language = 'mr',
  history = [],
  generateAudio = true
}) {
  const openRouterKey = getEnvKey('OPENROUTER_API_KEY', DEFAULT_OPENROUTER_KEY);
  const modelName = getEnvKey('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct');
  const sarvamKey = getEnvKey('SARVAM_API_KEY', DEFAULT_SARVAM_KEY);

  const cleanMessage = String(message || '').trim();
  if (!cleanMessage) {
    return {
      success: false,
      error: 'Empty message provided'
    };
  }

  // Build message list
  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION }
  ];

  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      if (h.role && h.content) {
        messages.push({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: String(h.content)
        });
      }
    }
  }

  messages.push({ role: 'user', content: cleanMessage });

  // Call OpenRouter
  let replyText = '';
  let modelUsed = modelName;
  const candidateModels = [
    modelName && !modelName.includes('70b') ? modelName : null,
    'qwen/qwen-2.5-7b-instruct',                 // 0.37s - ultra fast multilingual
    'meta-llama/llama-3.1-8b-instruct',          // 0.36s - rapid instruction follower
    'mistralai/mistral-small-24b-instruct-2501', // 0.34s - lowest latency in benchmark
    'microsoft/phi-4',                           // 0.42s - compact & rapid reasoning
    'google/gemma-2-27b-it',                     // 0.53s - strong conversational flow
    'deepseek/deepseek-chat',                    // 0.65s - dependable reasoning fallback
    'qwen/qwen-2.5-72b-instruct',                // 0.67s - deep agricultural knowledge
    'meta-llama/llama-3.2-3b-instruct',          // 0.79s - lightweight edge model
    'meta-llama/llama-3.3-70b-instruct',         // 0.92s - flagship 70B
    'meta-llama/llama-3.2-1b-instruct'           // 0.96s - ultra-compact backup
  ].filter(Boolean);

  for (const m of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3800);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + openRouterKey,
          'HTTP-Referer': 'https://shetsamarthan.in',
          'X-Title': 'Shet Samarthan',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: m,
          messages,
          max_tokens: 220,
          temperature: 0.5
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const d = await res.json();
        replyText = d.choices?.[0]?.message?.content || '';
        if (replyText) {
          modelUsed = m;
          break;
        }
      }
    } catch (err) {
      console.warn(`[OpenRouter] Model ${m} timed out or failed:`, err.message);
    }
  }

  if (!replyText) {
    return {
      success: false,
      error: 'Unable to get response from AI assistant. Please check OpenRouter connection.'
    };
  }

  // Parse Action if present
  let action = null;
  const actionMatch = replyText.match(/\[\[ACTION:([a-zA-Z0-9_]+)\]\]/);
  if (actionMatch) {
    action = actionMatch[1];
    replyText = replyText.replace(/\[\[ACTION:[a-zA-Z0-9_]+\]\]/, '').trim();
  }

  // Auto-detect reply language for TTS and client
  const detectedLang = detectServerLanguage(replyText, language);

  // Generate Sarvam TTS if requested
  let audioBase64 = null;
  let audioError = null;

  if (generateAudio && sarvamKey) {
    try {
      let speaker = 'ishita_mr_conversational';
      let langCode = 'mr-IN';
      if (detectedLang === 'hi') {
        speaker = 'kabir_hi_conversational';
        langCode = 'hi-IN';
      } else if (detectedLang === 'en') {
        speaker = 'dev_en_conversational';
        langCode = 'en-IN';
      }

      // Truncate to first 450 characters for Sarvam safety
      const ttsInput = replyText.slice(0, 450).trim();

      const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': sarvamKey
        },
        body: JSON.stringify({
          inputs: [ttsInput],
          target_language_code: langCode,
          speaker,
          model: 'bulbul:v4-flash',
          speech_sample_rate: 24000
        })
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.audios && ttsData.audios[0]) {
          audioBase64 = ttsData.audios[0];
        }
      } else {
        const errTxt = await ttsRes.text().catch(() => '');
        audioError = `Sarvam returned ${ttsRes.status}: ${errTxt}`;
      }
    } catch (ttsErr) {
      audioError = ttsErr.message;
    }
  }

  return {
    success: true,
    reply: replyText,
    action,
    language: detectedLang,
    audioBase64,
    audioError,
    model: modelUsed,
    provider: 'OpenRouter (' + modelUsed + ') + Sarvam AI',
    timestamp: new Date().toISOString()
  };
}
