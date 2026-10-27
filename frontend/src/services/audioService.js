/**
 * Multilingual Voice Assistant Service with Authentic Indian Regional Voicepacks & Accents
 * Supports:
 * 1. Sarvam AI (bulbul:v1) Indian GenAI Speech Models (3 Distinct Voice Packs for Marathi, Hindi, English)
 * 2. Web Speech API Fallback (Zero-Key Native SpeechSynthesis & SpeechRecognition)
 * 3. Instant Speech Interruption / Cancellation
 * 4. Website-Wide Feature Navigation & Controls
 */

import { sarvamService, SARVAM_VOICEPACKS } from './sarvamService';

export { SARVAM_VOICEPACKS };

export const MARATHI_VOICEPACKS = [
  {
    id: 'shetkari_marathi',
    name: '🌿 मराठी आवाज',
    nameHi: '🌿 मराठी आवाज',
    nameEn: '🌿 Marathi Voice',
    gender: 'female',
    pitch: 1.0,
    rate: 0.95,
    sampleText: 'नमस्कार! शेत समर्थन मध्ये आपले स्वागत आहे. मी आपल्या शेताच्या व्यवस्थापनासाठी सदैव सज्ज आहे.'
  },
  {
    id: 'kisan_hindi',
    name: '🌾 हिंदी आवाज',
    nameHi: '🌾 हिंदी आवाज',
    nameEn: '🌾 Hindi Voice',
    gender: 'female',
    pitch: 1.0,
    rate: 0.95,
    sampleText: 'नमस्ते किसान भाइयों! खेत समर्थन में आपका स्वागत है। आपकी फसल और मौसम की सटीक जानकारी के लिए मैं तैयार हूँ।'
  },
  {
    id: 'agri_english',
    name: '🌍 English Voice',
    nameHi: '🌍 English Voice',
    nameEn: '🌍 English Voice',
    gender: 'male',
    pitch: 1.0,
    rate: 0.96,
    sampleText: 'Hello Farmer! Welcome to Shet Samarthan. Ask me anything about weather, crop diseases, or nearby agricultural stores.'
  }
];

class AudioService {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.synth = typeof window !== 'undefined' ? (window.speechSynthesis || null) : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentVoicepackId = 'shetkari_marathi';
    this.cachedVoices = [];
    this.speakingChangeListeners = new Set();

