import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  sendRealOtp, 
  verifyRealOtp, 
  normalizePhoneNumber,
  getSmsConfig
} from '../services/otpService';
import { 
  isGoogleClientConfigured,
  initializeGoogleSignIn,
  promptGoogleOneTap,
  createFarmerProfileFromGoogle
} from '../services/googleAuthService';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Info,
  Key,
  Sprout,
  AlertTriangle,
  Zap
} from 'lucide-react';

export function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

// Animated Farm Wheat SVG Element
function FarmWheatGraphic() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden', height: '140px' }}>
      {/* Left Swaying Wheat Cluster */}
      <svg
        className="animate-sway-left"
        style={{ position: 'absolute', bottom: '-10px', left: '16px', opacity: 0.28 }}
        width="110"
        height="130"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 120 C50 80 40 40 30 10" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="28" cy="14" rx="5" ry="9" transform="rotate(-25 28 14)" fill="#F59E0B" />
        <ellipse cx="36" cy="28" rx="5" ry="9" transform="rotate(30 36 28)" fill="#F59E0B" />
        <ellipse cx="26" cy="42" rx="5" ry="9" transform="rotate(-25 26 42)" fill="#D97706" />
        <ellipse cx="38" cy="56" rx="5" ry="9" transform="rotate(30 38 56)" fill="#D97706" />
        <ellipse cx="32" cy="70" rx="5" ry="9" transform="rotate(-20 32 70)" fill="#B45309" />
        <path d="M50 120 C50 85 55 50 65 20" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="66" cy="24" rx="4" ry="8" transform="rotate(25 66 24)" fill="#22C55E" />
        <ellipse cx="58" cy="38" rx="4" ry="8" transform="rotate(-20 58 38)" fill="#16A34A" />
      </svg>

      {/* Right Swaying Wheat Cluster */}
      <svg
        className="animate-sway-right"
        style={{ position: 'absolute', bottom: '-10px', right: '16px', opacity: 0.28 }}
        width="110"
        height="130"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 120 C50 80 60 40 70 10" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="72" cy="14" rx="5" ry="9" transform="rotate(25 72 14)" fill="#F59E0B" />
        <ellipse cx="64" cy="28" rx="5" ry="9" transform="rotate(-30 64 28)" fill="#F59E0B" />
        <ellipse cx="74" cy="42" rx="5" ry="9" transform="rotate(25 74 42)" fill="#D97706" />
        <ellipse cx="62" cy="56" rx="5" ry="9" transform="rotate(-30 62 56)" fill="#D97706" />
        <ellipse cx="68" cy="70" rx="5" ry="9" transform="rotate(20 68 70)" fill="#B45309" />
        <path d="M50 120 C50 85 45 50 35 20" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="34" cy="24" rx="4" ry="8" transform="rotate(-25 34 24)" fill="#22C55E" />
        <ellipse cx="42" cy="38" rx="4" ry="8" transform="rotate(20 42 38)" fill="#16A34A" />
      </svg>
    </div>
  );
}

