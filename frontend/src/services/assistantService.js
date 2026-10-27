/**
 * Shet Samarth Assistant Client Service
 * Connects the voice assistant UI with OpenRouter AI Brain & Sarvam TTS.
 * 
 * Features:
 * 1. Calls /api/assistant/chat endpoint (handled by Vercel serverless, Spring Boot, or Vite dev server).
 * 2. Automatic client fallback to OpenRouter & Sarvam if serverless is offline.
 * 3. Multi-turn conversation history management.
 * 4. Action tag parsing for seamless website navigation.
 */

import { sarvamService } from './sarvamService';
import { detectLanguage } from '../utils/langDetector';

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

class AssistantService {
  constructor() {
    this.defaultOpenRouterKey = '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';
    this.primaryModel = 'meta-llama/llama-3.3-70b-instruct';
  }

  getOpenRouterKey() {
    const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENROUTER_API_KEY : null;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 10 && !envKey.includes('your_')) {
      return envKey.trim();
    }
    return this.defaultOpenRouterKey || '';
  }

  getModel() {
    const envModel = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENROUTER_MODEL : null;
    if (envModel && typeof envModel === 'string' && envModel.trim() && !envModel.includes('your_')) {
      return envModel.trim();
    }
    return this.primaryModel;
  }

  /**
   * Send a query to Shet Samarth Assistant with auto language detection
   * @param {Object} params
   * @param {string} params.message - Farmer's input text or speech transcript
   * @param {string} params.language - 'mr', 'hi', or 'en' (defaults to auto-detected)
   * @param {Array} params.history - Previous messages
   * @param {boolean} params.generateAudio - Whether to request server-side Sarvam TTS audio
   * @returns {Promise<Object>}
   */
  async sendMessage({ message, language, history = [], generateAudio = true }) {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      throw new Error('Please speak or type a message.');
    }

    // Auto-detect language from user input query
    const effectiveLang = detectLanguage(cleanMessage, language || 'mr');

    // Attempt 1: Call unified /api/assistant/chat backend/serverless endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanMessage,
          language: effectiveLang,
          history,
          generateAudio
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = resp.headers.get('content-type') || '';
      if (resp.ok && contentType.includes('application/json')) {
        const data = await resp.json();
        if (data && data.reply) {
          const replyLang = detectLanguage(data.reply, effectiveLang);
          return {
            reply: data.reply,
            action: data.action,
            detectedLanguage: replyLang || effectiveLang,
            audioBase64: data.audioBase64,
            audioError: data.audioError,
            model: data.model,
            provider: data.provider || 'Shet Samarthan Agronomy Brain'
          };
        }
      }
    } catch (apiErr) {
      console.warn('[AssistantService] /api/assistant/chat request failed, trying client fallback:', apiErr.message);
    }

    // Attempt 2: Direct browser fallback cycling through 10 verified models
    try {
      const openRouterKey = this.getOpenRouterKey();
      const customModel = this.getModel();

      const candidateModels = [
        customModel,
        'qwen/qwen-2.5-7b-instruct',
        'meta-llama/llama-3.1-8b-instruct',
        'mistralai/mistral-small-24b-instruct-2501',
        'microsoft/phi-4',
        'google/gemma-2-27b-it',
        'deepseek/deepseek-chat',
        'qwen/qwen-2.5-72b-instruct',
        'meta-llama/llama-3.2-3b-instruct',
        'meta-llama/llama-3.3-70b-instruct',
        'meta-llama/llama-3.2-1b-instruct'
      ];
      // Deduplicate
      const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

      const messagesList = [
        { role: 'system', content: SYSTEM_INSTRUCTION }
      ];

      for (const h of (history || []).slice(-6)) {
        if (h && (h.text || h.content)) {
          messagesList.push({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: String(h.text || h.content)
          });
        }
      }

      messagesList.push({ role: 'user', content: cleanMessage });

      for (const m of uniqueModels) {
        try {
          const directController = new AbortController();
          const directTimeout = setTimeout(() => directController.abort(), 3500);

          const directResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://shetsamarthan.in',
              'X-Title': 'Shet Samarthan',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: m,
              messages: messagesList,
              max_tokens: 220,
              temperature: 0.5
            }),
            signal: directController.signal
          });

          clearTimeout(directTimeout);

          if (directResp.ok) {
            const d = await directResp.json();
            let reply = d.choices?.[0]?.message?.content || '';
            if (reply) {
              let action = null;
              const actionMatch = reply.match(/\[\[ACTION:([a-zA-Z0-9_]+)\]\]/);
              if (actionMatch) {
                action = actionMatch[1];
                reply = reply.replace(/\[\[ACTION:[a-zA-Z0-9_]+\]\]/, '').trim();
              }

              const replyLang = detectLanguage(reply, effectiveLang);
              return {
                reply,
                action,
                detectedLanguage: replyLang || effectiveLang,
                audioBase64: null,
                model: 'ShetSamarth-LLM-70B',
                provider: 'Shet Samarthan Agronomy Brain'
              };
            }
          }
        } catch (mErr) {
          console.warn(`[AssistantService Client] Model ${m} timed out or failed:`, mErr.message);
        }
      }
    } catch (fallbackErr) {
      console.error('[AssistantService] Direct OpenRouter fallback error:', fallbackErr);
    }

    throw new Error('AI Assistant is momentarily unreachable. Please check your network connection and try again.');
  }
}

export const assistantService = new AssistantService();
export default assistantService;
