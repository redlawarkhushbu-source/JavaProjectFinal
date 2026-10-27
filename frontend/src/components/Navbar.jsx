import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  User, 
  LogOut, 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  Mic,
  Sun,
  Moon,
  LayoutDashboard,
  Box,
  ScanLine,
  CloudSun,
  Store,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getSafeAvatar } from '../utils/avatarUtils';
import TwoStageLocationModal from './TwoStageLocationModal';

// Green twin-leaf logo matching the reference design exactly
export function BrandLeafLogo({ size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Primary dark green leaf pointing up and right */}
      <path 
        d="M7 29C7 29 9 15 23 8C29 5 33 4 33 4C33 4 31 12 25 19C18 26 7 29 7 29Z" 
        fill="#2F7D4A" 
      />
      {/* Delicate spine vein */}
      <path 
        d="M7 29C13 23 19 18 26 10" 
        stroke="#B7D66A" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        opacity="0.9"
      />
      {/* Second vibrant green leaf branching out */}
      <path 
        d="M12 25C12 25 15 28 20 28C25 28 29 25 29 25C29 25 27 21 21 20C16 20 12 25 12 25Z" 
        fill="#68A357" 
      />
    </svg>
  );
}

// Single tilted leaf icon next to "Tomorrow" in headline
export function TiltedLeafIcon({ size = 28 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}
    >
      <path 
        d="M5 27C5 27 7 14 20 7C25 4 29 3 29 3C29 3 27 10 22 16C16 23 5 27 5 27Z" 
        fill="#2F7D4A" 
      />
      <path 
        d="M5 27C11 21 17 15 24 8" 
        stroke="#B7D66A" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export default function Navbar({ onOpenVoice, currentPage, setCurrentPage }) {
  const { lang, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
  const [activeNav, setActiveNav] = useState('home');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus when route/page changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowLangMenu(false);
    setShowUserMenu(false);
  }, [currentPage]);

  // Click outside listener for dropdown menus
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Lock body scroll when mobile side drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Detect scroll to transition from transparent sky overlay to frosted glass
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);

      // ScrollSpy: auto-highlight active nav link on landing page
      if (currentPage === 'landing') {
        const sections = [
          { id: 'about', el: document.getElementById('about') },
          { id: 'how-it-works', el: document.getElementById('how-it-works') },
          { id: 'features', el: document.getElementById('features') },
          { id: 'home', el: document.getElementById('top') }
        ];

        const scrollPos = window.scrollY + 120;
        for (const sec of sections) {
          if (sec.el && sec.el.offsetTop <= scrollPos) {
            setActiveNav(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const navLinks = [
    { id: 'home', label: t('navHome'), targetId: 'top' },
    { id: 'features', label: t('navFeatures'), targetId: 'features' },
    { id: 'how-it-works', label: t('navHowItWorks'), targetId: 'how-it-works' },
    { id: 'about', label: t('navAbout'), targetId: 'about' },
  ];

  const handleNavClick = (link) => {
    setActiveNav(link.id);
    setMobileMenuOpen(false);

    if (currentPage !== 'landing') {
      setCurrentPage('landing');
      setTimeout(() => {
        if (link.targetId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(link.targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      if (link.targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(link.targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getLangLabel = () => {
    if (lang === 'mr') return 'मराठी';
    if (lang === 'hi') return 'हिंदी';
    return 'EN';
  };

  const isLanding = currentPage === 'landing';
  const showFrosted = !isLanding || isScrolled;

  return (
    <header style={{
      height: '78px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: showFrosted ? (isDark ? 'rgba(9, 25, 18, 0.95)' : 'rgba(255, 255, 255, 0.94)') : 'transparent',
      backdropFilter: showFrosted ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: showFrosted ? 'blur(16px)' : 'none',
      borderBottom: showFrosted ? (isDark ? '1px solid rgba(183, 214, 106, 0.18)' : '1px solid rgba(18, 55, 42, 0.08)') : '1px solid transparent',
      boxShadow: showFrosted ? (isDark ? '0 4px 20px rgba(0, 0, 0, 0.45)' : '0 4px 20px rgba(18, 55, 42, 0.06)') : 'none',
      transition: 'background-color 0.25s ease, border-bottom 0.25s ease, box-shadow 0.25s ease',
      display: 'flex',
      alignItems: 'center'
    }} className="reference-navbar">
      
      {/* Inner Container: 1320px max-width, matching hero and feature cards perfectly */}
      <div style={{
        maxWidth: '1320px',
        width: '100%',
        margin: '0 auto',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%'
      }}>

        {/* Left: Brand Logo & Wordmark (Responsive & no-overflow on phone) */}
        <div 
          onClick={() => {
            setCurrentPage(user ? 'dashboard' : 'landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0,
            minWidth: 0
          }}
          className="navbar-brand-wrapper"
        >
          <BrandLeafLogo size={32} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <span className="navbar-brand-title" style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '1.45rem', 
              fontWeight: 800, 
              color: 'var(--color-deep-forest)',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              whiteSpace: 'nowrap'
            }}>
              Shet Samarthan
            </span>
            <span className="navbar-brand-subtitle" style={{
              fontFamily: 'var(--font-devanagari)',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--color-primary-green)',
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginTop: '1px',
              whiteSpace: 'nowrap'
            }}>
              शेत समर्थन
            </span>
          </div>
        </div>

        {/* Center: Navigation Links with Active Underline Indicator */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '36px'
        }} className="desktop-nav-links">
          {navLinks.map((link) => {
            const isActive = activeNav === link.id && isLanding;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                style={{
                  position: 'relative',
                  padding: '6px 0',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-deep-forest)' : '#263C31',
                  transition: 'color 0.18s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--color-primary-green)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#263C31';
                }}
              >
                <span>{link.label}</span>
                {/* Crisp active horizontal underline bar */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '0px',
                    right: '0px',
                    height: '2.5px',
                    backgroundColor: 'var(--color-deep-forest)',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Language Selector Pill & Forest-Green Login Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="nav-actions-right">
          
          {/* Active Location Pill (📍 Mumbai / Dadar, Mumbai ⌵) */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="desktop-pill-location"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '9999px',
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.08)' 
                : (user?.stage === 2 ? 'rgba(46, 125, 50, 0.1)' : (showFrosted ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)')),
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: isDark 
                ? '1.5px solid rgba(183, 214, 106, 0.35)' 
                : (user?.stage === 2 ? '1.5px solid var(--color-primary-green)' : '1.5px solid rgba(18, 55, 42, 0.16)'),
              color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-green)';
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(183, 214, 106, 0.35)' : (user?.stage === 2 ? 'var(--color-primary-green)' : 'rgba(18, 55, 42, 0.16)');
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : (user?.stage === 2 ? 'rgba(46, 125, 50, 0.1)' : (showFrosted ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)'));
            }}
            title={lang === 'mr' ? 'स्थान बदला (दोन-टप्पे स्थान निवड)' : 'Configure Farm Location (Two-Stage)'}
          >
            <MapPin size={14} color="var(--color-primary-green)" />
            <span style={{ color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)' }}>
              {user?.locality 
                ? `${user.locality.split(',')[0].slice(0, 12)}, ${user?.city || user?.district}` 
                : (user?.city || user?.district || 'Mumbai')}
            </span>
            <ChevronDown size={13} strokeWidth={2} color={isDark ? '#B7D66A' : 'var(--color-deep-forest)'} />
          </button>

          {/* Voice Assistant / Voice Control Pill */}
          <button
            onClick={onOpenVoice}
            className="desktop-pill-voice"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1.5px solid var(--color-primary-green)',
              color: isDark ? '#B7D66A' : 'var(--color-primary-green)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-green)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.1)';
              e.currentTarget.style.color = isDark ? '#B7D66A' : 'var(--color-primary-green)';
            }}
            title={lang === 'mr' ? 'बोलून चालवा (व्हॉइस असिस्टंट)' : lang === 'hi' ? 'बोलकर चलाएं (वॉइस असिस्टेंट)' : 'Voice Assistant'}
          >
            <Mic size={14} />
            <span>{lang === 'mr' ? 'बोलून चालवा 🎙️' : lang === 'hi' ? 'बोलकर चलाएं 🎙️' : 'Voice 🎙️'}</span>
          </button>
          
          {/* Language Selector Pill (🌐 EN ⌵) */}
          <div ref={langMenuRef} style={{ position: 'relative' }} className="desktop-pill-lang">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 15px',
                borderRadius: '9999px',
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : (showFrosted ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)'),
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isDark ? '1.5px solid rgba(183, 214, 106, 0.35)' : '1.5px solid rgba(18, 55, 42, 0.16)',
                color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-green)';
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(183, 214, 106, 0.35)' : 'rgba(18, 55, 42, 0.16)';
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : (showFrosted ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)');
              }}
            >
              <Globe size={15} strokeWidth={1.8} color={isDark ? '#B7D66A' : 'var(--color-deep-forest)'} />
              <span style={{ color: isDark ? '#F0FDF4' : 'var(--color-deep-forest)' }}>{getLangLabel()}</span>
              <ChevronDown size={13} strokeWidth={2} color={isDark ? '#B7D66A' : 'var(--color-deep-forest)'} />
            </button>

            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '144px',
                backgroundColor: isDark ? '#0f281e' : '#FFFFFF',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-lg)',
                border: isDark ? '1px solid rgba(183, 214, 106, 0.25)' : '1px solid var(--border-light)',
                padding: '6px',
                zIndex: 110,
                animation: 'fadeIn 0.18s ease'
              }}>
                {[
                  { code: 'en', label: 'English (EN)' },
                  { code: 'mr', label: 'मराठी (MR)' },
                  { code: 'hi', label: 'हिंदी (HI)' }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      changeLanguage(item.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: lang === item.code ? 700 : 500,
                      color: lang === item.code ? 'var(--color-soft-lime)' : 'var(--text-primary)',
                      backgroundColor: lang === item.code ? 'rgba(183, 214, 106, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : (showFrosted ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.72)'),
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: isDark ? '1.5px solid rgba(183, 214, 106, 0.35)' : '1.5px solid rgba(18, 55, 42, 0.16)',
              color: isDark ? '#FBBF24' : 'var(--color-deep-forest)',
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08) rotate(15deg)';
              e.currentTarget.style.borderColor = 'var(--color-primary-green)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(183, 214, 106, 0.35)' : 'rgba(18, 55, 42, 0.16)';
            }}
            title={
              lang === 'mr'
                ? (isDark ? '☀️ लाईट मोड सुरू करा (Light Mode)' : '🌙 डार्क मोड सुरू करा (Dark Mode)')
                : lang === 'hi'
                ? (isDark ? '☀️ लाइट मोड चालू करें (Light Mode)' : '🌙 डार्क मोड चालू करें (Dark Mode)')
                : (isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode')
            }
            aria-label="Toggle theme mode"
          >
            {isDark ? <Sun size={18} strokeWidth={2.2} /> : <Moon size={18} strokeWidth={2.2} />}
          </button>

          {/* Login Button with User Icon (Capsule Pill, Forest Green) */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }} className="desktop-pill-auth">
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px 6px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-soft-surface)',
                  border: isDark ? '1.5px solid rgba(183, 214, 106, 0.35)' : '1.5px solid rgba(47, 125, 74, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={getSafeAvatar(user)}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getSafeAvatar(user?.fullName || 'Farmer');
                  }}
                  alt={user.fullName}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                  {user.fullName.split(' ')[0]}
                </span>
              </div>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '180px',
                  backgroundColor: isDark ? '#0f281e' : '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  border: isDark ? '1px solid rgba(183, 214, 106, 0.25)' : '1px solid var(--border-light)',
                  padding: '8px',
                  zIndex: 110
                }}>
                  <button
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setShowUserMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={15} />
                    <span>{t('navDashboard')}</span>
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      setCurrentPage('landing');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--semantic-error)',
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={15} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('auth')}
              className="desktop-pill-auth"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                borderRadius: '9999px',
                backgroundColor: isDark ? '#064E3B' : 'var(--color-deep-forest)',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: isDark ? '1.5px solid #10B981' : 'none',
                boxShadow: isDark ? '0 3px 12px rgba(16, 185, 129, 0.35)' : '0 3px 12px rgba(18, 55, 42, 0.22)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#10B981' : 'var(--color-primary-green)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 5px 16px rgba(47, 125, 74, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#064E3B' : 'var(--color-deep-forest)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark ? '0 3px 12px rgba(16, 185, 129, 0.35)' : '0 3px 12px rgba(18, 55, 42, 0.22)';
              }}
            >
              <User size={15} strokeWidth={2.2} />
              <span>{t('login')}</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-toggle"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={22} />
          </button>
        </div>

      </div>

      {/* Mobile Side Navbar Drawer Backdrop & Drawer in Portal to escape header clipping */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className={`mobile-side-backdrop ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(6, 18, 12, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 99998,
              opacity: mobileMenuOpen ? 1 : 0,
              pointerEvents: mobileMenuOpen ? 'auto' : 'none',
              transition: 'opacity 0.28s ease'
            }}
          />

          <aside 
            className={`mobile-side-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(330px, 86vw)',
              backgroundColor: 'var(--color-card-surface)',
              borderLeft: '1px solid var(--border-light)',
              boxShadow: '-8px 0 36px rgba(0, 0, 0, 0.45)',
              zIndex: 99999,
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
        {/* Drawer Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-soft-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandLeafLogo size={28} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.18rem', 
                fontWeight: 800, 
                color: 'var(--color-deep-forest)',
                lineHeight: 1.1
              }}>
                Shet Samarthan
              </span>
              <span style={{
                fontFamily: 'var(--font-devanagari)',
                fontSize: '0.62rem',
                fontWeight: 700,
                color: 'var(--color-primary-green)',
                letterSpacing: '0.04em'
              }}>
                शेत समर्थन
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              color: 'var(--color-deep-forest)',
              cursor: 'pointer'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          
          {/* User Profile or Login Banner */}
          {user ? (
            <div style={{
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-soft-surface)',
              border: '1.5px solid rgba(47, 125, 74, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={getSafeAvatar(user)}
                  referrerPolicy="no-referrer"
                  alt={user.fullName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFFFFF' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--color-deep-forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lang === 'mr' ? (user?.fullNameMr || user?.fullName) : (user?.fullName || 'Farmer')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.phone ? `+91 ${user.phone}` : user?.email || 'Active Farmer'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <button
                  onClick={() => {
                    setCurrentPage('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-deep-forest)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>{t('navDashboard')}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    setCurrentPage('landing');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(217, 92, 79, 0.1)',
                    color: 'var(--semantic-error)',
                    border: '1px solid rgba(217, 92, 79, 0.25)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <LogOut size={14} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              background: isDark ? '#064E3B' : 'linear-gradient(135deg, #12372A 0%, #1a4d3b 100%)',
              color: '#FFFFFF',
              boxShadow: isDark ? '0 6px 18px rgba(0, 0, 0, 0.45)' : '0 6px 18px rgba(18, 55, 42, 0.25)',
              border: isDark ? '1.5px solid rgba(16, 185, 129, 0.35)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#B7D66A" />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {lang === 'mr' ? 'शेत समर्थन मध्ये स्वागत' : lang === 'hi' ? 'खेत समर्थन में स्वागत' : 'Welcome to Shet Samarthan'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#FFFFFF', opacity: 0.9, marginBottom: '12px', lineHeight: 1.45 }}>
                {lang === 'mr' ? '३D शेत रचना आणि AI पीक सल्ला मिळवण्यासाठी लॉगिन करा.' : 'Access smart farming, 3D simulation & AI crop diagnosis.'}
              </p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentPage('auth');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <User size={16} />
                <span>{t('login')}</span>
              </button>
            </div>
          )}

          {/* Location Selector Card */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsLocationModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-soft-surface)',
              border: '1.5px solid rgba(47, 125, 74, 0.22)',
              color: 'var(--color-deep-forest)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--color-primary-green)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('changeLocation')}</div>
                <div style={{ fontSize: '0.85rem' }}>
                  {user?.locality 
                    ? `${user.locality.split(',')[0].slice(0, 16)}, ${user?.city || user?.district}` 
                    : (user?.city || user?.district || 'Mumbai, Maharashtra')}
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--color-deep-forest)" />
          </button>

          {/* Voice & Theme Quick Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenVoice) onOpenVoice();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(46, 125, 50, 0.12)',
                border: '1.5px solid var(--color-primary-green)',
                color: 'var(--color-primary-green)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Mic size={16} />
              <span>{lang === 'mr' ? 'बोलून चालवा' : lang === 'hi' ? 'बोलकर चलाएं' : 'Voice Assistant'}</span>
            </button>

            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-soft-surface)',
                border: '1px solid var(--border-light)',
                color: isDark ? '#FBBF24' : 'var(--color-deep-forest)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Language Switcher Row */}
          <div>
            <div style={{ fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              {lang === 'mr' ? 'भाषा (Language)' : 'Language'}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              backgroundColor: 'var(--color-soft-surface)',
              padding: '4px',
              borderRadius: '12px'
            }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'mr', label: 'मराठी' },
                { code: 'hi', label: 'हिंदी' }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => changeLanguage(item.code)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: lang === item.code ? 800 : 600,
                    color: lang === item.code ? '#FFFFFF' : 'var(--color-deep-forest)',
                    backgroundColor: lang === item.code ? 'var(--color-primary-green)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Farm Tools & Navigation Modules */}
          <div>
            <div style={{ fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              {lang === 'mr' ? 'शेती टूल्स आणि ॲप' : 'Farm Tools & App'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
                { id: 'diagnosis', label: t('navDiagnosis'), icon: ScanLine, badge: 'AI' },
                { id: '3dfarm', label: t('nav3DFarm'), icon: Box, badge: '3D' },
                { id: 'weather', label: t('navWeather'), icon: CloudSun },
                { id: 'suppliers', label: t('navSuppliers'), icon: Store },
                ...(user ? [{ id: 'profile', label: t('navProfile'), icon: User }] : [])
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      fontSize: '0.90rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#FFFFFF' : 'var(--color-deep-forest)',
                      backgroundColor: isActive ? 'var(--color-primary-green)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : 'var(--color-primary-green)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && !isActive && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--semantic-ai-bg)',
                        color: 'var(--semantic-ai)'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landing / Information Section */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              {lang === 'mr' ? 'प्लॅटफॉर्म माहिती' : 'Platform Info'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    fontWeight: activeNav === link.id && isLanding ? 700 : 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ChevronRight size={14} color="var(--text-muted)" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          backgroundColor: 'var(--color-soft-surface)'
        }}>
          {t('footerAcademic')} • Shet Samarthan
        </div>
      </aside>
    </>,
    document.body
  )}

      {/* Two-Stage Location Selector Modal */}
      <TwoStageLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </header>
  );
}