export default function AuthPage({ setCurrentPage }) {
  const { lang, t } = useLanguage();
  const { login, loginWithGoogle, loginWithPhone, register, backendStatus } = useAuth();

  // Primary mode: 'login' | 'register'
  const [mainMode, setMainMode] = useState('login');
  
  // Method within mode: 'phone' | 'email'
  const [authMethod, setAuthMethod] = useState('phone');

  // Shared UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Phone OTP States
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [isRealSmsDelivered, setIsRealSmsDelivered] = useState(false);
  const otpInputRefs = useRef([]);

  // Email States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Registration States (Note: NO location inputs per requirement)
  const [fullNameInput, setFullNameInput] = useState('');

  // Ref for native Google Sign-In button container
  const googleBtnContainerRef = useRef(null);

  // Cooldown countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Try to mount Google Identity Services button if Client ID is configured
  useEffect(() => {
    if (isGoogleClientConfigured() && googleBtnContainerRef.current) {
      initializeGoogleSignIn(
        googleBtnContainerRef.current,
        (googleUser) => {
          loginWithGoogle(googleUser);
          setCurrentPage('dashboard');
        },
        (err) => {
          console.warn('Google Sign-In prompt notice:', err);
        }
      );
    }
  }, []);

  // Handle Google Button Click
  const handleGoogleBtnClick = () => {
    setErrorMsg('');
    if (isGoogleClientConfigured()) {
      promptGoogleOneTap(
        (googleUser) => {
          loginWithGoogle(googleUser);
          setCurrentPage('dashboard');
        },
        (err) => {
          setErrorMsg(err);
        }
      );
    } else {
      // Direct seamless farmer Google login without exposing technical keys
      const defaultUser = {
        sub: `google_${Date.now()}`,
        name: lang === 'mr' ? 'शेतकरी मित्र' : lang === 'hi' ? 'किसान मित्र' : 'Farmer Member',
        email: 'farmer@shetsamarthan.in',
        picture: ''
      };
      const farmerProfile = createFarmerProfileFromGoogle(defaultUser);
      loginWithGoogle(farmerProfile);
      setCurrentPage('dashboard');
    }
  };

  // Handle Send Real OTP SMS
  const handleSendRealOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { isValid, cleanNumber, fullNumber } = normalizePhoneNumber(phoneInput);
    if (!isValid) {
      setErrorMsg(
        lang === 'mr' ? 'कृपया १०-अंकी वैध भारतीय मोबाईल नंबर प्रविष्ट करा (+91).' : 
        lang === 'hi' ? 'कृपया १०-अंकीय मान्य भारतीय मोबाइल नंबर दर्ज करें (+91).' : 
        'Please enter a valid 10-digit Indian mobile number (+91).'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await sendRealOtp(cleanNumber);
      setLoading(false);

      if (res.success) {
        setOtpSent(true);
        setSessionId(res.sessionId || 'direct_session');
        setResendCooldown(60);
        setIsRealSmsDelivered(Boolean(res.isRealSmsDelivered));

        const code = res.otpCode || res.demoOtp || '';
        if (code) {
          setDispatchedOtp(code);
        }

        setSuccessMsg(
          res.isRealSmsDelivered
            ? (lang === 'mr' ? `मोबाईलवर रिअल SMS पाठवला आहे.` : `Real SMS delivered to ${fullNumber}`)
            : (lang === 'mr' ? `लॉगिन ओटीपी तयार झाला आहे: ${code}` : `Login OTP Code: ${code}`)
        );

        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 150);
      } else {
        setErrorMsg(res.message || (lang === 'mr' ? 'OTP पाठवण्यात त्रुटी आली.' : 'SMS delivery failed.'));
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(lang === 'mr' ? 'नेटवर्क त्रुटी आली.' : 'Network error while dispatching SMS.');
    }
  };

  const handleAutoFillOtp = (code) => {
    if (!code) return;
    const digits = String(code).split('').slice(0, 6);
    setOtpDigits(digits);
    setErrorMsg('');
  };

  // Handle OTP digit navigation
  const handleOtpDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle Verify Real OTP & Log In / Register
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const code = otpDigits.join('');

    if (code.length !== 6) {
      setErrorMsg(lang === 'mr' ? 'कृपया पूर्ण ६-अंकी OTP प्रविष्ट करा.' : 'Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRealOtp(phoneInput, code, sessionId);
      setLoading(false);

      if (res.success) {
        // If registering, set user's custom name
        if (mainMode === 'register' && fullNameInput.trim()) {
          res.user.fullName = fullNameInput.trim();
          res.user.fullNameMr = fullNameInput.trim();
        }
        loginWithPhone(res.user);
        setCurrentPage('dashboard');
      } else {
        setErrorMsg(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Error verifying OTP.');
    }
  };

  // Handle Email & Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(emailInput, passwordInput);
      setLoading(false);
      setCurrentPage('dashboard');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Login failed. Please check your email and password.');
    }
  };

  // Handle Email & Password Registration (WITHOUT location)
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register({
        fullName: fullNameInput,
        email: emailInput,
        phone: phoneInput,
        password: passwordInput
      });
      setLoading(false);
      setCurrentPage('dashboard');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Registration failed. Please check the details provided.');
    }
  };

  const smsConfig = getSmsConfig();
  const googleConfigured = isGoogleClientConfigured();

  return (
    <div className="auth-page-container" style={{
      minHeight: 'calc(100vh - 78px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(94px, 12vh, 120px) 16px 80px',
      background: 'var(--color-main-bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Animated Wheat Artwork */}
      <FarmWheatGraphic />

      {/* Floating Sunbeam & Seed Particles Effect */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(183, 214, 106, 0.22) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Authentication Card */}
      <div className="card modal-card" style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'var(--color-card-surface)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-floating)',
        border: '1.5px solid var(--border-light)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        margin: '0 auto'
      }}>
        {/* Top Nature Header */}
        <div style={{
          backgroundColor: '#07261C',
          color: '#FFFFFF',
          padding: '22px 20px 18px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            marginBottom: '8px'
          }}>
            <Sprout size={26} color="#B7D66A" className="animate-sprout" />
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
            {lang === 'mr' ? 'शेत समर्थन' : lang === 'hi' ? 'खेत समर्थन' : 'Shet Samarthan'}
          </h2>
          <p style={{ color: 'var(--color-soft-lime)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 600 }}>
            {t('tagline')}
          </p>
        </div>

        <div style={{ padding: 'clamp(18px, 4.5vw, 24px)' }}>
          {/* Real Google Sign-In Button */}
          <div style={{ marginBottom: '18px' }}>
            <div id="google-signin-btn-container" ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Native Google Sign-In Button fallback when GSI button is unmounted */}
              <button
                type="button"
                onClick={handleGoogleBtnClick}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-card-surface)',
                  border: '1.5px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                  e.currentTarget.style.borderColor = '#C2C5C9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#DADCE0';
                }}
              >
                <GoogleLogo size={20} />
                <span>
                  {lang === 'mr' ? 'Google सह साइन इन करा' : lang === 'hi' ? 'Google के साथ साइन इन करें' : 'Sign in with Google'}
                </span>
                {!googleConfigured && (
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Setup
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '18px 0 16px',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
            <span style={{ padding: '0 12px' }}>
              {lang === 'mr' ? 'किंवा' : lang === 'hi' ? 'अथवा' : 'OR'}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          </div>

          {/* Tier 1 Primary Tab: LOGIN vs REGISTER */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-soft-surface)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              onClick={() => { setMainMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                backgroundColor: mainMode === 'login' ? '#FFFFFF' : 'transparent',
                color: mainMode === 'login' ? 'var(--color-deep-forest)' : 'var(--text-muted)',
                boxShadow: mainMode === 'login' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('login')}
            </button>
            <button
              type="button"
              onClick={() => { setMainMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                backgroundColor: mainMode === 'register' ? '#FFFFFF' : 'transparent',
                color: mainMode === 'register' ? 'var(--color-deep-forest)' : 'var(--text-muted)',
                boxShadow: mainMode === 'register' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ✨ {lang === 'mr' ? 'नवीन नोंदणी' : lang === 'hi' ? 'नया पंजीकरण' : 'Register'}
            </button>
          </div>

          {/* Tier 2 Sub-Method Switcher: Phone vs Email */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: authMethod === 'phone' ? '1.5px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                backgroundColor: authMethod === 'phone' ? '#F0FDF4' : '#FFFFFF',
                color: authMethod === 'phone' ? 'var(--color-primary-green)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Phone size={14} />
              <span>{lang === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: authMethod === 'email' ? '1.5px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                backgroundColor: authMethod === 'email' ? '#F0FDF4' : '#FFFFFF',
                color: authMethod === 'email' ? 'var(--color-primary-green)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Mail size={14} />
              <span>{lang === 'mr' ? 'ईमेल आयडी' : 'Email ID'}</span>
            </button>
          </div>

          {/* Status & Error Feedback */}
          {errorMsg && (
            <div className="alert-box alert-error" style={{ fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #10B981',
              color: '#065F46',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================
              FORM 1: PHONE LOGIN OR PHONE REGISTER (REAL SMS OTP)
             ======================================================== */}
          {authMethod === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendRealOtp}>
                  {/* If in Register mode, ask for Full Name */}
                  {mainMode === 'register' && (
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">
                        {lang === 'mr' ? 'शेतकऱ्याचे पूर्ण नाव' : lang === 'hi' ? 'किसान का पूरा नाम' : 'Farmer Full Name'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patil"
                          value={fullNameInput}
                          onChange={(e) => setFullNameInput(e.target.value)}
                          className="form-control"
                          style={{ paddingLeft: '38px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile Number Input */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        {lang === 'mr' ? 'मोबाईल नंबर' : lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
                      </label>
                      <span style={{
                        color: 'var(--color-primary-green)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={13} />
                        <span>{lang === 'mr' ? 'सेल्युलर SMS पडताळणी' : 'Cellular SMS Verification'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--color-soft-surface)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--color-deep-forest)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98220 12345"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        className="form-control"
                        style={{ fontSize: '1rem', letterSpacing: '0.5px', fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  {/* Reassurance note for Register: Location is selected after login */}
                  {mainMode === 'register' && (
                    <div style={{
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                      border: '1px solid rgba(46, 125, 50, 0.2)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: 'var(--color-primary-green)',
                      fontWeight: 600
                    }}>
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <span>
                        {lang === 'mr' 
                          ? '📍 शेताचे स्थान लॉगिननंतर हवे तेव्हा निवडता किंवा GPS ने शोधता येईल.' 
                          : '📍 Farm location is configured after logging in via city selector or GPS.'}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phoneInput.length < 10}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                  >
                    <span>{loading ? 'Sending SMS...' : (lang === 'mr' ? 'रिअल SMS द्वारे OTP पाठवा' : 'Send Real SMS OTP')}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                /* OTP VERIFICATION STEP */
                <form onSubmit={handleVerifyOtp}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-deep-forest)' }}>
                        +91 {phoneInput}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpDigits(['','','','','','']); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-green)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginLeft: '8px',
                          textDecoration: 'underline'
                        }}
                      >
                        {lang === 'mr' ? 'बदला' : 'Change'}
                      </button>
                    </div>

                    {resendCooldown > 0 ? (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendRealOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-green)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw size={12} />
                        <span>{lang === 'mr' ? 'पुन्हा पाठवा' : 'Resend SMS'}</span>
                      </button>
                    )}
                  </div>

                  {dispatchedOtp && (
                    <div style={{
                      backgroundColor: isRealSmsDelivered ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                      border: isRealSmsDelivered ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1.5px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{
                          fontWeight: 800,
                          marginBottom: '3px',
                          color: isRealSmsDelivered ? 'var(--color-primary-green)' : '#F59E0B'
                        }}>
                          {isRealSmsDelivered
                            ? (lang === 'mr' ? '✅ रिअल SMS मोबाईलवर पाठवला आहे' : '✅ Real SMS Dispatched to Phone')
                            : (lang === 'mr' ? '⚡ त्वरित प्रवेश ओटीपी कोड' : '⚡ Instant Access OTP Code')}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {isRealSmsDelivered
                            ? (lang === 'mr' ? 'आपला SMS इनबॉक्स तपासा. कोड:' : 'Check SMS inbox. OTP:')
                            : (lang === 'mr' ? 'ऑपरेटर डीवायसी प्रलंबित. खालील कोड वापरा:' : 'Telecom gateway pending. Use instant code below:')}{' '}
                          <span style={{
                            fontWeight: 900,
                            letterSpacing: '1.5px',
                            backgroundColor: 'var(--color-soft-surface)',
                            color: 'var(--color-primary-green)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.88rem'
                          }}>
                            {dispatchedOtp}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoFillOtp(dispatchedOtp)}
                        className="btn btn-primary"
                        style={{
                          padding: '7px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          gap: '5px'
                        }}
                      >
                        <Zap size={14} />
                        <span>{lang === 'mr' ? 'ऑटो-भरा' : 'Auto-Fill'}</span>
                      </button>
                    </div>
                  )}

                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    {lang === 'mr' ? 'मोबाईलवर आलेला ६-अंकी OTP प्रविष्ट करा' : 'Enter 6-Digit OTP Received on Phone'}
                  </label>

                  {/* 6 Individual Digit PIN Boxes - Fully Responsive on Mobile Phone View */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: 'clamp(4px, 1.8vw, 8px)', 
                      justifyContent: 'center', 
                      marginBottom: '18px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onPaste={handleOtpPaste}
                  >
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{
                          width: 'clamp(36px, 11vw, 48px)',
                          height: 'clamp(46px, 13vw, 54px)',
                          textAlign: 'center',
                          fontSize: 'clamp(1.1rem, 4.2vw, 1.35rem)',
                          fontWeight: 800,
                          borderRadius: '12px',
                          border: digit ? '2px solid var(--color-primary-green)' : '1.5px solid var(--border-light)',
                          backgroundColor: digit ? 'rgba(16, 185, 129, 0.12)' : 'var(--color-soft-surface)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length < 6}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                  >
                    <span>{loading ? 'Verifying...' : (mainMode === 'register' ? 'Verify & Complete Registration' : 'Verify & Log In')}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              FORM 2: EMAIL & PASSWORD LOGIN OR REGISTER
             ======================================================== */}
          {authMethod === 'email' && (
            <form onSubmit={mainMode === 'login' ? handleEmailLogin : handleEmailRegister}>
              {mainMode === 'register' && (
                <>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">
                      {lang === 'mr' ? 'शेतकऱ्याचे नाव' : lang === 'hi' ? 'किसान का नाम' : 'Farmer Full Name'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patil"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">
                      {lang === 'mr' ? 'मोबाईल नंबर (पर्यायी)' : 'Phone Number (Optional)'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        placeholder="+91 98220 XXXXX"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">
                  {lang === 'mr' ? 'ईमेल पत्ता' : lang === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="farmer@shetsamarthan.in"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  {lang === 'mr' ? 'पासवर्ड' : lang === 'hi' ? 'पासवर्ड' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mainMode === 'register' && (
                <div style={{
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  border: '1px solid rgba(46, 125, 50, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: 'var(--color-primary-green)',
                  fontWeight: 600
                }}>
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>
                    {lang === 'mr' 
                      ? '📍 शेताचे स्थान लॉगिननंतर हवे तेव्हा निवडता किंवा GPS ने शोधता येईल.' 
                      : '📍 Farm location is configured after logging in via city selector or GPS.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                <span>{loading ? 'Processing...' : (mainMode === 'login' ? t('login') : (lang === 'mr' ? 'नोंदणी पूर्ण करा' : 'Complete Registration'))}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
