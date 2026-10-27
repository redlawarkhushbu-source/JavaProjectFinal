import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import TwoStageLocationModal from './components/TwoStageLocationModal';
import { Mic, Volume2 } from 'lucide-react';
import { audioService } from './services/audioService';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CropDiagnosisPage from './pages/CropDiagnosisPage';
import Farm3DPage from './pages/Farm3DPage';
import WeatherPage from './pages/WeatherPage';
import SuppliersPage from './pages/SuppliersPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  // Subscribe to audio speaking state for floating button animation
  React.useEffect(() => {
    const unsub = audioService.onSpeakingChange((speaking) => {
      setIsAssistantSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  // Global listeners for voice assistant actions and modals
  React.useEffect(() => {
    const handleLocEvent = () => setIsLocationModalOpen(true);

    window.addEventListener('shet_open_location_modal', handleLocEvent);

    return () => {
      window.removeEventListener('shet_open_location_modal', handleLocEvent);
    };
  }, []);

  // Global navigation listener for modals and reminders
  React.useEffect(() => {
    const handleGlobalNav = (e) => {
      if (e.detail) {
        setCurrentPage(e.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('shet_navigate_page', handleGlobalNav);
    return () => window.removeEventListener('shet_navigate_page', handleGlobalNav);
  }, []);

  // Router dispatcher
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setCurrentPage={setCurrentPage} onOpenVoice={() => setIsVoiceModalOpen(true)} />;
      case 'auth':
        return <AuthPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} onOpenVoice={() => setIsVoiceModalOpen(true)} />;
      case 'diagnosis':
        return <CropDiagnosisPage />;
      case '3dfarm':
        return <Farm3DPage />;
      case 'weather':
        return <WeatherPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} onOpenVoice={() => setIsVoiceModalOpen(true)} />;
    }
  };

  const isFullLayoutPage = currentPage === 'landing' || currentPage === 'auth';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-main-bg)' }}>
      {/* Persistent Global Navbar */}
      <Navbar 
        onOpenVoice={() => setIsVoiceModalOpen(true)} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage} 
      />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Desktop Sidebar (visible on app pages) */}
        {!isFullLayoutPage && (
          <div className="desktop-sidebar-container">
            <Sidebar 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              onOpenVoice={() => setIsVoiceModalOpen(true)} 
            />
          </div>
        )}

        {/* Dynamic Page Viewport */}
        <main className={`main-content-viewport ${isFullLayoutPage ? 'full-layout' : ''}`} style={{ 
          flex: 1, 
          minWidth: 0, 
          paddingTop: !isFullLayoutPage ? '78px' : '0', 
          paddingBottom: !isFullLayoutPage ? '70px' : '0' 
        }}>
          {renderCurrentPage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation (visible on mobile screens for app pages) */}
      {!isFullLayoutPage && (
        <MobileBottomNav 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
        />
      )}

      {/* Global Floating Hands-Free Voice Assistant Mic Button */}
      <button
        onClick={() => {
          if (isAssistantSpeaking) {
            audioService.stopSpeaking();
          } else {
            setIsVoiceModalOpen(true);
          }
        }}
        style={{
          position: 'fixed',
          bottom: !isFullLayoutPage ? '78px' : '24px',
          right: '24px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: isAssistantSpeaking ? '#EF4444' : 'var(--color-primary-green)',
          color: '#FFFFFF',
          border: '2.5px solid #FFFFFF',
          boxShadow: isAssistantSpeaking 
            ? '0 0 20px rgba(239, 68, 68, 0.65)' 
            : '0 8px 24px rgba(47, 125, 74, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        title={isAssistantSpeaking ? 'बोलणे थांबवा (Stop Speaking)' : '🎙️ कृषी आवाज सहाय्यक (Voice Assistant)'}
        aria-label="Voice Assistant"
      >
        {isAssistantSpeaking ? <Volume2 size={24} /> : <Mic size={24} />}
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigate={(targetPage) => setCurrentPage(targetPage)}
      />


      {/* Global Two-Stage Location Modal */}
      <TwoStageLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
