import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { audioService } from '../services/audioService';
import { sarvamService } from '../services/sarvamService';
import { assistantService } from '../services/assistantService';
import { detectLanguage } from '../utils/langDetector';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  Sparkles, 
  ArrowRight, 
  Square,
  RefreshCw
} from 'lucide-react';

export default function VoiceAssistantModal({ isOpen, onClose, onNavigate }) {
  const { lang, setLang, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const [selectedLang, setSelectedLang] = useState(lang || 'mr');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [audioError, setAudioError] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [typedQuery, setTypedQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeModel, setActiveModel] = useState('');
  const [detectedBadge, setDetectedBadge] = useState('');

  const messagesEndRef = useRef(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Sync language with app state
  useEffect(() => {
    if (lang) setSelectedLang(lang);
  }, [lang]);

  useEffect(() => {
    const unsubscribe = audioService.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setActiveSpeakingMsgId(null);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll chat history smoothly
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      audioService.stopListening();
      audioService.stopSpeaking();
      sarvamService.stop();
      setIsListening(false);
      setIsThinking(false);
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
      setTranscript('');
      setErrorMsg('');
      setAudioError(null);
      setTypedQuery('');
      setDetectedBadge('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Handle Mic Button Tap:
   * 1. If speaking -> Stop speech
   * 2. If listening -> Stop listening
   * 3. If idle -> Start listening in current language
   */
  const handleMicToggle = () => {
    setErrorMsg('');

    if (isSpeaking) {
      audioService.stopSpeaking();
      sarvamService.stop();
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
      return;
    }

    if (isThinking) {
      return;
    }

    if (isListening) {
      audioService.stopListening();
      setIsListening(false);
      return;
    }

    setTranscript('');
    setAudioError(null);
    setIsListening(true);

    audioService.startListening({
      language: selectedLang,
      onResult: (text) => {
        setIsListening(false);
        setTranscript(text);
        processUserQuery(text);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg(
          selectedLang === 'mr' ? 'मायक्रोफोन परवानगी आवश्यक आहे किंवा आवाज आढळला नाही.' :
          selectedLang === 'hi' ? 'माइक्रोफ़ोन अनुमति आवश्यक है अथवा आवाज़ प्राप्त नहीं हुई।' :
          'Microphone permission needed or no audio input detected.'
        );
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleStopSpeaking = () => {
    audioService.stopSpeaking();
    sarvamService.stop();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
  };

  /**
   * Play speech audio (Sarvam base64 or browser synth) without premature timeouts or page skipping
   */
  const playAssistantSpeech = (audioBase64, textToSpeak, langForSpeech, msgId) => {
    audioService.stopSpeaking();
    sarvamService.stop();
    setIsSpeaking(true);
    setActiveSpeakingMsgId(msgId);

    if (audioBase64) {
      sarvamService.playBase64(
        audioBase64,
        () => {
          setIsSpeaking(true);
          setActiveSpeakingMsgId(msgId);
        },
        () => {
          setIsSpeaking(false);
          setActiveSpeakingMsgId(null);
        },
        (err) => {
          console.warn('Sarvam audio playback failed, falling back to browser speech:', err);
          setIsSpeaking(false);
          setActiveSpeakingMsgId(null);
          // Browser synth fallback
          audioService.speakWithBrowserSynth(
            textToSpeak,
            langForSpeech,
            null,
            () => {
              setIsSpeaking(true);
              setActiveSpeakingMsgId(msgId);
            },
            () => {
              setIsSpeaking(false);
              setActiveSpeakingMsgId(null);
            }
          );
        }
      );
    } else {
      // Browser synth
      audioService.speakWithBrowserSynth(
        textToSpeak,
        langForSpeech,
        null,
        () => {
          setIsSpeaking(true);
          setActiveSpeakingMsgId(msgId);
        },
        () => {
          setIsSpeaking(false);
          setActiveSpeakingMsgId(null);
        }
      );
    }
  };

  /**
   * Process Natural Language Query with Language Auto-Detection
   */
  const processUserQuery = async (queryText) => {
    const cleanText = String(queryText || '').trim();
    if (!cleanText) return;

    audioService.stopSpeaking();
    sarvamService.stop();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
    setAudioError(null);
    setErrorMsg('');
    setIsThinking(true);

    // Auto-detect language of user query
    const autoLang = detectLanguage(cleanText, selectedLang);
    if (autoLang && autoLang !== selectedLang) {
      setSelectedLang(autoLang);
      const label = autoLang === 'mr' ? 'मराठी' : autoLang === 'hi' ? 'हिंदी' : 'English';
      setDetectedBadge(autoLang === 'mr' ? `भाषा: ${label}` : autoLang === 'hi' ? `भाषा: ${label}` : `Language: ${label}`);
      if (changeLanguage) changeLanguage(autoLang);
      else if (setLang) setLang(autoLang);
    }

    // Add user message to history
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: cleanText,
      lang: autoLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    try {
      const res = await assistantService.sendMessage({
        message: cleanText,
        language: autoLang,
        history: messages,
        generateAudio: true
      });

      setIsThinking(false);
      if (res.model) setActiveModel(res.model);

      // Verify detected reply language
      const replyLang = res.detectedLanguage || detectLanguage(res.reply, autoLang);
      if (replyLang && replyLang !== selectedLang) {
        setSelectedLang(replyLang);
      }

      const botMsgId = Date.now() + 1;
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        text: res.reply,
        action: res.action,
        audioBase64: res.audioBase64,
        lang: replyLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updatedHistory, botMsg]);

      // Play audio cleanly without interrupting speech or jumping pages!
      playAssistantSpeech(res.audioBase64, res.reply, replyLang, botMsgId);

    } catch (err) {
      setIsThinking(false);
      setErrorMsg(
        err.message || 
        (selectedLang === 'mr' ? 'असिस्टंटशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.' : 
         selectedLang === 'hi' ? 'सहायक से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।' : 
         'Failed to connect to assistant. Please try again.')
      );
    }
  };

  /**
   * Execute Action: Runs only when farmer explicitly clicks the action button!
   * No premature auto-navigation cutting off voice!
   */
  const executeAction = (actionId) => {
    audioService.stopSpeaking();
    sarvamService.stop();
    audioService.stopListening();
    onClose();

    if (!actionId) return;

    if (actionId === 'change_lang_mr') {
      setSelectedLang('mr');
      if (changeLanguage) changeLanguage('mr');
      else if (setLang) setLang('mr');
      return;
    }
    if (actionId === 'change_lang_hi') {
      setSelectedLang('hi');
      if (changeLanguage) changeLanguage('hi');
      else if (setLang) setLang('hi');
      return;
    }
    if (actionId === 'change_lang_en') {
      setSelectedLang('en');
      if (changeLanguage) changeLanguage('en');
      else if (setLang) setLang('en');
      return;
    }

    if (actionId === 'open_location_modal') {
      window.dispatchEvent(new CustomEvent('shet_open_location_modal'));
      return;
    }

    if (actionId === 'action_logout') {
      if (logout) logout();
      if (onNavigate) onNavigate('landing');
      return;
    }

    if (actionId.startsWith('filter_supplier_')) {
      const category = actionId.replace('filter_supplier_', '');
      window.dispatchEvent(new CustomEvent('shet_filter_supplier', { detail: category }));
      if (onNavigate) onNavigate('suppliers');
      return;
    }

    if (actionId.startsWith('navigate_weather_city_')) {
      const city = actionId.replace('navigate_weather_city_', '');
      window.dispatchEvent(new CustomEvent('shet_select_weather_city', { detail: city }));
      if (onNavigate) onNavigate('weather');
      return;
    }

    if (onNavigate) {
      if (actionId === 'navigate_weather') onNavigate('weather');
      else if (actionId === 'navigate_suppliers') onNavigate('suppliers');
      else if (actionId === 'navigate_diagnosis') onNavigate('diagnosis');
      else if (actionId === 'navigate_3dfarm') onNavigate('3dfarm');
      else if (actionId === 'navigate_dashboard') onNavigate('dashboard');
      else if (actionId === 'navigate_profile') onNavigate('profile');
      else if (actionId === 'navigate_auth') onNavigate('auth');
    }
  };

  const getActionLabel = (actionId, currentLang) => {
    if (!actionId) return null;
    if (actionId === 'navigate_weather') {
      return currentLang === 'mr' ? '🌤️ हवामान पेज उघडा' : currentLang === 'hi' ? '🌤️ मौसम पेज खोलें' : '🌤️ Open Weather Page';
    }
    if (actionId === 'navigate_diagnosis') {
      return currentLang === 'mr' ? '🌿 AI पीक रोग निदान उघडा' : currentLang === 'hi' ? '🌿 AI फसल रोग निदान खोलें' : '🌿 Open Crop Diagnosis';
    }
    if (actionId === 'navigate_3dfarm') {
      return currentLang === 'mr' ? '🚜 ३D शेत सिम्युलेटर उघडा' : currentLang === 'hi' ? '🚜 ३D खेत सिमुलेटर खोलें' : '🚜 Open 3D Farm Simulator';
    }
    if (actionId === 'navigate_suppliers') {
      return currentLang === 'mr' ? '📍 जवळची कृषी दुकाने पहा' : currentLang === 'hi' ? '📍 नजदीकी कृषि दुकानें देखें' : '📍 View Nearby Agri Stores';
    }
    if (actionId === 'open_location_modal') {
      return currentLang === 'mr' ? '📍 तुमचे गाव/स्थान बदला' : currentLang === 'hi' ? '📍 स्थान बदलें' : '📍 Change Location';
    }
    return currentLang === 'mr' ? 'संबंधित पेज उघडा ➜' : currentLang === 'hi' ? 'संबंधित पेज खोलें ➜' : 'Open Page ➜';
  };

  const presets = {
    mr: [
      "टोमॅटोवरील करपा रोगाची लक्षणे व उपाय काय आहेत?",
      "आज संध्याकाळी फवारणीसाठी हवामान कसे आहे?",
      "AI पीक रोग निदान उघडा",
      "कांद्यावरील जांभळा करपा कसा नियंत्रित करावा?",
      "३D शेत सिम्युलेटर उघडा",
      "जवळची कृषी खत व कीटकनाशक दुकाने दाखवा"
    ],
    hi: [
      "टमाटर में झुलसा रोग के लक्षण व सही उपचार क्या हैं?",
      "आज शाम क्या कीटनाशक छिड़काव के लिए मौसम सही है?",
      "AI फसल रोग निदान खोलें",
      "कपास में गुलाबी सुंडी नियंत्रण के उपाय बताएं?",
      "३D खेत सिमुलेटर खोलें",
      "नजदीकी कृषि दुकानें दिखाएं"
    ],
    en: [
      "What are the symptoms and treatments for Tomato Early Blight?",
      "Is today optimal for pesticide spraying?",
      "Open AI crop disease diagnosis",
      "How to control Pink Bollworm in cotton?",
      "Open interactive 3D farm simulator",
      "Show nearby agricultural suppliers"
    ]
  };

  const modalNode = (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 18, 12, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '12px'
    }}>
      <div 
        className="voice-assistant-modal-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          height: '88vh',
          maxHeight: '740px',
          backgroundColor: 'var(--color-card-surface)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-floating)',
          border: '1.5px solid var(--border-light)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* Modal Top Bar */}
        <div style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, var(--color-deep-forest), #164630)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-soft-lime)',
              color: '#10251D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Mic size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.02rem', margin: 0, fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedLang === 'mr' ? 'शेत समर्थन सहाय्यक' : selectedLang === 'hi' ? 'खेत समर्थन सहायक' : 'Shet Samarth Assistant'}
                </h3>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'var(--color-soft-lime)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  AI Voice
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.82)', display: 'block' }}>
                {detectedBadge || (selectedLang === 'mr' ? 'मराठी / हिन्दी / English स्वयं-ओळख' : selectedLang === 'hi' ? 'हिंदी / मराठी / English स्वतः पहचान' : 'Auto detects Marathi, Hindi & English')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Switcher in Header */}
            <div style={{ display: 'flex', gap: '3px', backgroundColor: 'rgba(255,255,255,0.12)', padding: '2px', borderRadius: '18px' }}>
              {[
                { id: 'mr', label: 'मराठी' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'en', label: 'EN' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedLang(item.id);
                    if (changeLanguage) changeLanguage(item.id);
                    else if (setLang) setLang(item.id);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    border: 'none',
                    backgroundColor: selectedLang === item.id ? 'var(--color-soft-lime)' : 'transparent',
                    color: selectedLang === item.id ? '#10251D' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Close Button Only - Delete Button Removed as Requested */}
            <button
              onClick={() => {
                audioService.stopListening();
                audioService.stopSpeaking();
                sarvamService.stop();
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stable Voice Controller (Fixed Reserved Height: 110px - Never Shifts Layout on Phone) */}
        <div style={{
          height: '110px',
          minHeight: '110px',
          maxHeight: '110px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-soft-surface)',
          borderBottom: '1px solid var(--border-light)',
          flexShrink: 0,
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={isThinking}
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: isSpeaking ? '#DC2626' : isThinking ? '#F59E0B' : isListening ? '#EF4444' : 'var(--color-primary-green)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: isListening 
                ? '0 0 0 8px rgba(239, 68, 68, 0.25), 0 0 0 16px rgba(239, 68, 68, 0.12)' 
                : isSpeaking
                ? '0 0 0 8px rgba(220, 38, 38, 0.2)'
                : isThinking
                ? '0 0 0 8px rgba(245, 158, 11, 0.25)'
                : '0 6px 18px rgba(47, 125, 74, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isThinking ? 'wait' : 'pointer',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
            }}
            title={isSpeaking ? "बोलणे थांबवा" : isListening ? "ऐकणे थांबवा" : isThinking ? "AI विचार करत आहे..." : "बोलण्यासाठी टॅप करा"}
          >
            {isSpeaking ? (
              <Square size={22} fill="#FFFFFF" />
            ) : isThinking ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : isListening ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
          </button>

          {/* Reserved Height Status Label - Keeps UI stable */}
          <div style={{ height: '22px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: isSpeaking ? '#DC2626' : isThinking ? '#D97706' : isListening ? '#EF4444' : 'var(--text-primary)' 
            }}>
              {isSpeaking 
                ? (selectedLang === 'mr' ? '🔊 बोलत आहे... थांबवण्यासाठी टॅप करा' : selectedLang === 'hi' ? '🔊 बोल रहा हूँ... रोकने के लिए टैप करें' : '🔊 Speaking... tap to stop')
                : isThinking
                ? (selectedLang === 'mr' ? '🧠 विचार करत आहे...' : selectedLang === 'hi' ? '🧠 विचार कर रहा हूँ...' : '🧠 AI Thinking...')
                : isListening 
                ? (selectedLang === 'mr' ? '🎙️ ऐकत आहे... आता बोला' : selectedLang === 'hi' ? '🎙️ सुन रहा हूँ... बोलिए' : '🎙️ Listening... speak now')
                : (selectedLang === 'mr' ? 'बोलण्यासाठी टॅप करा (मराठी/हिंदी/EN)' : selectedLang === 'hi' ? 'बोलने के लिए टैप करें (हिंदी/मराठी/EN)' : 'Tap to speak (Auto-detects language)')}
            </span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--semantic-error)',
            padding: '6px 14px',
            fontSize: '0.74rem',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            flexShrink: 0
          }}>
            {errorMsg}
          </div>
        )}

        {/* Conversation Stream - Fills Middle Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '12px 14px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '16px'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Sparkles size={22} color="var(--color-primary-green)" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {selectedLang === 'mr' ? 'शेतकरी मित्र, विचारा काहीही!' : selectedLang === 'hi' ? 'किसान मित्र, कुछ भी पूछें!' : 'Farmer Friend, Ask Anything!'}
              </h4>
              <p style={{ fontSize: '0.78rem', margin: 0, maxWidth: '320px', lineHeight: 1.45 }}>
                {selectedLang === 'mr' 
                  ? 'मराठी, हिंदी किंवा इंग्रजीमध्ये बोला. पिकांचे रोग, हवामान, खते किंवा पानांचे फोटो यावर अचूक मार्गदर्शन मिळेल.' 
                  : selectedLang === 'hi' 
                  ? 'हिंदी, मराठी या अंग्रेजी में बोलें। फसल रोग, मौसम, खाद या कृषि योजनाओं पर सटीक सलाह पाएं।' 
                  : 'Speak in Marathi, Hindi, or English. Get instant advice on crop diseases, weather, spraying, and market prices.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary-green)' : 'var(--color-card-surface)',
                  color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  fontSize: '0.84rem',
                  lineHeight: 1.52
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      marginBottom: '6px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-green)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} /> {selectedLang === 'mr' ? 'शेत समर्थन सहाय्यक' : 'Shet Samarth Assistant'}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSpeaking && activeSpeakingMsgId === msg.id ? (
                          <button
                            onClick={handleStopSpeaking}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              color: '#DC2626',
                              background: 'rgba(220, 38, 38, 0.1)',
                              border: '1px solid rgba(220, 38, 38, 0.25)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            <Square size={10} fill="#DC2626" />
                            <span>{selectedLang === 'mr' ? 'थांबवा' : 'Stop'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => playAssistantSpeech(msg.audioBase64, msg.text, msg.lang || selectedLang, msg.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              color: 'var(--color-primary-green)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            title="पुन्हा ऐका (Replay Audio)"
                          >
                            <Volume2 size={13} />
                            <span>{selectedLang === 'mr' ? 'ऐका' : 'Listen'}</span>
                          </button>
                        )}
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>

                  {/* Clean Interactive Action Button: Farmer taps to navigate; NO surprise jumps or cut off voice */}
                  {msg.action && getActionLabel(msg.action, selectedLang) && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                      <button
                        type="button"
                        onClick={() => executeAction(msg.action)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px'
                        }}
                      >
                        <span>{getActionLabel(msg.action, selectedLang)}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Persistent Pre-made Questions (Horizontal Pill Carousel - Never Disappears, Always Accessible!) */}
        <div style={{
          padding: '8px 14px',
          backgroundColor: 'var(--color-soft-surface)',
          borderTop: '1px solid var(--border-light)',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              {selectedLang === 'mr' ? '💡 विचारू शकता (टॅप करा):' : selectedLang === 'hi' ? '💡 पूछ सकते हैं (टैप करें):' : '💡 Suggested questions (tap):'}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-primary-green)' }}>
              {selectedLang === 'mr' ? 'बाजूला सरकवा ➔' : selectedLang === 'hi' ? 'स्क्रॉल करें ➔' : 'scroll ➔'}
            </span>
          </div>

          <div 
            className="preset-pills-scroll"
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '3px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {(presets[selectedLang] || presets.mr).map((question, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isThinking}
                onClick={() => {
                  setTranscript(question);
                  processUserQuery(question);
                }}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '5px 11px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-card-surface)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.74rem',
                  color: 'var(--text-primary)',
                  cursor: isThinking ? 'wait' : 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary-green)';
                  e.currentTarget.style.backgroundColor = 'var(--semantic-ai-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.backgroundColor = 'var(--color-card-surface)';
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Stable Bottom Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (typedQuery.trim() && !isThinking) {
              setTranscript(typedQuery);
              processUserQuery(typedQuery);
              setTypedQuery('');
            }
          }}
          style={{
            padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))',
            backgroundColor: 'var(--color-card-surface)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <input
            type="text"
            value={typedQuery}
            onChange={(e) => setTypedQuery(e.target.value)}
            disabled={isThinking}
            placeholder={
              selectedLang === 'mr' ? 'किंवा प्रश्न टाईप करा (उदा. टोमॅटो करपा, फवारणी वेळ...)' :
              selectedLang === 'hi' ? 'या प्रश्न लिखें (उदा. टमाटर झुलसा, छिड़काव समय...)' :
              'Or type your question (e.g. Tomato blight, spraying time...)'
            }
            className="form-control"
            style={{ 
              flex: 1, 
              fontSize: '0.82rem',
              padding: '8px 12px',
              borderRadius: '12px'
            }}
          />
          <button
            type="submit"
            disabled={isThinking || !typedQuery.trim()}
            className="btn btn-primary"
            style={{ 
              padding: '8px 14px', 
              fontSize: '0.80rem', 
              whiteSpace: 'nowrap',
              borderRadius: '12px'
            }}
          >
            {isThinking ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              selectedLang === 'mr' ? 'विचार' : selectedLang === 'hi' ? 'पूछें' : 'Send'
            )}
          </button>
        </form>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
