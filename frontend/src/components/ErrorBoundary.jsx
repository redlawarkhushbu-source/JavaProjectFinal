import React from 'react';
import { BrandLeafLogo } from './Navbar';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a render crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-main-bg, #F6F8F3)',
          padding: '24px',
          fontFamily: "'Inter', 'Noto Sans Devanagari', -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--color-card-surface, #FFFFFF)',
            borderRadius: '20px',
            padding: '36px 30px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(18, 55, 42, 0.12)',
            border: '1.5px solid var(--border-light, rgba(18, 55, 42, 0.08))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <BrandLeafLogo size={46} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(217, 92, 79, 0.1)',
              color: '#D95C4F',
              fontSize: '0.84rem',
              fontWeight: 700,
              marginBottom: '18px'
            }}>
              <AlertTriangle size={16} />
              <span>शेत समर्थन रिकव्हरी (System Recovery)</span>
            </div>

            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--color-deep-forest, #12372A)',
              marginBottom: '10px'
            }}>
              काहीतरी त्रुटी झाली / Something went wrong
            </h2>

            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary, #3D5247)',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              इंटरफेस लोड होताना अनपेक्षित त्रुटी आली. कृपया खालील बटणावर क्लिक करून पृष्ठ रीफ्रेश करा अथवा मुख्यपृष्ठावर जा.
              <br />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #647B6F)' }}>
                An unexpected error occurred during display. Please reload the page to continue.
              </span>
            </p>

            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '24px',
                fontSize: '0.76rem',
                fontFamily: 'monospace',
                color: '#C53030',
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 22px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-deep-forest, #12372A)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(18, 55, 42, 0.25)'
                }}
              >
                <RotateCcw size={16} />
                <span>पृष्ठ रीफ्रेश करा (Reload)</span>
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-soft-surface, #EAF3E7)',
                  color: 'var(--color-deep-forest, #12372A)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1.5px solid rgba(18, 55, 42, 0.15)',
                  cursor: 'pointer'
                }}
              >
                <Home size={16} />
                <span>मुख्यपृष्ठ (Home)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
