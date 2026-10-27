import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, MapPin, ArrowRight, X, ShieldAlert, Sparkles } from 'lucide-react';

export default function LoginReminderModal({ isOpen, onClose, onNavigateAuth, title, message }) {
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(18, 55, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="modal-card" style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'var(--color-card-surface)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-floating)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.06)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Hero Banner */}
        <div style={{
          backgroundColor: '#F3F9F1',
          padding: '32px 24px 24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(46, 125, 50, 0.12)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            backgroundColor: '#E8F5E9',
            border: '2px solid rgba(46, 125, 50, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)',
            position: 'relative'
          }}>
            <MapPin size={30} color="#2E7D32" />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: '#1B5E20',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF'
            }}>
              <Lock size={12} color="#FFFFFF" />
            </div>
          </div>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--color-deep-forest)',
            margin: '0 0 8px'
          }}>
            {title || (lang === 'mr' 
              ? 'GPS शेत स्थानासाठी कृपया लॉगिन करा' 
              : lang === 'hi' 
              ? 'GPS खेत स्थान के लिए कृपया पहले लॉगिन करें' 
              : 'Sign In Required for Farm GPS')}
          </h3>

          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.5
          }}>
            {message || (lang === 'mr'
              ? 'थेट GPS स्थान आपल्या शेतकरी खात्याशी सुरक्षितपणे जोडले जाते. यामुळे उपग्रह नकाशे, हवामान रडार आणि स्थानिक कृषी केंद्रे अचूक मिळतात.'
              : lang === 'hi'
              ? 'लाइव GPS स्थान आपके किसान खाते से सुरक्षित रूप से जुड़ता है। इससे उपग्रह नक्शे, मौसम रडार और स्थानीय कृषि केंद्र सटीक मिलते हैं।'
              : 'GPS auto-detection securely links to your farmer profile to personalize high-resolution satellite imagery, spray windows, and nearest Krishi Kendras.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(21, 101, 192, 0.08)',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: '#1565C0',
            fontWeight: 600
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>
              {lang === 'mr'
                ? 'गुगल किंवा मोबाईल OTP सह १ सेकंदात मोफत लॉगिन करा!'
                : lang === 'hi'
                ? 'गूगल या मोबाइल OTP से १ सेकंड में मुफ़्त लॉगिन करें!'
                : 'Free instant sign in with Google or Phone OTP in 5 seconds!'}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onNavigateAuth) onNavigateAuth();
            }}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '10px'
            }}
          >
            <span>
              {lang === 'mr' ? 'आता लॉगिन किंवा नोंदणी करा' : lang === 'hi' ? 'अब लॉगिन या पंजीकरण करें' : 'Sign In / Register Now'}
            </span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {lang === 'mr' ? 'पाहुणे म्हणून सुरू ठेवा' : lang === 'hi' ? 'अतिथि के रूप में जारी रखें' : 'Continue Browsing as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}