    if (this.synth && typeof window !== 'undefined') {
      this.synth.onvoiceschanged = () => {
        this.cachedVoices = this.synth.getVoices();
      };
      this.cachedVoices = this.synth.getVoices();
    }
  }

  isSupported() {
    return !!(this.recognition || this.synth || sarvamService);
  }

  onSpeakingChange(listener) {
    this.speakingChangeListeners.add(listener);
    return () => this.speakingChangeListeners.delete(listener);
  }

  setSpeakingState(speaking) {
    this.isSpeaking = speaking;
    this.speakingChangeListeners.forEach(listener => {
      try { listener(speaking); } catch (e) {}
    });
  }

  setVoicepack(voicepackId) {
    this.currentVoicepackId = voicepackId;
  }

  getVoicepacks() {
    return MARATHI_VOICEPACKS;
  }

  /**
   * Preview a voicepack by speaking its authentic sample text
   */
  previewVoicepack(voicepackId) {
    this.stopSpeaking();
    const sarvamPack = sarvamService.getVoicepackById(voicepackId);
    const browserPack = MARATHI_VOICEPACKS.find(v => v.id === voicepackId) || MARATHI_VOICEPACKS[0];
    const sample = sarvamPack?.sampleText || browserPack?.sampleText || 'नमस्कार! शेत समर्थन मध्ये आपले स्वागत आहे.';
    const lang = sarvamPack?.lang || 'mr';
    return this.speak(sample, lang, voicepackId);
  }

  /**
   * Start microphone listening for voice queries
   */
  startListening({ language = 'mr', onResult, onError, onEnd }) {
    // Immediately stop any active speech when user initiates listening
    this.stopSpeaking();

    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      this.recognition.abort();
    } catch (e) {}

    const langCodeMap = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };

    this.recognition.lang = langCodeMap[language] || 'mr-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.isListening = true;

    this.recognition.onresult = (event) => {
      const transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
      this.isListening = false;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  /**
   * Stop listening immediately
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  /**
   * Single-shot voice input for text fields (search boxes, location inputs, etc.)
   */
  listenOnce({ language = 'mr', onResult, onError, onEnd }) {
    this.stopSpeaking();
    return this.startListening({ language, onResult, onError, onEnd });
  }

  /**
   * Pre-processes Marathi text phonetically for natural Devanagari pronunciation
   */
  normalizeMarathiPhonetics(text) {
    if (!text) return '';
    return text
      .replace(/(\d+)\s*°\s*C/g, '$1 अंश सेल्सिअस')
      .replace(/(\d+)\s*%/g, '$1 टक्के')
      .replace(/(\d+)\s*-\s*(\d+)\s*अंश/g, '$1 ते $2 अंश सेल्सिअस')
      .replace(/(\d+)\s*अंश/g, '$1 अंश सेल्सिअस')
      .replace(/(\d+)\s*किमी\/तास/g, '$1 किलोमीटर प्रति तास')
      .replace(/(\d+)\s*km\/h/gi, '$1 किलोमीटर प्रति तास')
      .replace(/pH\s*([\d\.]+)/gi, 'पीएच $1')
      .replace(/(\d+)\s*-\s*(\d+)/g, '$1 ते $2')
      .replace(/\bAQI\b/gi, 'हवा गुणवत्ता निर्देशांक');
  }

  /**
   * Stop speech immediately:
   * 1. Cancels browser SpeechSynthesis
   * 2. Halts Sarvam AI audio playback
   * 3. Aborts in-flight network requests
   */
  stopSpeaking() {
    // 1. Cancel browser speech synthesis
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }

    // 2. Halt Sarvam AI audio playback and abort requests
    sarvamService.stop();

    // 3. Update global speaking state
    this.setSpeakingState(false);
  }

  /**
   * Speaks text using dedicated regional voice (Kalpit for English, Ishita for Hindi & Marathi)
   */
  async speak(text, language = 'mr', voicepackId = null, onStart, onEnd) {
    // Immediately cancel any previous speech
    this.stopSpeaking();

    if (!text || !text.trim()) return;

    this.setSpeakingState(true);
    if (onStart) onStart();

    // Automatically resolve voicepack according to language requirement:
    // English -> Kalpit (agri_english), Hindi -> Ishita (kisan_hindi), Marathi -> Ishita (shetkari_marathi)
    const activeVoiceId = voicepackId || (language === 'en' ? 'agri_english' : language === 'hi' ? 'kisan_hindi' : 'shetkari_marathi');

    // Strategy 1: Try Sarvam AI GenAI TTS if configured
    if (sarvamService.isConfigured()) {
      try {
        const played = await sarvamService.speak({
          text,
          language,
          voicepackId: activeVoiceId,
          onStart: () => {
            this.setSpeakingState(true);
            if (onStart) onStart();
          },
          onEnd: () => {
            this.setSpeakingState(false);
            if (onEnd) onEnd();
          },
          onError: () => {
            // Fall back to browser synth
            this.speakWithBrowserSynth(text, language, activeVoiceId, onStart, onEnd);
          }
        });

        if (played) {
          return;
        }
      } catch (e) {
        console.warn('TTS playback encountered error, switching to browser synth:', e);
      }
    }

    // Strategy 2: High-Fidelity Browser Speech Synthesis (Zero-Key Native Mode)
    this.speakWithBrowserSynth(text, language, activeVoiceId, onStart, onEnd);
  }

  /**
   * Native Browser SpeechSynthesis engine with Devanagari accent selection
   */
  speakWithBrowserSynth(text, language = 'mr', voicepackId = null, onStart, onEnd) {
    if (!this.synth) {
      this.setSpeakingState(false);
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
    } catch (e) {}

    const activePackId = voicepackId || this.currentVoicepackId;
    const voicepack = MARATHI_VOICEPACKS.find(v => v.id === activePackId) || MARATHI_VOICEPACKS[0];

    const processedText = language === 'mr' ? this.normalizeMarathiPhonetics(text) : text;
    const utterance = new SpeechSynthesisUtterance(processedText);

    const langCodeMap = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };
    utterance.lang = langCodeMap[language] || 'mr-IN';
    utterance.rate = voicepack.rate || 0.92;
    utterance.pitch = voicepack.pitch || 1.0;

    utterance.onstart = () => {
      this.setSpeakingState(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.setSpeakingState(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.setSpeakingState(false);
      if (onEnd) onEnd();
    };

    // Discover the best available Devanagari / Indian accent voice
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();

    let selectedVoice = voices.find(v => 
      v.lang.toLowerCase().includes('mr') || 
      v.name.toLowerCase().includes('marathi')
    );

    if (!selectedVoice) {
      if (voicepack.gender === 'female') {
        selectedVoice = voices.find(v => 
          (v.lang.includes('hi') || v.lang.includes('IN')) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('heera'))
        );
      } else {
        selectedVoice = voices.find(v => 
          (v.lang.includes('hi') || v.lang.includes('IN')) && 
          (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('madhav') || v.name.toLowerCase().includes('ravi'))
        );
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('india'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.synth.speak(utterance);
  }

  previewVoicepack(voicepackId) {
    const pack = MARATHI_VOICEPACKS.find(v => v.id === voicepackId) || MARATHI_VOICEPACKS[0];
    const lang = pack.id.includes('hindi') ? 'hi' : pack.id.includes('english') ? 'en' : 'mr';
    this.speak(pack.sampleText, lang, pack.id);
  }

  /**
   * Agricultural Natural Language Query & Intent Processor
   * Resolves website-wide feature navigation, controls, and hyper-accurate farming responses.
   */
  processCommand(transcript, language = 'mr', userLocation = null) {
    const rawText = (transcript || '').trim();
    const text = rawText.toLowerCase();

    // Resolve location label for personalized responses
    let locLabel = '';
    let locCity = 'Mumbai';
    if (typeof userLocation === 'string' && userLocation.trim()) {
      locLabel = userLocation.trim();
      locCity = locLabel;
    } else if (userLocation && typeof userLocation === 'object') {
      locCity = userLocation.city || userLocation.district || 'Mumbai';
      locLabel = userLocation.locality 
        ? `${userLocation.locality}, ${locCity}`
        : (userLocation.district || userLocation.city || userLocation.location || '');
    }

    // -------------------------------------------------------------
    // FEATURE CONTROLS & WEBSITE NAVIGATION INTENTS
    // -------------------------------------------------------------

    // 1. Language Controls (Universal across English, Hindi & Marathi)
    const isMarathiCmd = text.includes('मराठी') || text.includes('marathi') || text.includes('marathi kara') || text.includes('make the website to marathi') || text.includes('change to marathi') || text.includes('switch to marathi') || text.includes('website marathi');
    const isHindiCmd = text.includes('हिंदी') || text.includes('hindi') || text.includes('hindi karo') || text.includes('make the website to hindi') || text.includes('change to hindi') || text.includes('switch to hindi') || text.includes('website hindi');
    const isEnglishCmd = text.includes('इंग्रजी') || text.includes('अंग्रेजी') || text.includes('english') || text.includes('make the website to english') || text.includes('change to english') || text.includes('switch to english') || text.includes('website english');

    if (isMarathiCmd && !isHindiCmd && !isEnglishCmd) {
      return {
        type: 'control',
        action: 'change_lang_mr',
        response: {
          mr: 'होय शेतकरी दादा, संपूर्ण वेबसाइट आता मराठी भाषेत बदलली आहे.',
          hi: 'जी हाँ, वेबसाइट की भाषा मराठी में बदल दी गई है।',
          en: 'Website language switched to Marathi.'
        }
      };
    }

    if (isHindiCmd && !isMarathiCmd && !isEnglishCmd) {
      return {
        type: 'control',
        action: 'change_lang_hi',
        response: {
          mr: 'होय, वेबसाइटची भाषा आता हिंदी मध्ये बदलली आहे.',
          hi: 'जी किसान भाई, वेबसाइट की भाषा अब पूरी तरह हिंदी में बदल दी गई है।',
          en: 'Website language switched to Hindi.'
        }
      };
    }

    if (isEnglishCmd && !isMarathiCmd && !isHindiCmd) {
      return {
        type: 'control',
        action: 'change_lang_en',
        response: {
          mr: 'वेबसाइटची भाषा आता इंग्रजी मध्ये बदलली आहे.',
          hi: 'वेबसाइट की भाषा अब अंग्रेजी में बदल दी गई है।',
          en: 'Website language switched to English.'
        }
      };
    }

    // 2. Location Selector & Two-Stage Location Modal
    if (text.includes('स्थान बदला') || text.includes('गाव बदला') || text.includes('जिल्हा बदला') || text.includes('शहर बदला') || text.includes('change location') || text.includes('select location') || text.includes('स्थान बदलो') || text.includes('जगह बदलो')) {
      return {
        type: 'control',
        action: 'open_location_modal',
        response: {
          mr: 'स्थान निवड विंडो उघडत आहे. आपण आपला जिल्हा व अचूक शेताचे गाव किंवा परिसर निवडू शकता.',
          hi: 'स्थान चयन विंडो खोली जा रही है। आप अपना जिला व गांव चुन सकते हैं।',
          en: 'Opening the Two-Stage Location Selector. You can choose your district and local farm village.'
        }
      };
    }

    // 4. City-Specific Location Quick Jump (e.g. "पुणे करा", "मुंबई हवामान", "नागपूर करा")
    const cityMatches = [
      { name: 'पुणे', id: 'Pune', mr: 'पुणे', hi: 'पुणे', en: 'Pune' },
      { name: 'मुंबई', id: 'Mumbai', mr: 'मुंबई', hi: 'मुंबई', en: 'Mumbai' },
      { name: 'नाशिक', id: 'Nashik', mr: 'नाशिक', hi: 'नासिक', en: 'Nashik' },
      { name: 'नागपूर', id: 'Nagpur', mr: 'नागपूर', hi: 'नागपुर', en: 'Nagpur' },
      { name: 'कोल्हापूर', id: 'Kolhapur', mr: 'कोल्हापूर', hi: 'कोल्हापुर', en: 'Kolhapur' },
      { name: 'ठाणे', id: 'Thane', mr: 'ठाणे', hi: 'ठाणे', en: 'Thane' },
      { name: 'सातारा', id: 'Satara', mr: 'सातारा', hi: 'सतारा', en: 'Satara' },
      { name: 'सोलापूर', id: 'Solapur', mr: 'सोलापूर', hi: 'सोलापुर', en: 'Solapur' },
      { name: 'सांगली', id: 'Sangli', mr: 'सांगली', hi: 'सांगली', en: 'Sangli' },
      { name: 'औरंगाबाद', id: 'ChhatrapatiSambhajinagar', mr: 'छत्रपती संभाजीनगर', hi: 'छत्रपति संभाजीनगर', en: 'Sambhaji Nagar' }
    ];

    for (const city of cityMatches) {
      if (text.includes(city.name.toLowerCase()) || text.includes(city.en.toLowerCase())) {
        if (text.includes('हवामान') || text.includes('weather') || text.includes('मौसम') || text.includes('पाऊस')) {
          return {
            type: 'weather',
            action: `navigate_weather_city_${city.id}`,
            response: {
              mr: `${city.mr} जिल्ह्याचे थेट उपग्रह हवामान व फवारणी अंदाज लोड करत आहे.`,
              hi: `${city.hi} जिले का लाइव उपग्रह मौसम व छिड़काव पूर्वानुमान लोड किया जा रहा है।`,
              en: `Loading live satellite weather forecast for ${city.en}.`
            }
          };
        }
        if (text.includes('दुकान') || text.includes('केंद्र') || text.includes('store') || text.includes('supplier')) {
          return {
            type: 'suppliers',
            action: `navigate_suppliers_city_${city.id}`,
            response: {
              mr: `${city.mr} परिसरातील प्रमाणित कृषी सेवा केंद्र व खतांची दुकाने दाखवत आहे.`,
              hi: `${city.hi} क्षेत्र के नजदीकी कृषि सेवा केंद्र व दुकानें दिखाई जा रही हैं।`,
              en: `Showing certified Krishi Kendra stores near ${city.en}.`
            }
          };
        }
      }
    }

    // 5. Navigation: Dashboard
    if (text.includes('डॅशबोर्ड') || text.includes('डैशबोर्ड') || text.includes('dashboard') || text.includes('मुख्य पान') || text.includes('मुख्य मेनू') || text.includes('home page')) {
      return {
        type: 'navigation',
        action: 'navigate_dashboard',
        response: {
          mr: 'शेत समर्थन मुख्य डॅशबोर्ड उघडत आहे. येथे हवामान, पीक स्थिती व कृषी केंद्रांचे संपूर्ण अवलोकन उपलब्ध आहे.',
          hi: 'खेत समर्थन मुख्य डैशबोर्ड खोला जा रहा है। यहाँ आपको मौसम, फसल स्वास्थ्य व दुकानों का संपूर्ण विवरण मिलेगा।',
          en: 'Navigating to the Farm Dashboard with complete farm overview.'
        }
      };
    }

    // 6. Navigation: 3D Farm Simulator
    if (text.includes('३डी') || text.includes('3d') || text.includes('शेत दाखवा') || text.includes('खेत दिखाओ') || text.includes('फार्म दाखवा') || text.includes('simulator') || text.includes('3d farm')) {
      return {
        type: '3dfarm',
        action: 'navigate_3dfarm',
        response: {
          mr: 'इंटरॅक्टिव्ह ३D शेत मॉडेल उघडत आहे. आपण टोमॅटो, वांगी, मिरची, कांदा, कापूस व उसाची झाडे आणि ठिबक सिंचन ३D मध्ये पाहू शकता.',
          hi: '३D फार्म सिमुलेटर खोला जा रहा है। आप टमाटर, बैंगन, मिर्च, कपास व गन्ने की फसलें ३D में देख सकते हैं।',
          en: 'Opening the Interactive 3D Farmland Simulator with procedural crops and drip irrigation lines.'
        }
      };
    }

    // 7. Navigation: Crop Disease Diagnosis (Accepts "open ai diagnosis", "daignosis", "रोग निदान", "बीमारी जांच", etc.)
    const isDiagnosisCmd = text.includes('diagnosis') || text.includes('daignosis') || text.includes('diagnos') || text.includes('रोग निदान') || text.includes('निदान') || text.includes('रोग जांच') || text.includes('बीमारी जांच') || text.includes('बीमारी') || text.includes('पीक रोग') || text.includes('पान स्कॅन') || text.includes('पत्ती जांच') || text.includes('रोग तपासा') || text.includes('scan crop') || text.includes('crop health');

    if (isDiagnosisCmd) {
      return {
        type: 'diagnosis',
        action: 'navigate_diagnosis',
        response: {
          mr: 'AI पीक रोग निदान उघडत आहे. पानाचा फोटो काढून किंवा अपलोड करून त्वरित अचूक उपाय मिळवा.',
          hi: 'AI फसल रोग निदान खोला जा रहा है। पत्ती की तस्वीर से सटीक जैविक व रासायनिक उपाय प्राप्त करें।',
          en: 'Opening AI Crop Disease Diagnosis Scanner. Capture or upload a leaf photo for instant remedies.'
        }
      };
    }

    // 8. Navigation: Profile
    if (text.includes('माझे प्रोफाइल') || text.includes('शेतकरी प्रोफाइल') || text.includes('माझे खाते') || text.includes('किसान प्रोफाइल') || text.includes('profile') || text.includes('my profile') || text.includes('farm details')) {
      return {
        type: 'profile',
        action: 'navigate_profile',
        response: {
          mr: 'आपले शेतकरी प्रोफाइल उघडत आहे. येथे आपण शेताचे क्षेत्रफळ, पिके, मातीचा प्रकार व संपर्क माहिती तपासू शकता.',
          hi: 'आपका किसान प्रोफाइल खोला जा रहा है। यहाँ खेत का क्षेत्रफल, फसलें व मिट्टी की जानकारी सुरक्षित कर सकते हैं।',
          en: 'Navigating to your Farm Profile page.'
        }
      };
    }

    // 9. Sign In / Authentication
    if (text.includes('लॉगिन') || text.includes('साइन इन') || text.includes('login') || text.includes('sign in') || text.includes('खाते उघडा')) {
      return {
        type: 'auth',
        action: 'navigate_auth',
        response: {
          mr: 'लॉगिन व नोंदणी पेज उघडत आहे. आपण Google किंवा मोबाईल OTP द्वारे सुरक्षित प्रवेश करू शकता.',
          hi: 'लॉगिन पृष्ठ खोला जा रहा है। आप गूगल अथवा मोबाइल ओटीपी से सुरक्षित प्रवेश कर सकते हैं।',
          en: 'Opening Sign In page with Google and Mobile SMS OTP login.'
        }
      };
    }

    // 10. Logout / Sign Out
    if (text.includes('लॉगआउट') || text.includes('बाहेर पडा') || text.includes('logout') || text.includes('sign out')) {
      return {
        type: 'auth',
        action: 'action_logout',
        response: {
          mr: 'आपल्या खात्यातून यशस्वीरित्या बाहेर पडलो आहे. पुन्हा भेट द्या!',
          hi: 'खाते से सफलतापूर्वक लॉगआउट कर दिया गया है।',
          en: 'Logged out successfully from your farmer account.'
        }
      };
    }

    // 11. Specific Category Supplier Filter (Seeds, Fertilizers, Medicines, Irrigation)
    if (text.includes('बियाणे दुकान') || text.includes('बियाणे कुठे मिळतील') || text.includes('seeds store')) {
      return {
        type: 'suppliers',
        action: 'filter_supplier_seeds',
        response: {
          mr: `${locLabel ? locLabel + ' परिसरातील ' : ''}प्रमाणित संकरित बियाण्यांची दुकाने दाखवत आहे.`,
          hi: `${locLabel ? locLabel + ' क्षेत्र की ' : ''}प्रमाणित संकरित बीज की दुकानें दिखाई जा रही हैं।`,
          en: `Filtering certified hybrid seed stores near ${locLabel || 'your location'}.`
        }
      };
    }

    if (text.includes('खताचे दुकान') || text.includes('खते कुठे') || text.includes('fertilizer store') || text.includes('खाद की दुकान')) {
      return {
        type: 'suppliers',
        action: 'filter_supplier_fertilizers',
        response: {
          mr: `${locLabel ? locLabel + ' परिसरातील ' : ''}रासायनिक व सेंद्रिय खतांची दुकाने नकाशावर दाखवत आहे.`,
          hi: `${locLabel ? locLabel + ' क्षेत्र की ' : ''}रासायनिक व जैविक खाद की दुकानें दिखाई जा रही हैं।`,
          en: `Showing verified fertilizer and nutrient stores near ${locLabel || 'your location'}.`
        }
      };
    }

    if (text.includes('औषधाचे दुकान') || text.includes('कीटकनाशक दुकान') || text.includes('pesticide store') || text.includes('दवा की दुकान')) {
      return {
        type: 'suppliers',
        action: 'filter_supplier_medicines',
        response: {
          mr: `${locLabel ? locLabel + ' परिसरातील ' : ''}पीक संरक्षण व औषध विक्रेते दाखवत आहे.`,
          hi: `${locLabel ? locLabel + ' क्षेत्र के ' : ''}कीटनाशक व फसल सुरक्षा केंद्र दिखाए जा रहे हैं।`,
          en: `Showing certified crop protection and medicine stores near ${locLabel || 'your location'}.`
        }
      };
    }

    if (text.includes('ठिबक सिंचन दुकान') || text.includes('सिंचन पंप') || text.includes('irrigation store') || text.includes('ड्रिप सिंचाई दुकान')) {
      return {
        type: 'suppliers',
        action: 'filter_supplier_irrigation',
        response: {
          mr: `${locLabel ? locLabel + ' परिसरातील ' : ''}ठिबक सिंचन, पाईप्स व सोलर पंप विक्रेते दाखवत आहे.`,
          hi: `${locLabel ? locLabel + ' क्षेत्र के ' : ''}ड्रिप सिंचाई व सोलर पंप केंद्र दिखाए जा रहे हैं।`,
          en: `Showing drip irrigation, piping and solar pump dealers near ${locLabel || 'your location'}.`
        }
      };
    }

    // -------------------------------------------------------------
    // HYPER-ACCURATE AGRICULTURAL ADVISORIES & WEATHER
    // -------------------------------------------------------------

    // 12. Weather, Rain & Spray Suitability
    if (text.includes('हवामान') || text.includes('पाऊस') || text.includes('weather') || text.includes('rain') || text.includes('मौसम') || text.includes('बारिश') || text.includes('तापमान') || text.includes('temperature') || text.includes('ढग') || text.includes('बादल') || text.includes('फवारणी')) {
      const locPrefixMr = locLabel ? `${locLabel} साठी ` : '';
      const locPrefixHi = locLabel ? `${locLabel} के लिए ` : '';
      const locPrefixEn = locLabel ? `for ${locLabel}: ` : '';
      return {
        type: 'weather',
        action: 'navigate_weather',
        response: {
          mr: `${locPrefixMr}थेट उपग्रह हवामानानुसार तापमान २८ ते ३० अंश सेल्सिअस असून हवामान अनुकूल आहे. संध्याकाळी ४:०० ते ६:३० दरम्यान फवारणीसाठी योग्य काळ आहे. सविस्तर अंदाज व रडार पाहण्यासाठी हवामान पेज उघडत आहे.`,
          hi: `${locPrefixHi}लाइव सैटेलाइट अनुसार तापमान २८ से ३० डिग्री है और मौसम अनुकूल है। शाम ४:०० से ६:३० बजे के बीच छिड़काव के लिए सर्वोत्तम समय है। विस्तृत मौसम पेज खोला जा रहा है।`,
          en: `Live satellite weather ${locPrefixEn}temperature is 28°C-30°C. Optimal spraying window is today between 4:00 PM and 6:30 PM. Opening Weather page.`
        }
      };
    }

    // 13. General Suppliers & Krishi Kendra Stores
    if (text.includes('दुकान') || text.includes('केंद्र') || text.includes('store') || text.includes('supplier') || text.includes('दुकानें') || text.includes('कृषी सेवा केंद्र')) {
      const locStoreMr = locLabel ? `${locLabel} परिसरातील ` : 'आपल्या परिसरातील ';
      const locStoreHi = locLabel ? `${locLabel} क्षेत्र की ` : 'आपके क्षेत्र की ';
      const locStoreEn = locLabel ? `near ${locLabel} ` : 'near your farm ';
      return {
        type: 'suppliers',
        action: 'navigate_suppliers',
        response: {
          mr: `${locStoreMr}शासकीय परवानाधारक कृषी सेवा केंद्र व खतांची दुकाने नकाशावर उपलब्ध आहेत. अचूक अंतर व १-टॅप नेव्हिगेशन पाहण्यासाठी स्टोअर पेज उघडत आहे.`,
          hi: `${locStoreHi}सरकारी लाइसेंस प्राप्त कृषि सेवा केंद्र व दुकानें नक्शे पर उपलब्ध हैं। दूरी और नेविगेशन देखने के लिए सप्लायर पेज खोला जा रहा है।`,
          en: `Government-licensed Krishi Seva Kendra stores ${locStoreEn}are available with exact distances and 1-tap navigation.`
        }
      };
    }

    // 14. Tomato Blight & Leaf Curl
    if (text.includes('टोमॅटो') || text.includes('टमाटर') || text.includes('tomato') || text.includes('करपा') || text.includes('झुलसा')) {
      return {
        type: 'diagnosis',
        action: 'navigate_diagnosis',
        response: {
          mr: 'टोमॅटोवरील अर्ली ब्लाइट (करपा) नियंत्रणासाठी मॅनकोझेब ७५% डब्ल्यूपी २.५ ग्रॅम किंवा अझोक्सीस्ट्रोबिन १ मिली प्रति लिटर पाण्यात मिसळून फवारावे. जैविक नियंत्रणासाठी ५% निंबोळी अर्क वापरावा.',
          hi: 'टमाटर के अगेती झुलसा रोग के लिए मैनकोजेब ७५% डब्ल्यूपी २.५ ग्राम या एजोक्सीस्ट्रोबिन १ मिली प्रति लीटर पानी में मिलाकर छिड़कें। जैविक रोकथाम हेतु ५% नीम बीज अर्क उपयोगी है।',
          en: 'For Tomato Early Blight, spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin @ 1ml/L. For biological prevention, apply 5% Neem Seed Kernel Extract (NSKE).'
        }
      };
    }

    // 15. Onion Purple Blotch & Yellowing
    if (text.includes('कांदा') || text.includes('प्याज') || text.includes('onion') || text.includes('जांभळा करपा')) {
      return {
        type: 'diagnosis',
        action: 'navigate_diagnosis',
        response: {
          mr: 'कांद्यावरील जांभळा करपा (Purple Blotch) नियंत्रणासाठी कार्बेन्डाझिम १ ग्रॅम + मॅनकोझेब २.५ ग्रॅम प्रति लिटर पाण्यात स्टीकर (डिंक) मिसळून फवारावे. शेतात पाण्याचा निचरा योग्य ठेवावा.',
          hi: 'प्याज के जामुनी धब्बा (पर्पल ब्लॉच) रोग के लिए कार्बेन्डाजिम १ ग्राम + मैनकोजेब २.५ ग्राम प्रति लीटर पानी में स्टीकर मिलाकर छिड़कें। जल निकासी अच्छी रखें।',
          en: 'For Onion Purple Blotch, apply Carbendazim 50% WP @ 1g + Mancozeb 75% WP @ 2.5g per liter with a sticker. Ensure proper bed drainage to prevent spore germination.'
        }
      };
    }

    // 16. Chilli Leaf Curl (Churada-Murada / Bokadya)
    if (text.includes('मिरची') || text.includes('मिर्च') || text.includes('chilli') || text.includes('चुरडा') || text.includes('मुरडा') || text.includes('बोकड्या')) {
      return {
        type: 'diagnosis',
        action: 'navigate_diagnosis',
        response: {
          mr: 'मिरचीवरील चुरडा-मुरडा (बोकड्या) रोग फुलकिडे व पांढऱ्या माशीमुळे होतो. नियंत्रणासाठी एकरी १२ पिवळे व निळे चिकट सापळे लावावेत आणि डायफेन्थियुरॉन ५०% डब्ल्यूपी १.२ ग्रॅम किंवा निंबोळी तेल ५ मिली फवारावे.',
          hi: 'मिर्च में मरोड़िया (चुरडा-मुरडा) रोग थ्रिप्स व सफेद मक्खी से फैलता है। एकर में १२ पीले व नीले चिपचिपे ट्रैप लगाएं और डायफेंथियूरॉन ५०% डब्ल्यूपी १.२ ग्राम या नीम तेल ५ मिली का छिड़काव करें।',
          en: 'Chilli Leaf Curl is transmitted by thrips and whiteflies. Install yellow and blue sticky traps (12/acre) and spray Diafenthiuron 50% WP @ 1.2g/L or Neem Oil @ 5ml/L.'
        }
      };
    }

    // 17. Cotton Pink Bollworm & Sucking Pests
    if (text.includes('कापूस') || text.includes('कपास') || text.includes('cotton') || text.includes('बोंडअळी') || text.includes('गुलाबी सुंडी')) {
      return {
        type: 'diagnosis',
        action: 'navigate_diagnosis',
        response: {
          mr: 'कापसावरील गुलाबी बोंडअळीसाठी एकरी ५ कामगंध सापळे लावावेत. रसशोषक किडींसाठी फ्लोनिकामिड ५०% डब्ल्यूजी ०.३ ग्रॅम किंवा प्रोफेनोफॉस ५०% ईसी २ मिली प्रति लिटर फवारावे.',
          hi: 'कपास में गुलाबी सुंडी के लिए प्रति एकड़ ५ फेरोमोन ट्रैप लगाएं। रसचूसक कीटों के लिए फ्लोनिकामिड ५०% डब्ल्यूजी ०.३ ग्राम या प्रोफेनोफॉस ५०% ईसी २ मिली का छिड़काव करें।',
          en: 'For Cotton Pink Bollworm, install 5 pheromone traps per acre. For sucking pests, spray Flonicamid 50% WG @ 0.3g/L or Profenofos 50% EC @ 2ml/L.'
        }
      };
    }

    // 18. Sugarcane Red Rot & Drip Irrigation
    if (text.includes('ऊस') || text.includes('गन्ना') || text.includes('sugarcane')) {
      return {
        type: '3dfarm',
        action: 'navigate_3dfarm',
        response: {
          mr: 'उसावरील तांबेरा व काणी रोग प्रतिबंधासाठी बेणे प्रक्रियेत कार्बेन्डाझिम १ ग्रॅम प्रति लिटर द्रावणात बेणे १० मिनिटे बुडवावे. ३D फार्म सिमुलेटरमध्ये उसाची वाढ व ठिबक सिंचन पाहू शकता.',
          hi: 'गन्ने की लाल सड़न (रेड रॉट) रोकथाम के लिए बुवाई से पहले कार्बेन्डाजिम १ ग्राम प्रति लीटर घोल में बीज उपचार करें। ३D मॉडल में गन्ने की फसल व सिंचाई देख सकते हैं।',
          en: 'For Sugarcane Red Rot prevention, treat seed setts with Carbendazim 50% WP @ 1g/L for 15 minutes prior to planting. Explore Sugarcane in the 3D Farm Simulator.'
        }
      };
    }

    // 19. Fertilizer Dosage (Urea, DAP, NPK, Nano Urea)
    if (text.includes('खत') || text.includes('खाद') || text.includes('युरिया') || text.includes('डीएपी') || text.includes('fertilizer') || text.includes('urea') || text.includes('dap')) {
      return {
        type: 'suppliers',
        action: 'filter_supplier_fertilizers',
        response: {
          mr: 'पिकांच्या संतुलित वाढीसाठी बेसल डोस म्हणून १०:२६:२६ किंवा डीएपी सह निंबोळी पेंड द्यावी. उभ्या पिकात नत्राची कमतरता असल्यास एकरी ५०० मिली नॅनो युरिया प्रति १०० लिटर पाण्यात फवारणे अत्यंत किफायतशीर ठरते.',
          hi: 'संतुलित पोषण के लिए बुवाई के समय १०:२६:२६ अथवा डीएपी के साथ नीम खली का प्रयोग करें। खड़ी फसल में ५०० मिली नैनो यूरिया प्रति १०० लीटर पानी में छिड़काव अत्यधिक लाभकारी है।',
          en: 'For balanced soil nutrition, apply 10:26:26 or DAP with neem cake at sowing. In standing crops, foliar application of Nano Urea @ 500ml/100L water saves costs and boosts yield.'
        }
      };
    }

    // 20. Mandi Market Prices
    if (text.includes('बाजारभाव') || text.includes('भाव') || text.includes('दर') || text.includes('mandi') || text.includes('market price') || text.includes('मंडी भाव')) {
      return {
        type: 'market',
        action: null,
        response: {
          mr: `आजच्या प्रमुख एपीएमसी बाजारभावानुसार: टोमॅटो १५०० ते २५०० रुपये प्रति क्विंटल, कांदा १२०० ते २२०० रुपये, आणि सोयाबीन ४४०० ते ४७५० रुपये प्रति क्विंटल सरासरी दर चालू आहेत.`,
          hi: `आज के प्रमुख मंडी भाव: टमाटर १५०० से २५०० रुपये/क्विंटल, प्याज १२०० से २२०० रुपये, और सोयाबीन ४४०० से ४७५० रुपये/क्विंटल चल रहे हैं।`,
          en: 'Current APMC Mandi modal prices: Tomato ₹1,500 - ₹2,500/quintal, Onion ₹1,200 - ₹2,200/quintal, and Soybean ₹4,400 - ₹4,750/quintal.'
        }
      };
    }

    // 21. Government Schemes & Subsidies
    if (text.includes('योजना') || text.includes('अनुदान') || text.includes('सबसिडी') || text.includes('scheme') || text.includes('subsidy')) {
      return {
        type: 'schemes',
        action: null,
        response: {
          mr: 'प्रमुख शेती योजनांमध्ये पीएम किसान सन्मान निधी (वार्षिक ६००० रुपये), पीएम कुसुम सौर पंप योजना (९०% पर्यंत अनुदान), आणि ठिबक सिंचनासाठी महाडीबीटी अंतर्गत ५५% ते ८०% अनुदान उपलब्ध आहे.',
          hi: 'प्रमुख कृषि योजनाओं में पीएम किसान सम्मान निधि, पीएम कुसुम सोलर पंप योजना (९०% तक सब्सिडी), तथा ड्रिप सिंचाई के लिए ५५% से ८०% तक सरकारी अनुदान उपलब्ध है।',
          en: 'Major agricultural schemes include PM-KISAN, PM-KUSUM Solar Pump Subsidy (up to 90%), and National Micro-Irrigation drip subsidies (55% to 80%).'
        }
      };
    }

    // 22. Greetings & Identity
    if (text.includes('नमस्कार') || text.includes('नमस्ते') || text.includes('हॅलो') || text.includes('हाय') || text.includes('कोण आहेस') || text.includes('hello') || text.includes('hi') || text.includes('who are you')) {
      return {
        type: 'greeting',
        action: null,
        response: {
          mr: 'नमस्कार शेतकरी दादा! मी शेत समर्थन कृषी एआय सहाय्यक आहे. मी हवामान अंदाज, पीक रोग, खते, औषधे व जवळची दुकाने शोधण्यात मदत करू शकतो. विचारा, काय मदत करू?',
          hi: 'नमस्ते किसान भाई! मैं खेत समर्थन एग्री एआई साथी हूँ। मौसम, फसल रोग, खाद और नजदीकी दुकानों की जानकारी में आपकी मदद कर सकता हूँ। बताएं, क्या सेवा करूँ?',
          en: 'Hello Farmer! I am your Shet Samarthan AI Agronomy Assistant. Ask me about weather, crop diseases, fertilizers, or nearby Krishi Kendra stores.'
        }
      };
    }

    // Default Fallback
    return {
      type: 'general',
      action: null,
      response: {
        mr: `मी शेत समर्थन कृषी AI सहाय्यक आहे. आपण मला थेट हवामान, फवारणी वेळ, टोमॅटो/कांदा/मिरची/कापूस रोग उपचार, खत मात्रा किंवा परिसरातील प्रमाणित कृषी केंद्रांबद्दल बोलून विचारू शकता.`,
        hi: `मैं खेत समर्थन एआई साथी हूँ। आप मुझसे सीधे मौसम, छिड़काव का सही समय, टमाटर/प्याज/मिर्च/कपास रोग, खाद और नजदीकी कृषि केंद्रों के बारे में पूछ सकते हैं।`,
        en: `I am your Shet Samarthan Agri AI Assistant. You can speak to check weather, optimal spraying hours, crop disease treatments (Tomato, Onion, Chilli, Cotton), fertilizers, or nearby certified Krishi Kendra stores.`
      }
    };
  }
}

export const audioService = new AudioService();
export default audioService;
