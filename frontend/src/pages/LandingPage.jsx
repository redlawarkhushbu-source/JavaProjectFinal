import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLeafLogo, TiltedLeafIcon } from '../components/Navbar';
import { api, MOCK_WEATHER_DATA } from '../services/api';
import { 
  ScanLine, 
  Box, 
  CloudSun, 
  Store, 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Users,
  MapPin,
  TrendingUp,
  Layers,
  ShieldCheck,
  Compass
} from 'lucide-react';

// 4 Real 3D Icons for Feature Cards on Landing Page
function DiagnosisCardGraphic() {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
      {!imgError ? (
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(47, 125, 74, 0.22)',
          border: '2px solid var(--border-light)',
          backgroundColor: 'var(--color-card-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.22s ease'
        }}>
          <img 
            src="/assets/icon-diagnosis-3d.jpg" 
            alt="AI Crop Diagnosis 3D" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="34" cy="34" r="30" fill="rgba(47, 125, 74, 0.08)" />
          <path d="M18 48C18 48 18 26 36 16C44 11 50 9 50 9C50 9 48 19 40 28C31 38 18 48 18 48Z" fill="#2F7D4A" />
          <path d="M18 48C26 39 36 29 45 17" stroke="#B7D66A" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-card-surface)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-green)',
        border: '1.5px solid var(--border-light)'
      }}>
        <ScanLine size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function Farm3DCardGraphic() {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
      {!imgError ? (
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(59, 130, 196, 0.22)',
          border: '2px solid var(--border-light)',
          backgroundColor: 'var(--color-card-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.22s ease'
        }}>
          <img 
            src="/assets/icon-farm3d-3d.jpg" 
            alt="3D Farm Simulator" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M34 18L58 30L34 42L10 30L34 18Z" fill="#588B41" />
          <path d="M10 30L34 42V52L10 40V30Z" fill="#6B4E32" />
          <path d="M58 30L34 42V52L58 40V30Z" fill="#503822" />
        </svg>
      )}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-card-surface)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-green)',
        border: '1.5px solid var(--border-light)'
      }}>
        <Box size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function WeatherCardGraphic() {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
      {!imgError ? (
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(229, 168, 59, 0.22)',
          border: '2px solid var(--border-light)',
          backgroundColor: 'var(--color-card-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.22s ease'
        }}>
          <img 
            src="/assets/icon-weather-3d.jpg" 
            alt="Weather Insights 3D" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="26" r="15" fill="#FFAE33" />
        </svg>
      )}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-card-surface)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-green)',
        border: '1.5px solid var(--border-light)'
      }}>
        <CloudSun size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function SuppliersCardGraphic() {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
      {!imgError ? (
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(217, 92, 79, 0.22)',
          border: '2px solid var(--border-light)',
          backgroundColor: 'var(--color-card-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.22s ease'
        }}>
          <img 
            src="/assets/icon-suppliers-3d.jpg" 
            alt="Nearby Suppliers 3D" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22L25 17L38 23L51 18V48L38 53L25 47L12 52V22Z" fill="#D4EED1" />
        </svg>
      )}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-card-surface)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary-green)',
        border: '1.5px solid var(--border-light)'
      }}>
        <Store size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export default function LandingPage({ setCurrentPage, onOpenVoice }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [weather, setWeather] = useState(MOCK_WEATHER_DATA);

  useEffect(() => {
    async function loadLandingWeather() {
      const activeLoc = user?.locality 
        ? { city: user?.city || user?.district, locality: user?.locality, lat: user?.lat, lng: user?.lng, location: user?.location }
        : (user?.district || user?.city || user?.location || 'Mumbai');
      const data = await api.getWeather(activeLoc);
      if (data) setWeather(data);
    }
    loadLandingWeather();
  }, [user?.location, user?.district, user?.city, user?.locality]);

  return (
    <div style={{ backgroundColor: 'var(--color-main-bg)', overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} id="top">
      
      {/* =========================================================================
          HERO SECTION — SPACIOUS BREATHING LAYOUT WITH DARK BLACK FADE
          ========================================================================= */}
      <section style={{
        position: 'relative',
        minHeight: '740px',
        padding: '115px 36px 130px',
        backgroundImage: isDark
          ? `linear-gradient(90deg, rgba(4, 15, 10, 0.98) 0%, rgba(4, 15, 10, 0.88) 42%, rgba(4, 15, 10, 0.58) 70%, rgba(4, 15, 10, 0.92) 100%), linear-gradient(to bottom, transparent 65%, #071710 100%), url('/assets/hero-bg.jpg')`
          : `linear-gradient(90deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.54) 36%, rgba(255, 255, 255, 0.0) 62%, transparent 100%), url('/assets/hero-bg.jpg')`,
        backgroundColor: isDark ? '#071710' : '#F6F8F3',
        backgroundPosition: 'center 35%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center'
      }} className="reference-hero-section">
        
        <div style={{
          maxWidth: '1340px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          
          {/* Left Side Content — Expanded Breathing Room */}
          <div style={{ maxWidth: '680px', position: 'relative', zIndex: 10 }}>
            
            {/* Small Green Pill: 🌿 AI-Powered AgriTech Platform */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(14, 36, 27, 0.92)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-light)',
              marginBottom: '24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
            }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-green)',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                {t('heroBadge')}
              </span>
            </div>

            {/* Main Headline: Smarter Farming for a Healthier Tomorrow 🍃 */}
            <h1 className="hero-main-title" style={{
              fontSize: 'clamp(3.15rem, 5.8vw, 4.35rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'var(--color-deep-forest)',
              letterSpacing: '-0.03em',
              marginBottom: '22px'
            }}>
              {t('heroTitlePart1')}<br />
              {t('heroTitlePart2') && t('heroTitlePart2')}
              <span style={{ color: 'var(--color-primary-green)' }}>{t('heroTitleHighlight')}</span><br />
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {t('heroTitlePart3')}
                <TiltedLeafIcon size={38} />
              </span>
            </h1>

            {/* Supporting Paragraph — Generous Breathing Room */}
            <p className="hero-subtext" style={{
              fontSize: '1.12rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '580px',
              marginBottom: '38px',
              fontWeight: 450
            }}>
              {t('heroSubtitle')}
            </p>

            {/* CTA Button: Get Started */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                className="hero-get-started-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: isDark ? '#059669' : 'var(--color-deep-forest)',
                  color: '#FFFFFF',
                  padding: '16px 36px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  boxShadow: isDark ? '0 6px 20px rgba(5, 150, 105, 0.45)' : '0 6px 20px rgba(18, 55, 42, 0.35)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: isDark ? '1.5px solid #10B981' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#10B981' : 'var(--color-primary-green)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#059669' : 'var(--color-deep-forest)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{t('getStarted')}</span>
                <ArrowRight size={20} />
              </button>
            </div>

          </div>

          {/* Right Side: Positioned Floating UI Widgets (Exact Match to AgriVision Mockup) */}
          <div style={{
            position: 'relative',
            width: '620px',
            height: '520px'
          }} className="hero-widgets-desktop-area">
            
            {/* Widget 1: Weather Card (Top Center-Right in Sky) */}
            <div 
              onClick={() => setCurrentPage('weather')}
              style={{
                position: 'absolute',
                top: '15px',
                right: '235px',
                backgroundColor: isDark ? 'rgba(13, 36, 27, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                boxShadow: isDark ? '0 10px 28px rgba(0, 0, 0, 0.4)' : '0 10px 28px rgba(18, 55, 42, 0.12)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: isDark ? '1.5px solid rgba(74, 222, 128, 0.25)' : '1.5px solid rgba(47, 125, 74, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                zIndex: 20
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              title={lang === 'mr' ? 'हवामान तपशील पाहण्यासाठी क्लिक करा' : 'Click to inspect detailed agrometeorology'}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(20, 53, 39, 0.9)' : '#FFF8E7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CloudSun size={26} color={isDark ? '#4ADE80' : '#E5A83B'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)', lineHeight: 1 }}>
                    {weather.temperature}°C
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(20, 53, 39, 0.9)' : (user?.stage === 2 ? '#E8F5E9' : '#E3F2FD'),
                    color: isDark ? '#86EFAC' : (user?.stage === 2 ? '#2E7D32' : '#1565C0'),
                    border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
                    padding: '2px 6px',
                    borderRadius: '8px'
                  }}>
                    📍 {user?.locality ? `${user.locality.split(',')[0].slice(0, 10)}` : (user?.city || user?.district || 'Mumbai')}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: isDark ? '#86EFAC' : 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {lang === 'mr' ? weather.conditionMr : lang === 'hi' ? (weather.conditionHi || weather.condition) : (t('partlyCloudy') || weather.condition)}
                </span>
              </div>
              <div style={{ borderLeft: isDark ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(18, 55, 42, 0.12)', paddingLeft: '14px', lineHeight: 1.35 }}>
                <span style={{ fontSize: '0.70rem', color: isDark ? '#86EFAC' : 'var(--text-muted)', display: 'block' }}>
                  {t('rainChance')}: <strong style={{ color: isDark ? '#4ADE80' : '#0284C7' }}>{weather.rainProbability || 15}%</strong>
                </span>
                <span style={{ fontSize: '0.70rem', color: isDark ? '#86EFAC' : 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {t('humidity')}: <strong style={{ color: isDark ? '#4ADE80' : '#0284C7' }}>{weather.humidity || 68}%</strong>
                </span>
              </div>
            </div>

            {/* Widget 2: Find Nearby Suppliers Preview Map Card (Far Upper Right Sky) */}
            <div 
              onClick={() => setCurrentPage('suppliers')}
              style={{
                position: 'absolute',
                top: '15px',
                right: '10px',
                backgroundColor: isDark ? 'rgba(13, 36, 27, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                boxShadow: isDark ? '0 10px 28px rgba(0, 0, 0, 0.4)' : '0 10px 28px rgba(18, 55, 42, 0.12)',
                padding: '8px',
                border: isDark ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.95)',
                cursor: 'pointer',
                width: '175px',
                transition: 'transform 0.2s ease',
                zIndex: 20
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Mini Map Thumbnail */}
              <div style={{
                height: '76px',
                borderRadius: '10px',
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&auto=format&fit=crop&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(20, 53, 39, 0.85)' : 'rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={20} color={isDark ? '#4ADE80' : '#0284C7'} fill={isDark ? '#4ADE80' : '#0284C7'} />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 4px 2px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Store size={13} color="var(--color-primary-green)" />
                  {t('findNearbySuppliers')}
                </span>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(20, 53, 39, 0.9)' : 'var(--color-soft-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#4ADE80' : 'var(--color-deep-forest)'
                }}>
                  <ArrowRight size={10} color={isDark ? '#4ADE80' : 'var(--color-deep-forest)'} />
                </div>
              </div>
            </div>

            {/* Drone Element Floating over Fields */}
            <div style={{
              position: 'absolute',
              top: '120px',
              right: '175px',
              zIndex: 15,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))'
            }}>
              <svg width="68" height="38" viewBox="0 0 68 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Drone Body */}
                <ellipse cx="34" cy="18" rx="8" ry="4.5" fill="#24332A" />
                <circle cx="34" cy="18" r="2.5" fill={isDark ? '#4ADE80' : '#38BDF8'} />
                {/* Arms */}
                <path d="M27 16L12 9" stroke="#1F2A24" strokeWidth="2" strokeLinecap="round" />
                <path d="M41 16L56 9" stroke="#1F2A24" strokeWidth="2" strokeLinecap="round" />
                <path d="M28 20L15 27" stroke="#1F2A24" strokeWidth="2" strokeLinecap="round" />
                <path d="M40 20L53 27" stroke="#1F2A24" strokeWidth="2" strokeLinecap="round" />
                {/* Rotors with spinning motion blur */}
                <ellipse cx="12" cy="9" rx="10" ry="2" fill="rgba(255,255,255,0.7)" stroke="#1F2A24" strokeWidth="1" />
                <ellipse cx="56" cy="9" rx="10" ry="2" fill="rgba(255,255,255,0.7)" stroke="#1F2A24" strokeWidth="1" />
                <ellipse cx="15" cy="27" rx="9" ry="2" fill="rgba(255,255,255,0.7)" stroke="#1F2A24" strokeWidth="1" />
                <ellipse cx="53" cy="27" rx="9" ry="2" fill="rgba(255,255,255,0.7)" stroke="#1F2A24" strokeWidth="1" />
                {/* Landing Skids */}
                <path d="M31 22L30 28" stroke="#1F2A24" strokeWidth="1.5" />
                <path d="M37 22L38 28" stroke="#1F2A24" strokeWidth="1.5" />
                <circle cx="34" cy="24" r="2" fill="#12372A" />
              </svg>
            </div>

            {/* Widget 3: Crop Health AR Pin (Over middle crop fields) */}
            <div 
              onClick={() => setCurrentPage('diagnosis')}
              style={{
                position: 'absolute',
                top: '225px',
                left: '35px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                zIndex: 20
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Badge */}
              <div style={{
                backgroundColor: 'rgba(18, 55, 42, 0.94)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(183, 214, 106, 0.3)'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BrandLeafLogo size={13} />
                </div>
                <div>
                  <span style={{ fontSize: '0.64rem', color: 'rgba(255, 255, 255, 0.75)', display: 'block', lineHeight: 1 }}>
                    {t('cropHealthBadge')}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#B7D66A', lineHeight: 1.1 }}>
                    86%
                  </span>
                </div>
              </div>
              {/* Vertical pin pointer line down to crop row */}
              <div style={{ width: '2px', height: '18px', backgroundColor: 'var(--color-primary-green)', margin: '0 auto' }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-green)',
                border: '2px solid #FFFFFF',
                margin: '-2px auto 0',
                boxShadow: '0 0 6px rgba(47, 125, 74, 0.8)'
              }} />
            </div>

            {/* Widget 4: Disease Risk Alert AR Pin (Over crop beds in front of house) */}
            <div 
              onClick={() => setCurrentPage('diagnosis')}
              style={{
                position: 'absolute',
                top: '265px',
                right: '95px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                zIndex: 20
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Badge */}
              <div style={{
                backgroundColor: isDark ? 'rgba(20, 53, 39, 0.94)' : 'rgba(124, 44, 36, 0.94)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255, 255, 255, 0.25)'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? '#143527' : '#D95C4F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={12} color={isDark ? '#4ADE80' : '#FFFFFF'} />
                </div>
                <div>
                  <span style={{ fontSize: '0.64rem', color: isDark ? '#86EFAC' : 'rgba(255, 255, 255, 0.8)', display: 'block', lineHeight: 1 }}>
                    {t('diseaseRisk')}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#F0FDF4' : '#FFFFFF', lineHeight: 1.1 }}>
                    {t('moderate')}
                  </span>
                </div>
              </div>
              {/* Vertical pin pointer line down to crop bed */}
              <div style={{ width: '2px', height: '18px', backgroundColor: isDark ? 'var(--color-primary-green)' : '#D95C4F', margin: '0 auto' }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'var(--color-primary-green)' : '#D95C4F',
                border: '2px solid #FFFFFF',
                margin: '-2px auto 0',
                boxShadow: isDark ? '0 0 6px rgba(74, 222, 128, 0.8)' : '0 0 6px rgba(217, 92, 79, 0.8)'
              }} />
            </div>

            {/* Widget 5: Circular Ask Shet Samarthan Voice Radar Widget (Lower Right) */}
            <div 
              onClick={onOpenVoice}
              style={{
                position: 'absolute',
                bottom: '15px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                zIndex: 25
              }}
            >
              {/* Text Pill on Left */}
              <div style={{
                backgroundColor: 'rgba(18, 55, 42, 0.94)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '8px 16px',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Sparkles size={15} color="#B7D66A" />
                <div style={{ lineHeight: 1.2 }}>
                  <strong style={{ fontSize: '0.82rem', color: '#FFFFFF', display: 'block' }}>{t('voiceWidgetTitle')}</strong>
                  <span style={{ fontSize: '0.70rem', color: 'rgba(255, 255, 255, 0.75)' }}>{t('voiceWidgetSub')}</span>
                </div>
              </div>

              {/* Glowing Concentric Circular Radar on Right */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#16A34A' : '#0284C7',
                backgroundImage: isDark ? 'radial-gradient(circle, #4ADE80 0%, #16A34A 80%)' : 'radial-gradient(circle, #38BDF8 0%, #0284C7 80%)',
                boxShadow: isDark 
                  ? '0 0 28px rgba(74, 222, 128, 0.75), 0 0 0 6px rgba(74, 222, 128, 0.25), 0 0 0 12px rgba(74, 222, 128, 0.1)' 
                  : '0 0 28px rgba(2, 132, 199, 0.75), 0 0 0 6px rgba(2, 132, 199, 0.25), 0 0 0 12px rgba(2, 132, 199, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'transform 0.2s ease',
                animation: 'pulseGlow 2.5s infinite ease-in-out'
              }}>
                <Mic size={26} />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4 FEATURE CARDS (IN CONTINUOUS OVERLAPPING WHITE CONTAINER)
          ========================================================================= */}
      <section className="features-section" style={{ maxWidth: '1320px', margin: '-55px auto 60px', padding: '0 36px', position: 'relative', zIndex: 30 }} id="features">
        <div style={{
          backgroundColor: isDark ? '#07261C' : '#FFFFFF',
          borderRadius: '28px',
          padding: '16px',
          boxShadow: isDark ? '0 18px 48px rgba(0, 0, 0, 0.45)' : '0 18px 48px rgba(18, 55, 42, 0.08)',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid rgba(18, 55, 42, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px'
        }} className="feature-cards-container">
          
          {/* Card 1: AI Crop Diagnosis (Soft Green) */}
          <div
            onClick={() => setCurrentPage('diagnosis')}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #143527 0%, #0D241B 100%)' 
                : 'linear-gradient(135deg, #F0F7EE 0%, #E3EFE1 100%)',
              borderRadius: '20px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '140px',
              transition: 'all 0.2s ease',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid var(--border-light)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = isDark ? '0 10px 24px rgba(74, 222, 128, 0.2)' : '0 10px 24px rgba(47, 125, 74, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <DiagnosisCardGraphic />
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)', marginBottom: '5px', lineHeight: 1.2 }}>
                {t('featureDiagnosisTitle')}
              </h3>
              <p style={{ fontSize: '0.80rem', color: isDark ? '#86EFAC' : 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {t('featureDiagnosisDesc')}
              </p>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#143527' : 'var(--color-card-surface)',
              color: isDark ? '#4ADE80' : 'var(--color-deep-forest)',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <ArrowRight size={13} strokeWidth={2.2} />
            </div>
          </div>

          {/* Card 2: 3D Farm Simulator (Soft Sky Blue) */}
          <div
            onClick={() => setCurrentPage('3dfarm')}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #133D29 0%, #0D241B 100%)' 
                : 'linear-gradient(135deg, var(--semantic-ai-bg) 0%, var(--color-soft-surface) 100%)',
              borderRadius: '20px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '140px',
              transition: 'all 0.2s ease',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid var(--border-light)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = isDark ? '0 10px 24px rgba(74, 222, 128, 0.2)' : '0 10px 24px rgba(59, 130, 196, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Farm3DCardGraphic />
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)', marginBottom: '5px', lineHeight: 1.2 }}>
                {t('feature3DTitle')}
              </h3>
              <p style={{ fontSize: '0.80rem', color: isDark ? '#86EFAC' : 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {t('feature3DDesc')}
              </p>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#143527' : 'var(--color-card-surface)',
              color: isDark ? '#4ADE80' : 'var(--color-deep-forest)',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <ArrowRight size={13} strokeWidth={2.2} />
            </div>
          </div>

          {/* Card 3: Weather & Insights (Soft Warm Cream) */}
          <div
            onClick={() => setCurrentPage('weather')}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #16402C 0%, #0D241B 100%)' 
                : 'linear-gradient(135deg, var(--semantic-warning-bg) 0%, var(--color-soft-surface) 100%)',
              borderRadius: '20px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '140px',
              transition: 'all 0.2s ease',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid var(--border-light)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = isDark ? '0 10px 24px rgba(74, 222, 128, 0.2)' : '0 10px 24px rgba(229, 168, 59, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <WeatherCardGraphic />
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)', marginBottom: '5px', lineHeight: 1.2 }}>
                {t('featureWeatherTitle')}
              </h3>
              <p style={{ fontSize: '0.80rem', color: isDark ? '#86EFAC' : 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {t('featureWeatherDesc')}
              </p>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#143527' : 'var(--color-card-surface)',
              color: isDark ? '#4ADE80' : 'var(--color-deep-forest)',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <ArrowRight size={13} strokeWidth={2.2} />
            </div>
          </div>

          {/* Card 4: Nearby Suppliers (Soft Rose/Peach) */}
          <div
            onClick={() => setCurrentPage('suppliers')}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #133827 0%, #0D241B 100%)' 
                : 'linear-gradient(135deg, var(--semantic-error-bg) 0%, var(--color-soft-surface) 100%)',
              borderRadius: '20px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '140px',
              transition: 'all 0.2s ease',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid var(--border-light)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = isDark ? '0 10px 24px rgba(74, 222, 128, 0.2)' : '0 10px 24px rgba(217, 92, 79, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <SuppliersCardGraphic />
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)', marginBottom: '5px', lineHeight: 1.2 }}>
                {t('featureSuppliersTitle')}
              </h3>
              <p style={{ fontSize: '0.80rem', color: isDark ? '#86EFAC' : 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {t('featureSuppliersDesc')}
              </p>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#143527' : 'var(--color-card-surface)',
              color: isDark ? '#4ADE80' : 'var(--color-deep-forest)',
              border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <ArrowRight size={13} strokeWidth={2.2} />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 9: WHY SHET SAMARTHAN — MODERN FARMING BENCHMARK
          ========================================================================= */}
      <section style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '24px',
          backgroundColor: 'var(--color-soft-surface)',
          border: '1.5px solid rgba(47, 125, 74, 0.25)',
          marginBottom: '16px'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary-green)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
            {t('whyBadge')}
          </span>
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-deep-forest)', marginBottom: '12px' }}>
          {t('whyTitlePart1')}<span style={{ color: 'var(--color-primary-green)' }}>{t('whyTitlePart2')}</span>
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 48px' }}>
          {t('whySubtitle')}
        </p>

        {/* 4 Benefit Cards Grid (Exact Match to AgriVision reference screenshot) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '18px'
        }} className="benefit-cards-grid">
          
          <div 
            onClick={() => setCurrentPage('diagnosis')}
            style={{ 
              backgroundColor: 'var(--color-card-surface)',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              backgroundColor: 'var(--semantic-ai-bg)',
              color: 'var(--semantic-ai)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ScanLine size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                {t('feature1Tag')}
              </span>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0, lineHeight: 1.25 }}>
                {t('heroFeature1')}
              </h4>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('3dfarm')}
            style={{ 
              backgroundColor: 'var(--color-card-surface)',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-soft-surface)',
              color: 'var(--color-primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Box size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                {t('feature2Tag')}
              </span>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0, lineHeight: 1.25 }}>
                {t('heroFeature2')}
              </h4>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('weather')}
            style={{ 
              backgroundColor: 'var(--color-card-surface)',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              backgroundColor: 'var(--semantic-weather-bg)',
              color: 'var(--semantic-weather)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CloudSun size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                {t('feature3Tag')}
              </span>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0, lineHeight: 1.25 }}>
                {t('heroFeature3')}
              </h4>
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('suppliers')}
            style={{ 
              backgroundColor: 'var(--color-card-surface)',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              backgroundColor: 'var(--semantic-success-bg)',
              color: 'var(--semantic-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                {t('feature4Tag')}
              </span>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: 0, lineHeight: 1.25 }}>
                {t('heroFeature4')}
              </h4>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 10: HOW IT WORKS (3-STEP PROCESS)
          ========================================================================= */}
      <section style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px' }} id="how-it-works">
        <div className="card" style={{ padding: '48px 40px', backgroundColor: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('howBadge')}
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '6px' }}>
              {t('howTitle')}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }} className="how-it-works-grid">
            
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-surface)',
                color: 'var(--color-deep-forest)',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid var(--color-primary-green)'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{t('step1Title')}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('step1Desc')}
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-surface)',
                color: 'var(--color-deep-forest)',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid var(--color-primary-green)'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{t('step2Title')}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('step2Desc')}
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-soft-surface)',
                color: 'var(--color-deep-forest)',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid var(--color-primary-green)'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{t('step3Title')}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('step3Desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: MULTILINGUAL VOICE ASSISTANT SHOWCASE
          ========================================================================= */}
      <section style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px' }}>
        <div className="landing-voice-box voice-accessibility-section" style={{
          background: isDark ? '#064E3B' : 'linear-gradient(135deg, var(--color-deep-forest), #164032)',
          backgroundColor: isDark ? '#064E3B' : undefined,
          borderRadius: '28px',
          padding: '50px 48px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap',
          boxShadow: isDark ? '0 20px 50px rgba(0, 0, 0, 0.6)' : '0 20px 50px rgba(18, 55, 42, 0.25)',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
        }}>
          <div style={{ maxWidth: '580px' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--color-soft-lime)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: '10px'
            }}>
              {t('voiceBadge')}
            </span>
            <h2 style={{ fontSize: '2.3rem', color: '#FFFFFF', marginBottom: '14px', lineHeight: 1.2 }}>
              {t('voiceHeroTitle')}
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.6, marginBottom: '24px' }}>
              {t('voiceHeroDesc')}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                English
              </span>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(183, 214, 106, 0.2)',
                color: 'var(--color-soft-lime)',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                मराठी
              </span>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                हिंदी
              </span>
            </div>

            <button
              onClick={onOpenVoice}
              className="btn btn-accent"
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}
            >
              <Mic size={18} />
              <span>{t('tryVoiceAssistant')}</span>
            </button>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            maxWidth: '360px',
            width: '100%'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-soft-lime)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('sampleQueries')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.2)', fontSize: '0.85rem' }}>
                🗣️ "{t('sampleQ1')}"
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.2)', fontSize: '0.85rem' }}>
                🗣️ "{t('sampleQ2')}"
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.2)', fontSize: '0.85rem' }}>
                🗣️ "{t('sampleQ3')}"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: ABOUT SECTION & CALLIGRAPHY HERITAGE
          ========================================================================= */}
      <section style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px' }} id="about">
        <div className="card about-card" style={{
          backgroundColor: isDark ? '#07261C' : '#FFFFFF',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid var(--border-light)',
          padding: '48px 44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isDark ? '#10B981' : 'var(--color-primary-green)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {t('aboutBadge')}
            </span>
            <h2 style={{ fontSize: '2.2rem', margin: '10px 0 16px', color: isDark ? '#FFFFFF' : 'var(--color-deep-forest)' }}>
              {t('aboutTitle')}
            </h2>
            <p style={{
              color: isDark ? '#F3F4F6' : 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.7,
              marginBottom: '16px'
            }}>
              {t('aboutP1')}
            </p>
            <p style={{
              color: isDark ? '#E5E7EB' : 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.7
            }}>
              {t('aboutP2')}
            </p>
          </div>

          <div style={{ textAlign: 'center', flexShrink: 0, margin: '0 auto' }}>
            <img
              src="/assets/logo-banner.png"
              alt="शेत समर्थन Calligraphy Logo"
              className="about-logo-banner"
              style={{ maxWidth: '440px', width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: FINAL CALL TO ACTION (TAKE NEXT STEP)
          ========================================================================= */}
      <section className="landing-cta-section" style={{
        backgroundColor: isDark ? '#064E3B' : 'var(--color-primary-green)',
        backgroundImage: isDark ? 'none' : 'linear-gradient(135deg, var(--color-primary-green), #1b5330)',
        color: '#FFFFFF',
        padding: '70px 32px',
        textAlign: 'center',
        borderTop: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : 'none',
        borderBottom: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : 'none'
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.6rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '16px' }}>
            {t('ctaTitle')}
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '32px' }}>
            {t('ctaDesc')}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
              className="cta-primary-btn"
              style={{
                backgroundColor: isDark ? '#10B981' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : 'var(--color-deep-forest)',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                border: isDark ? '1.5px solid #34D399' : 'none'
              }}
            >
              {t('getStarted')}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                cursor: 'pointer'
              }}
            >
              {t('ctaExplore')}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 14: FOOTER (DEEP FOREST GREEN)
          ========================================================================= */}
      <footer style={{
        backgroundColor: isDark ? '#07261C' : 'var(--color-deep-forest)',
        color: '#FFFFFF',
        padding: '60px 48px calc(36px + env(safe-area-inset-bottom, 0px))',
        borderTop: isDark ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid rgba(183, 214, 106, 0.2)',
        marginTop: 'auto',
        width: '100%'
      }} className="landing-footer">
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <BrandLeafLogo size={32} />
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                {t('brandName')}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.65 }}>
              {t('footerDesc')}
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-soft-lime)', fontSize: '1rem', marginBottom: '16px' }}>
              {t('footerModules')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><button onClick={() => setCurrentPage('diagnosis')} style={{ color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}>{t('navDiagnosis')}</button></li>
              <li><button onClick={() => setCurrentPage('3dfarm')} style={{ color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}>{t('nav3DFarm')}</button></li>
              <li><button onClick={() => setCurrentPage('weather')} style={{ color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}>{t('navWeather')}</button></li>
              <li><button onClick={() => setCurrentPage('suppliers')} style={{ color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}>{t('navSuppliers')}</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-soft-lime)', fontSize: '1rem', marginBottom: '16px' }}>
              {t('footerArch')}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.65 }}>
              {t('footerBackend')}<br />
              {t('footerFrontend')}<br />
              {t('footerDb')}<br />
              {t('footerLangs')}
            </p>
          </div>
        </div>

        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.65)'
        }}>
          <span>{t('footerRights')}</span>
          <span>{t('footerAcademic')}</span>
        </div>
      </footer>

    </div>
  );
}
