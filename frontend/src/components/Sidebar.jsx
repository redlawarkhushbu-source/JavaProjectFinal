import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Box, 
  ScanLine, 
  CloudSun, 
  Store, 
  UserCircle, 
  Mic, 
  Compass,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onOpenVoice }) {
  const { lang, t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: '3dfarm', label: t('nav3DFarm'), icon: Box, highlight: true },
    { id: 'diagnosis', label: t('navDiagnosis'), icon: ScanLine },
    { id: 'weather', label: t('navWeather'), icon: CloudSun },
    { id: 'suppliers', label: t('navSuppliers'), icon: Store },
    { id: 'profile', label: t('navProfile'), icon: UserCircle },
  ];

  return (
    <aside style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-card-surface)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      overflowY: 'auto'
    }}>
      <div>
        <div style={{ marginBottom: '16px', padding: '0 8px' }}>
          <span style={{ 
            fontSize: '0.72rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--text-muted)', 
            fontWeight: 700 
          }}>
            {lang === 'mr' ? 'मुख्य मेनू' : lang === 'hi' ? 'मुख्य मेनू' : 'Main Menu'}
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-green)' : 'transparent',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-soft-surface)';
                    e.currentTarget.style.color = 'var(--color-deep-forest)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={20} color={isActive ? '#FFFFFF' : 'var(--color-primary-green)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.highlight && !isActive && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--semantic-ai-bg)',
                    color: 'var(--semantic-ai)',
                    fontWeight: 700
                  }}>
                    3D
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Voice Assistant Promotion Card at bottom of sidebar */}
      <div 
        onClick={onOpenVoice}
        style={{
          background: 'linear-gradient(135deg, var(--color-deep-forest), #1a4d3b)',
          borderRadius: '16px',
          padding: '18px 16px',
          color: '#FFFFFF',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 18px rgba(18, 55, 42, 0.25)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-10px',
          opacity: 0.12,
          pointerEvents: 'none'
        }}>
          <Mic size={90} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-soft-lime)',
            color: 'var(--color-deep-forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mic size={16} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-soft-lime)' }}>
            {lang === 'en' ? 'Voice Assistant' : lang === 'hi' ? 'वॉइस असिस्टेंट' : 'व्हॉइस असिस्टंट'}
          </span>
        </div>

        <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '4px', lineHeight: 1.3 }}>
          {lang === 'en' ? 'Ask Shet Samarthan' : lang === 'hi' ? 'खेत समर्थन से पूछें' : 'शेत समर्थनला विचारा'}
        </h4>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
          {lang === 'en' 
            ? 'Speak to check weather, crop diseases & local stores' 
            : lang === 'hi'
            ? 'बोलकर मौसम, फसल रोग व दुकानें पूछें'
            : 'बोलून तपासा हवामान, पीक रोग व जवळची दुकाने'}
        </p>

        <div style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--color-soft-lime)',
          backgroundColor: 'rgba(183, 214, 106, 0.15)',
          padding: '4px 10px',
          borderRadius: '20px'
        }}>
          <Sparkles size={12} />
          <span>{lang === 'mr' ? 'बोलण्यासाठी टॅप करा' : lang === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to speak'}</span>
        </div>
      </div>

    </aside>
  );
}
