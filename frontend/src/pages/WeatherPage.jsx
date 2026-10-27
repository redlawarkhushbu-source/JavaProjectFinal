import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, INDIAN_AGRI_LOCATIONS, MOCK_WEATHER_DATA } from '../services/api';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Sparkles,
  ShieldCheck,
  Sun,
  Search,
  Locate,
  Clock,
  Gauge,
  Key,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  Zap,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TwoStageLocationModal from '../components/TwoStageLocationModal';
import LoginReminderModal from '../components/LoginReminderModal';
import { audioService } from '../services/audioService';

export default function WeatherPage() {
  const { lang, t } = useLanguage();
  const { user, updateLocation } = useAuth();

  const [selectedCity, setSelectedCity] = useState(() => user?.district || user?.city || 'Mumbai');
  const [selectedLocality, setSelectedLocality] = useState(() => user?.locality || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Global listener for voice assistant city selection
  useEffect(() => {
    const handleCityEvent = (e) => {
      if (e.detail) {
        setSelectedCity(e.detail);
        setSearchFilter('');
      }
    };
    window.addEventListener('shet_select_weather_city', handleCityEvent);
    return () => window.removeEventListener('shet_select_weather_city', handleCityEvent);
  }, []);

  const handleVoiceSearch = () => {
    if (isVoiceSearching) {
      audioService.stopListening();
      setIsVoiceSearching(false);
      return;
    }
    setIsVoiceSearching(true);
    audioService.listenOnce({
      language: lang,
      onResult: (text) => {
        setIsVoiceSearching(false);
        if (text) {
          setSearchFilter(text);
          // Auto-match city if spoken
          const clean = text.toLowerCase();
          const match = INDIAN_AGRI_LOCATIONS.find(loc => 
            clean.includes(loc.id.toLowerCase()) || 
            clean.includes(loc.label.toLowerCase()) ||
            (loc.crops && loc.crops.toLowerCase().includes(clean))
          );
          if (match) {
            setSelectedCity(match.id);
          }
        }
      },
      onError: () => {
        setIsVoiceSearching(false);
      },
      onEnd: () => {
        setIsVoiceSearching(false);
      }
    });
  };
  const [weatherData, setWeatherData] = useState(MOCK_WEATHER_DATA);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENWEATHERMAP_API_KEY : '';
    const cleanEnvKey = (envKey && typeof envKey === 'string' && !envKey.includes('your_')) ? envKey.trim() : '';
    return (typeof window !== 'undefined' && localStorage.getItem('shet_owm_key')) || cleanEnvKey || '';
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [quickTestResult, setQuickTestResult] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);

  // Sync state if user location updates from Navbar or Dashboard
  useEffect(() => {
    if (user?.district || user?.city) {
      setSelectedCity(user?.district || user?.city);
      setSelectedLocality(user?.locality || '');
    }
  }, [user?.district, user?.city, user?.locality]);

  // Filter locations by search term
  const filteredLocations = INDIAN_AGRI_LOCATIONS.filter(loc => 
    loc.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
    loc.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    loc.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
    loc.crops.toLowerCase().includes(searchFilter.toLowerCase())
  );

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      const target = selectedLocality
        ? { city: selectedCity, locality: selectedLocality, lat: user?.lat, lng: user?.lng, location: `${selectedLocality}, ${selectedCity}` }
        : selectedCity;
      const data = await api.getWeather(target, apiKey);
      setWeatherData(data);
      setLoading(false);
    }
    loadWeather();
  }, [selectedCity, selectedLocality, apiKey, user?.lat, user?.lng]);

  // Use GPS location from farmer's device
  const handleUseGps = () => {
    if (!user) {
      setShowLoginReminder(true);
      return;
    }
    if (!navigator.geolocation) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये GPS समर्थित नाही.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsActive(true);
        const gpsLabel = `Live Farm GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
        
        // Persist location across login & logout
        updateLocation({
          city: selectedCity,
          district: selectedCity,
          locality: gpsLabel,
          village: gpsLabel,
          lat: latitude,
          lng: longitude,
          stage: 2,
          isGps: true
        });

        const data = await api.getWeather({
          city: gpsLabel,
          lat: latitude,
          lon: longitude,
          key: apiKey
        });
        setWeatherData(data);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        console.warn('Weather GPS detection error:', err);
        alert(
          lang === 'mr'
            ? '📍 स्थान परवानगी आवश्यक: थेट हवामानासाठी कृपया आपल्या फोन किंवा ब्राउझर सेटिंग्जमध्ये (Settings > Privacy / Site Settings > Location > Allow) जाऊन स्थान परवानगी चालू करा.'
            : lang === 'hi'
            ? '📍 स्थान अनुमति आवश्यक: मौसम हेतु कृपया अपनी डिवाइस या ब्राउज़र सेटिंग्स में लोकेशन अनुमति चालू करें।'
            : '📍 Location Permission Required: Please open your device or browser Settings (Settings > Privacy & Security > Site Permissions > Location > Allow) to enable location services.'
        );
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Header & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--semantic-weather-bg)',
              color: 'var(--semantic-weather)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CloudSun size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('weatherTitle')}</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-green)', fontWeight: 600 }}>
                {lang === 'mr' ? 'भारतातील सर्व कृषी विभागांसाठी रिअल-टाइम हवामान सल्ला' : lang === 'hi' ? 'भारत के सभी कृषि क्षेत्रों के लिए रीयल-टाइम मौसम सलाह' : 'Real-Time Agrometeorology for All Indian Agricultural Belts'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Location Switcher + GPS + Weather Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Active Two-Stage Location Switcher Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-card-surface)',
              border: '1.5px solid var(--color-primary-green)',
              padding: '7px 14px',
              borderRadius: '20px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            title={lang === 'mr' ? 'दोन-टप्पे स्थान बदला' : 'Change Location (Two-Stage Flow)'}
          >
            <MapPin size={15} color="var(--color-primary-green)" />
            <span>{selectedLocality ? `${selectedLocality}, ` : ''}{selectedCity}</span>
            <span style={{ color: 'var(--color-primary-green)', fontSize: '0.72rem' }}>
              ({user?.stage === 2 ? '🎯' : '🏙️'} {lang === 'mr' ? 'बदला' : 'Change'})
            </span>
          </button>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleUseGps}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: gpsActive ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-card-surface)',
              border: gpsActive ? '1.5px solid #2E7D32' : '1px solid var(--border-light)',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: gpsActive ? '#2E7D32' : 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            title={lang === 'mr' ? 'GPS द्वारे शेताचे थेट स्थान शोधा' : lang === 'hi' ? 'GPS द्वारा खेत का सीधा स्थान खोजें' : 'Detect My Farm Location via GPS'}
          >
            <Locate size={15} color={gpsActive ? '#2E7D32' : 'var(--color-primary-green)'} />
            <span>{gpsActive ? (lang === 'mr' ? 'GPS सक्रिय' : lang === 'hi' ? 'GPS सक्रिय' : 'GPS Farm Active') : (lang === 'mr' ? '📍 माझे GPS स्थान वापरा' : lang === 'hi' ? '📍 मेरा GPS स्थान उपयोग करें' : '📍 Use My GPS Location')}</span>
          </button>

          {/* Farmer-Friendly Agrometeorology Status & Setup Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-card-surface)',
            border: '1px solid var(--border-light)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              fontSize: '0.74rem'
            }}>
              <span>🟢</span>
              <span>{weatherData.isLive 
                ? (lang === 'mr' ? 'थेट उपग्रह हवामान (मोफत)' : lang === 'hi' ? 'लाइव सैटेलाइट मौसम (मुफ्त)' : 'Live Satellite Weather (Free)') 
                : (lang === 'mr' ? 'कृषी हवामान सुरू' : lang === 'hi' ? 'कृषि मौसम सक्रिय' : 'Agri Weather Active')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pan-India Agricultural District Selector Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--color-primary-green)" />
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-deep-forest)' }}>
              {lang === 'mr' 
                ? `शेताचे स्थान / जिल्हा निवडा (संपूर्ण भारत - ${INDIAN_AGRI_LOCATIONS.length} जिल्हे उपलब्ध):` 
                : lang === 'hi' 
                ? `खेत का स्थान / ज़िला चुनें (अखिल भारतीय - ${INDIAN_AGRI_LOCATIONS.length} ज़िले उपलब्ध):` 
                : `Select Agricultural Location (All India - ${INDIAN_AGRI_LOCATIONS.length} Districts Available):`}
            </strong>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {lang === 'mr' ? 'महाराष्ट्र, पंजाब, हरियाणा, युपी, एमपी, गुजरात, कर्नाटक सर्व राज्ये' : lang === 'hi' ? 'महाराष्ट्र, पंजाब, हरियाणा, यूपी, एमपी, गुजरात, कर्नाटक सभी राज्य' : 'Showing Maharashtra, Punjab, Haryana, UP, MP, Gujarat, Karnataka, AP & all states'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Quick Search Input with Voice Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={isVoiceSearching ? (lang === 'mr' ? '🎙️ ऐकत आहे... जिल्हा किंवा पीक बोला...' : lang === 'hi' ? '🎙️ सुन रहा हूँ... जिला या फसल बोलें...' : '🎙️ Listening... speak district...') : (lang === 'mr' ? 'जिल्हा, राज्य किंवा पीक शोधा (उदा. नाशिक, लुधियाना, द्राक्षे, कापूस...)' : lang === 'hi' ? 'जिला, राज्य या फसल खोजें (उदा. नासिक, लुधियाना, अंगूर, कपास...)' : 'Search district, state or crop (e.g. Nashik, Ludhiana, Grapes, Cotton...)')}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-control"
              style={{ 
                paddingLeft: '36px', 
                paddingRight: '38px', 
                fontSize: '0.82rem',
                borderColor: isVoiceSearching ? 'var(--color-primary-green)' : undefined,
                boxShadow: isVoiceSearching ? '0 0 0 3px rgba(47, 125, 74, 0.2)' : undefined
              }}
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isVoiceSearching ? '#EF4444' : 'rgba(47, 125, 74, 0.1)',
                color: isVoiceSearching ? '#FFFFFF' : 'var(--color-primary-green)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={lang === 'mr' ? 'बोलून शोधा' : 'Search by Voice'}
            >
              <Mic size={14} />
            </button>
          </div>

          {/* District Dropdown Selector */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setGpsActive(false);
            }}
            className="form-control"
            style={{ flex: 1, minWidth: '280px', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {filteredLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.label} — {loc.state} ({loc.region}) • {loc.crops}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Alert Banner */}
      {weatherData.alert && (
        <div className="alert-box alert-warning" style={{ padding: '18px 20px', marginBottom: '22px' }}>
          <AlertTriangle size={24} color="var(--semantic-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                {lang === 'mr' ? 'कृषी हवामान इशारा' : lang === 'hi' ? 'कृषि मौसम चेतावनी' : 'Agrometeorological Warning'}
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {lang === 'mr' ? weatherData.alert.titleMr : lang === 'hi' ? (weatherData.alert.titleHi || weatherData.alert.titleMr) : weatherData.alert.title}
              </strong>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {lang === 'mr' ? weatherData.alert.descriptionMr : lang === 'hi' ? (weatherData.alert.descriptionHi || weatherData.alert.descriptionMr) : weatherData.alert.description}
            </p>
            <div style={{
              backgroundColor: 'var(--color-card-surface)',
              border: '1px solid var(--border-light)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}>
              <strong>{t('farmerAction')}: </strong>
              {lang === 'mr' ? weatherData.alert.actionMr : lang === 'hi' ? (weatherData.alert.actionHi || weatherData.alert.actionMr) : weatherData.alert.action}
            </div>
          </div>
        </div>
      )}

      {/* Current Conditions & Spray Advisory Hero Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px',
        marginBottom: '26px'
      }} className="weather-hero-grid">
        {/* Main Weather Card */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1E4620, #0E2E1A)',
          color: '#FFFFFF',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 700 }}>
                  {lang === 'mr' ? weatherData.locationMr : lang === 'hi' ? (weatherData.locationHi || weatherData.locationMr) : weatherData.location}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0' }}>
                  <span style={{ fontSize: '3.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                    {weatherData.temperature}°C
                  </span>
                  <span style={{ fontSize: '1.15rem', color: 'var(--color-soft-lime)', fontWeight: 700 }}>
                    {lang === 'mr' ? weatherData.conditionMr : lang === 'hi' ? (weatherData.conditionHi || weatherData.conditionMr) : weatherData.condition}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('feelsLike')} {weatherData.feelsLike}°C • {t('airQuality')}: {weatherData.airQuality}
                </p>
              </div>

              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {weatherData.weatherIconUrl ? (
                  <img src={weatherData.weatherIconUrl} alt="" style={{ width: '48px', height: '48px' }} />
                ) : (
                  <CloudSun size={38} color="#B7D66A" />
                )}
              </div>
            </div>

            {/* Weather Metrics Sub-Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Droplets size={14} color="#5B9BD5" />
                  <span>{t('humidity')}</span>
                </div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginTop: '2px' }}>
                  {weatherData.humidity}%
                </strong>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Wind size={14} color="#B7D66A" />
                  <span>{t('windSpeed')}</span>
                </div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginTop: '2px' }}>
                  {weatherData.windSpeed} {lang === 'mr' ? 'किमी/तास' : lang === 'hi' ? 'किमी/घंटा' : 'km/h'} ({weatherData.windDirection})
                </strong>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <CloudRain size={14} color="#68A357" />
                  <span>{t('rainProbability')}</span>
                </div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginTop: '2px' }}>
                  {weatherData.rainProbability}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Chemical Spraying Suitability Advisor */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--color-primary-green)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-deep-forest)' }}>
                  {t('sprayAdvisorTitle')}
                </h3>
              </div>
              <span className={`badge ${weatherData.spraySuitability?.status?.includes('Delay') ? 'badge-error' : weatherData.spraySuitability?.status?.includes('Wind') ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.74rem' }}>
                {lang === 'mr' ? weatherData.spraySuitability.statusMr : lang === 'hi' ? (weatherData.spraySuitability.statusHi || weatherData.spraySuitability.statusMr) : weatherData.spraySuitability.status}
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--color-soft-surface)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '14px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                {t('recommendedWindow')}
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-green)' }}>
                {lang === 'mr' ? weatherData.spraySuitability.timeWindowMr : lang === 'hi' ? (weatherData.spraySuitability.timeWindowHi || weatherData.spraySuitability.timeWindowMr) : weatherData.spraySuitability.timeWindow}
              </strong>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {lang === 'mr' ? weatherData.spraySuitability.reasonMr : lang === 'hi' ? (weatherData.spraySuitability.reasonHi || weatherData.spraySuitability.reasonMr) : weatherData.spraySuitability.reason}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
            marginTop: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                {t('soilMoisture')}:
              </span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-deep-forest)' }}>
                {lang === 'mr' ? weatherData.soilMoistureMr : lang === 'hi' ? (weatherData.soilMoistureHi || weatherData.soilMoistureMr) : weatherData.soilMoisture}
              </strong>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                {t('atmosphericPressure')}:
              </span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-deep-forest)' }}>
                {weatherData.pressure || '1012 hPa'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Hourly Forecast Strip */}
      {weatherData.hourlyForecast && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={18} color="var(--color-primary-green)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--color-deep-forest)' }}>
              {lang === 'mr' ? 'तासनिहाय फवारणी अनुकूलता आणि तापमान वक्र (पुढील २४ तास)' : lang === 'hi' ? 'घंटेवार छिड़काव अनुकूलता और तापमान वक्र (अगले २४ घंटे)' : 'Hourly Spray Suitability & Temperature Curve (Next 24 Hours)'}
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', overflowX: 'auto' }}>
            {weatherData.hourlyForecast.map((h, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  backgroundColor: h.spraySafe ? '#F1F8F3' : '#FFF8E1',
                  border: h.spraySafe ? '1.5px solid #A5D6A7' : '1px solid #FFE082'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>
                  {lang === 'mr' ? h.timeMr : lang === 'hi' ? (h.timeHi || h.timeMr) : h.time}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-forest)', margin: '4px 0', display: 'block' }}>
                  {h.temp}°C
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: h.spraySafe ? '#2E7D32' : '#F57C00',
                  color: 'white',
                  display: 'inline-block'
                }}>
                  {h.spraySafe ? t('spraySafe') : t('sprayDelay')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Accurate Agricultural Forecast */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--color-primary-green)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-deep-forest)' }}>
              {t('forecast7Days')}
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lang === 'mr' ? 'अचूक ७ दिवसांचा कृषी अंदाज' : lang === 'hi' ? 'सटीक ७ दिनों का कृषि पूर्वानुमान' : 'High-precision 7-day outlook'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', overflowX: 'auto' }}>
          {weatherData.forecast.map((f, idx) => (
            <div
              key={idx}
              style={{
                textAlign: 'center',
                padding: '16px 10px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-soft-surface)',
                border: '1px solid rgba(47, 125, 74, 0.15)',
                minWidth: '100px'
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-deep-forest)', display: 'block', marginBottom: '8px' }}>
                {lang === 'mr' ? f.dayMr : lang === 'hi' ? (f.dayHi || f.dayMr) : f.day}
              </span>
              <div style={{ margin: '8px 0', fontSize: '24px' }}>
                {f.rainChance > 50 ? '🌧️' : f.rainChance > 20 ? '⛅' : '☀️'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-deep-forest)' }}>{f.tempMax}°</span>
                <span style={{ color: 'var(--text-muted)' }}>{f.tempMin}°</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: f.rainChance > 50 ? '#1565C0' : 'var(--text-muted)', fontWeight: 600 }}>
                {f.rainChance > 0 ? `${lang === 'mr' ? 'पाऊस' : lang === 'hi' ? 'बारिश' : 'Rain'}: ${f.rainChance}%` : (lang === 'mr' ? 'निरभ्र आकाश' : lang === 'hi' ? 'साफ आसमान' : 'Dry Sky')}
              </div>
              {f.rainfallMm && (
                <span style={{ fontSize: '0.65rem', color: '#1E88E5', display: 'block', marginTop: '2px' }}>
                  {f.rainfallMm}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-Stage Location Selector Modal */}
      <TwoStageLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSaved={({ city, locality }) => {
          setSelectedCity(city);
          setSelectedLocality(locality);
          updateLocation({ city, district: city, locality });
        }}
      />


      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={() => setShowLoginReminder(false)}
        onNavigateAuth={() => {
          setShowLoginReminder(false);
          window.dispatchEvent(new CustomEvent('shet_navigate_page', { detail: 'auth' }));
        }}
        title={lang === 'mr' ? 'GPS हवामानासाठी कृपया लॉगिन करा' : lang === 'hi' ? 'GPS मौसम के लिए कृपया लॉगिन करें' : 'Sign In Required for GPS Weather'}
        message={lang === 'mr' 
          ? 'थेट GPS द्वारे शेताचे अचूक हवामान, पावसाचा अंदाज व फवारणी अनुकूल वेळ मिळवण्यासाठी कृपया प्रथम लॉगिन किंवा साइन इन करा.' 
          : 'Live farm GPS weather forecasts, spray suitability indices, and rain radar require an active account to link to your farm profile.'}
      />
    </div>
  );
}
