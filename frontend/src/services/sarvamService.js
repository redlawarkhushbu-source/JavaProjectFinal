/**
 * Sarvam AI Speech Service for Shet Samarthan
 * Integrates Sarvam AI (https://sarvam.ai) Indian GenAI Speech Models (bulbul:v4-flash)
 * 
 * Features:
 * 1. 3 Distinct Indian Regional Voice Packs:
 *    - 🌿 Marathi Ishita (इशिता - mr-IN, ishita_mr_conversational)
 *    - 🌾 Hindi Kabir (कबीर - hi-IN, kabir_hi_conversational)
 *    - 🌍 Indian English Dev (देव - en-IN, dev_en_conversational)
 * 2. Instant Speech Interruption: stop() aborts network requests & pauses audio immediately.
 * 3. 24,000 Hz Studio Quality Audio: Sample rate matches Sarvam AI bulbul:v4-flash specifications.
 * 4. "Fill It In Later" Architecture: Defaults to user's configured Sarvam API key or environment variable,
 *    with instant fallback to high-fidelity browser speech synthesis if offline or key is cleared.
 */

export const SARVAM_VOICEPACKS = [
  {
    id: 'shetkari_marathi',
    lang: 'mr',
    langCode: 'mr-IN',
    name: '🌿 मराठी आवाज',
    speaker: 'ishita_mr_conversational',
    gender: 'female',
    model: 'bulbul:v4-flash',
    sampleRate: 24000,
    pace: 1.0,
    sampleText: 'नमस्कार! शेत समर्थन मध्ये आपले स्वागत आहे. मी आपल्या शेताच्या व्यवस्थापनासाठी सदैव सज्ज आहे.'
  },
  {
    id: 'kisan_hindi',
    lang: 'hi',
    langCode: 'hi-IN',
    name: '🌾 हिंदी आवाज',
    speaker: 'kabir_hi_conversational',
    gender: 'male',
    model: 'bulbul:v4-flash',
    sampleRate: 24000,
    pace: 1.0,
    sampleText: 'नमस्ते किसान भाइयों! खेत समर्थन में आपका स्वागत है। आपकी फसल और मौसम की सटीक जानकारी के लिए मैं तैयार हूँ।'
  },
  {
    id: 'agri_english',
    lang: 'en',
    langCode: 'en-IN',
    name: '🌍 English Voice',
    speaker: 'dev_en_conversational',
    gender: 'male',
    model: 'bulbul:v4-flash',
    sampleRate: 24000,
    pace: 1.0,
    sampleText: 'Hello Farmer! Welcome to Shet Samarthan. Ask me anything about weather, crop diseases, or nearby agricultural stores.'
  }
];

class SarvamService {
  constructor() {
    this.currentAudio = null;
    this.currentAbortController = null;
    this.defaultKey = '';
  }

  /**
   * Retrieve active Sarvam AI API key
   */
  getApiKey() {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('shet_sarvam_key') : null;
    if (savedKey && typeof savedKey === 'string' && savedKey.trim().length > 10) {
      return savedKey.trim();
    }
    const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SARVAM_API_KEY : null;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 10 && !envKey.includes('your_')) {
      return envKey.trim();
    }
    return this.defaultKey || '';
  }

  saveApiKey(key) {
    if (typeof window !== 'undefined') {
      if (key && key.trim().length > 0) {
        localStorage.setItem('shet_sarvam_key', key.trim());
      } else {
        localStorage.removeItem('shet_sarvam_key');
      }
    }
  }

  clearApiKey() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shet_sarvam_key');
    }
  }

  isConfigured() {
    return this.getApiKey().length > 10;
  }

  getVoicepacks() {
    return SARVAM_VOICEPACKS;
  }

  getVoicepackById(id) {
    if (id === 'shetkari_dada' || id === 'krishi_sakhi' || id === 'shetkari_marathi') return SARVAM_VOICEPACKS[0];
    if (id === 'kisan_hindi') return SARVAM_VOICEPACKS[1];
    if (id === 'agri_english') return SARVAM_VOICEPACKS[2];
    return SARVAM_VOICEPACKS.find(v => v.id === id) || SARVAM_VOICEPACKS[0];
  }

  getVoicepackForLang(lang = 'mr') {
    if (lang === 'en') return SARVAM_VOICEPACKS.find(v => v.lang === 'en') || SARVAM_VOICEPACKS[2];
    if (lang === 'hi') return SARVAM_VOICEPACKS.find(v => v.lang === 'hi') || SARVAM_VOICEPACKS[1];
    return SARVAM_VOICEPACKS.find(v => v.lang === 'mr') || SARVAM_VOICEPACKS[0];
  }

  /**
   * Stop any currently playing or loading speech immediately
   */
  stop() {
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (e) {}
      this.currentAbortController = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
  }

  /**
   * Play base64 audio data directly (from server or cache)
   */
  async playBase64(base64Audio, onStart, onEnd, onError) {
    this.stop();
    if (!base64Audio) return false;

    try {
      const audioUrl = base64Audio.startsWith('data:') 
        ? base64Audio 
        : `data:audio/wav;base64,${base64Audio}`;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      return new Promise((resolve) => {
        audio.onplay = () => {
          if (onStart) onStart();
        };

        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
          resolve(true);
        };

        audio.onerror = (e) => {
          this.currentAudio = null;
          if (onError) onError(e);
          resolve(false);
        };

        audio.play().catch((playErr) => {
          this.currentAudio = null;
          if (onError) onError(playErr);
          resolve(false);
        });
      });
    } catch (err) {
      if (onError) onError(err);
      return false;
    }
  }

  /**
   * Synthesize and play speech via Sarvam AI API
   * Seamlessly falls back between Proxy -> Direct API -> Backend Proxy -> Browser synth
   */
  async speak({ text, language = 'mr', voicepackId = null, onStart, onEnd, onError }) {
    this.stop(); // Immediately kill any previous speech

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return false; // Signal fallback to browser synth
    }

    const pack = voicepackId 
      ? this.getVoicepackById(voicepackId) 
      : this.getVoicepackForLang(language);

    this.currentAbortController = new AbortController();

    try {
      // Chunk text safely to prevent Sarvam 500-char request limit errors
      let cleanText = (text || '').trim();
      if (!cleanText) return false;

      if (cleanText.length > 450) {
        // Truncate at sentence boundary
        const sentences = cleanText.match(/[^.!?।\n]+[.!?।\n]*/g) || [cleanText];
        let chunk = '';
        for (const s of sentences) {
          if ((chunk + s).length <= 450) {
            chunk += s;
          } else {
            break;
          }
        }
        cleanText = chunk.trim() || cleanText.slice(0, 450).trim();
      }

      const payload = {
        inputs: [cleanText],
        target_language_code: pack.langCode,
        speaker: pack.speaker,
        pitch: 0,
        pace: pack.pace || 1.0,
        loudness: 1.5,
        speech_sample_rate: pack.sampleRate || 24000,
        enable_preprocessing: true,
        model: pack.model || 'bulbul:v4-flash'
      };

      let response = null;

      // 1. First attempt: configured proxy route (works in local dev & Vercel rewrites)
      try {
        const proxyResp = await fetch('/sarvam-proxy/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': apiKey
          },
          body: JSON.stringify(payload),
          signal: this.currentAbortController.signal
        });

        const contentType = proxyResp.headers.get('content-type') || '';
        if (proxyResp.ok && contentType.includes('application/json')) {
          response = proxyResp;
        }
      } catch (proxyErr) {
        if (proxyErr.name === 'AbortError') throw proxyErr;
      }

      // 2. Second attempt: Direct Sarvam AI endpoint (for live servers & CORS-enabled environments)
      if (!response) {
        try {
          const directResp = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': apiKey
            },
            body: JSON.stringify(payload),
            signal: this.currentAbortController.signal
          });

          const contentType = directResp.headers.get('content-type') || '';
          if (directResp.ok && contentType.includes('application/json')) {
            response = directResp;
          }
        } catch (directErr) {
          if (directErr.name === 'AbortError') throw directErr;
        }
      }

      // 3. Third attempt: Spring Boot backend proxy /api/assistant/tts (if running)
      if (!response) {
        try {
          const backendResp = await fetch('/api/assistant/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: cleanText,
              lang: pack.lang,
              speaker: pack.speaker,
              langCode: pack.langCode
            }),
            signal: this.currentAbortController.signal
          });

          const contentType = backendResp.headers.get('content-type') || '';
          if (backendResp.ok && contentType.includes('application/json')) {
            response = backendResp;
          }
        } catch (backendErr) {
          if (backendErr.name === 'AbortError') throw backendErr;
        }
      }

      if (!response || !response.ok) {
        throw new Error('TTS service unavailable, falling back to browser synthesis');
      }

      const data = await response.json();
      if (!data.audios || !data.audios[0]) {
        throw new Error('No audio returned from Sarvam AI');
      }

      return this.playBase64(data.audios[0], onStart, onEnd, onError);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Speech was intentionally interrupted by user
        return true;
      }
      console.warn('Sarvam AI TTS playback failed, falling back to browser synthesis:', err);
      if (onError) onError(err);
      return false;
    }
  }
}

export const sarvamService = new SarvamService();
