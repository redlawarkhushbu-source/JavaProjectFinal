import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api, MOCK_WEATHER_DATA } from '../services/api';
import { 
  Sprout, 
  CloudSun, 
  Layers, 
  Maximize2, 
  AlertTriangle, 
  Box, 
  ScanLine, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  Compass
} from 'lucide-react';
import TwoStageLocationModal from '../components/TwoStageLocationModal';

export default function DashboardPage({ setCurrentPage, onOpenVoice }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [weather, setWeather] = useState(MOCK_WEATHER_DATA);
  const [nearestSupplier, setNearestSupplier] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const acts = await api.getRecentActivities();
      setActivities(acts);
    }
    init();
  }, []);

  // Dynamically load weather and nearby supplier whenever user's location changes
  useEffect(() => {
    async function loadLocationData() {
      const activeLoc = user?.locality 
        ? { city: user?.city || user?.district, locality: user?.locality, lat: user?.lat, lng: user?.lng, location: user?.location }
        : (user?.district || user?.city || user?.location || 'Mumbai');
      
      const [wData, supps] = await Promise.all([
        api.getWeather(activeLoc),
        api.getSuppliers({
          city: user?.city || user?.district || 'Mumbai',
          locality: user?.locality || '',
          lat: user?.lat,
          lng: user?.lng
        })
      ]);

      if (wData) setWeather(wData);
      if (supps && supps.length > 0) setNearestSupplier(supps[0]);
    }
    loadLocationData();
  }, [user?.location, user?.district, user?.city, user?.locality, user?.lat, user?.lng]);

  return (
    <div style={{ padding: '28px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Greeting & Farm Selector Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
            {t('greeting')}, {user ? (lang === 'mr' ? (user?.fullNameMr || user?.fullName) : lang === 'hi' ? (user?.fullNameHi || user?.fullName) : user?.fullName) : (lang === 'mr' ? 'शेतकरी मित्र' : lang === 'hi' ? 'किसान मित्र' : 'Farmer Friend')}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {lang === 'mr' 
              ? 'आपल्या शेताची आजची स्थिती निरोगी आणि समाधानकारक आहे.' 
              : lang === 'hi'
              ? 'आपके खेत की आज की स्थिति स्वस्थ और संतोषजनक है।'
              : 'Your farmland is looking healthy today. All systems operational.'}
          </p>
        </div>

        {/* Interactive Two-Stage Farm & Location Selector */}
        <div 
          onClick={() => setIsLocationModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--color-card-surface)',
            padding: '10px 18px',
            borderRadius: '16px',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary-green)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          title={lang === 'mr' ? 'स्थान बदलण्यासाठी येथे क्लिक करा' : 'Click to change location or switch between City & Local area'}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: user?.stage === 2 ? 'rgba(46, 125, 50, 0.12)' : 'rgba(21, 101, 192, 0.12)',
            color: user?.stage === 2 ? '#2E7D32' : '#1565C0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {t('activeFarm')} • {user?.stage === 2 
                  ? (lang === 'mr' ? '🎯 टप्पा २: गल्ली/परिसर' : lang === 'hi' ? '🎯 चरण २: अति-स्थानीय' : '🎯 Stage 2: Hyper-Local') 
                  : (lang === 'mr' ? '🏙️ टप्पा १: शहर पातळी' : lang === 'hi' ? '🏙️ चरण १: शहर स्तर' : '🏙️ Stage 1: City Overview')}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-green)', fontWeight: 800 }}>
                [{lang === 'mr' ? 'स्थान बदला ⌵' : lang === 'hi' ? 'स्थान बदलें ⌵' : 'Change ⌵'}]
              </span>
            </div>
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-deep-forest)', display: 'block' }}>
              {user?.location || (lang === 'mr' ? 'मुंबई, महाराष्ट्र' : 'Mumbai, Maharashtra')} • {user?.farmArea || 2.4} {lang === 'mr' ? 'एकर' : lang === 'hi' ? 'एकड़' : 'Acres'}
            </span>
          </div>
        </div>
      </div>

      {/* Deferred Location Setup Banner for Logged-In Users */}
      {user && user.locationConfigured === false && (
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1.5px solid #86EFAC',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A',
              flexShrink: 0
            }}>
              <MapPin size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '0.98rem', fontWeight: 700, color: '#166534' }}>
                {lang === 'mr' ? 'शेताचे स्थान सेट करा (टप्पा १ व टप्पा २)' : 'Complete Farm Profile: Set Location'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#15803D' }}>
                {lang === 'mr' 
                  ? 'अचूक हवामान अंदाज, उपग्रह नकाशे आणि स्थानिक खत-बियाणे दुकाने पाहण्यासाठी आपले शहर किंवा GPS स्थान निवडा.'
                  : 'Select your district or auto-detect GPS for hyper-local microclimate alerts, satellite views, and Krishi Kendras.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Compass size={16} />
            <span>{lang === 'mr' ? 'आता स्थान निवडा' : 'Set Farm Location Now'}</span>
          </button>
        </div>
      )}

      {/* Guest Reminder Banner */}
      {!user && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1.5px solid #FCD34D',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '0.94rem', fontWeight: 700, color: '#92400E' }}>
                {lang === 'mr' ? 'आपण पाहुणे मोडमध्ये आहात' : 'You are currently browsing as a Guest'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#B45309' }}>
                {lang === 'mr' 
                  ? 'शेताचे GPS स्थान सुरक्षितपणे सेव्ह करण्यासाठी आणि सर्व फीचर्स अनलॉक करण्यासाठी कृपया लॉगिन करा.'
                  : 'Sign in with Google, Phone OTP, or Email to save your farm coordinates and unlock full capabilities.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('auth')}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <span>{lang === 'mr' ? 'लॉगिन / नोंदणी करा' : 'Sign In / Register'}</span>
          </button>
        </div>
      )}

      {/* Weather Alert Banner */}
      {weather.alert && (
        <div className="alert-box alert-warning" style={{ padding: '16px 20px', marginBottom: '28px' }}>
          <AlertTriangle size={22} color="var(--semantic-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#7A4F00' }}>
                {lang === 'mr' ? weather.alert.titleMr : lang === 'hi' ? (weather.alert.titleHi || weather.alert.title) : weather.alert.title}
              </strong>
              <p style={{ fontSize: '0.82rem', color: '#5C3C00', marginTop: '2px' }}>
                {lang === 'mr' ? weather.alert.actionMr : lang === 'hi' ? (weather.alert.actionHi || weather.alert.action) : weather.alert.action}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('weather')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <span>{t('checkWeather')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards Grid (Matching Official AgriVision Spec) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Crop Health */}
        <div className="card card-interactive" onClick={() => setCurrentPage('diagnosis')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('cropHealth')}
            </span>
            <span className="badge badge-success">
              {t('healthy')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-deep-forest)', lineHeight: 1 }}>
              86%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-green)', fontWeight: 600 }}>
              {lang === 'mr' ? '+३% या आठवड्यात' : lang === 'hi' ? '+३% इस सप्ताह' : '+3% this week'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {lang === 'mr' ? 'शेवटचे विश्लेषण २ तासांपूर्वी • टोमॅटो प्लॉट' : lang === 'hi' ? 'अंतिम विश्लेषण २ घंटे पहले • टमाटर प्लॉट' : 'Last analyzed 2 hours ago • Tomato Plot'}
          </p>
        </div>

        {/* Card 2: Current Weather (Dynamically bound to selected location) */}
        <div className="card card-interactive" onClick={() => setCurrentPage('weather')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('currentWeather')}
            </span>
            <span className="badge badge-weather">
              {lang === 'mr' 
                ? `पाऊस ${weather.rainProbability || 15}%` 
                : lang === 'hi' 
                ? `बारिश ${weather.rainProbability || 15}%` 
                : `Rain ${weather.rainProbability || 15}%`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-deep-forest)', lineHeight: 1 }}>
              {weather.temperature}°C
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {lang === 'mr' ? weather.conditionMr : lang === 'hi' ? (weather.conditionHi || weather.condition) : weather.condition}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {lang === 'mr' 
              ? `आद्रता ${weather.humidity}% • वारा ${weather.windSpeed} किमी/तास • ${weather.locationMr || user?.location}` 
              : lang === 'hi' 
              ? `आर्द्रता ${weather.humidity}% • हवा ${weather.windSpeed} किमी/घंटा • ${weather.locationHi || user?.location}` 
              : `Humidity ${weather.humidity}% • Wind ${weather.windSpeed} km/h • ${weather.location || user?.location}`}
          </p>
        </div>

        {/* Card 3: Soil Condition */}
        <div className="card card-interactive" onClick={() => setCurrentPage('3dfarm')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('soilCondition')}
            </span>
            <span className="badge badge-info">
              {lang === 'mr' ? 'मध्यम' : lang === 'hi' ? 'मध्यम' : 'Moderate'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-deep-forest)', lineHeight: 1 }}>
              {lang === 'mr' ? 'काळी माती' : lang === 'hi' ? 'काली मिट्टी' : 'Black Soil'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-green)', fontWeight: 600 }}>
              pH 6.8
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {lang === 'mr' ? 'ओलावा ३८% VWC • फुटव्यांसाठी उत्तम' : lang === 'hi' ? 'नमी ३८% VWC • कल्ले फूटने के लिए उपयुक्त' : 'Moisture 38% VWC • Optimal for tillering'}
          </p>
        </div>

        {/* Card 4: Farm Area */}
        <div className="card card-interactive" onClick={() => setCurrentPage('3dfarm')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('farmArea')}
            </span>
            <span className="badge badge-success">
              {lang === 'mr' ? 'लागवड केलेले' : lang === 'hi' ? 'खेती की गई' : 'Cultivated'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-deep-forest)', lineHeight: 1 }}>
              2.4
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {lang === 'mr' ? 'एकर' : lang === 'hi' ? 'एकड़' : 'Acres'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {lang === 'mr' ? 'प्लॉट A: टोमॅटो (१.२ एकर) • प्लॉट B: ऊस (१.२ एकर)' : lang === 'hi' ? 'प्लॉट A: टमाटर (१.२ एकड़) • प्लॉट B: गन्ना (१.२ एकड़)' : 'Plot A: Tomato (1.2 Ac) • Plot B: Cane (1.2 Ac)'}
          </p>
        </div>
      </div>

      {/* Main Farm Preview Feature Banner & Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '24px',
        marginBottom: '28px'
      }} className="farm-preview-grid">
        {/* Farm 3D Preview Banner Card */}
        <div className="card" style={{
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <img
            src="/assets/hero-bg.jpg"
            alt="Farm 3D Preview"
            style={{ width: '100%', height: '320px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(7, 31, 23, 0.95), rgba(7, 31, 23, 0.5), transparent)',
            padding: '24px 28px',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '6px' }}>
                {lang === 'mr' ? 'परस्परसंवादी ३D सिम्युलेटर' : lang === 'hi' ? 'इंटरैक्टिव ३D सिम्युलेटर' : 'Interactive 3D Simulator'}
              </span>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.4rem', margin: 0 }}>
                {lang === 'mr' ? 'शिवाजी कृषी शेतजमीन' : lang === 'hi' ? 'शिवाजी कृषि खेत भूमि' : 'Shivaji Agricultural Farmland'}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                {lang === 'mr' ? 'माती: काळी कसदार रेगुर • सिंचन: ठिबक जोडलेले • हवामान: सूर्यप्रकाश' : lang === 'hi' ? 'मिट्टी: काली कपास रेगुर • सिंचाई: ड्रिप जुड़ी हुई • मौसम: धूप' : 'Soil: Black Soil (Regur) • Irrigation: Drip Connected • Weather: Sunny'}
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('3dfarm')}
              className="btn btn-accent"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Box size={18} />
              <span>{t('open3DFarm')}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
              {t('quickActions')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('diagnosis')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--semantic-ai-bg)',
                  color: 'var(--semantic-ai)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScanLine size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>{t('diagnoseCrop')}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lang === 'mr' ? 'रोगांसाठी पानांचे स्कॅनिंग' : lang === 'hi' ? 'रोगों के लिए पत्ती स्कैनिंग' : 'Scan leaf for diseases'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('3dfarm')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-soft-surface)',
                  color: 'var(--color-primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>{t('open3DFarm')}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lang === 'mr' ? '३D शेती मांडणी एक्सप्लोर करा' : lang === 'hi' ? '३D खेत विन्यास देखें' : 'Explore 3D field layout'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('weather')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--semantic-weather-bg)',
                  color: 'var(--semantic-weather)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CloudSun size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>{t('checkWeather')}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lang === 'mr' ? '७ दिवसांचा कृषी हवामान अंदाज' : lang === 'hi' ? '७ दिनों का कृषि मौसम पूर्वानुमान' : '7-day farming forecast'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('suppliers')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--semantic-success-bg)',
                  color: 'var(--semantic-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Store size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>{t('findSuppliers')}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lang === 'mr' ? 'नजीकची खते व बियाणे दुकाने' : lang === 'hi' ? 'निकटतम उर्वरक व बीज विक्रेता' : 'Fertilizer & seed shops'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Voice Prompt Action */}
          <div
            onClick={onOpenVoice}
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-soft-surface)',
              border: '1px solid rgba(47, 125, 74, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--color-primary-green)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
                {lang === 'mr' ? 'शेत समर्थन व्हॉइस AI ला विचारा' : lang === 'hi' ? 'शेत समर्थन वॉइस AI से पूछें' : 'Ask Shet Samarthan Voice AI'}
              </span>
            </div>
            <ArrowRight size={14} color="var(--color-primary-green)" />
          </div>
        </div>
      </div>

      {/* Today's Advisory & Recent Activity Bottom Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px'
      }} className="dashboard-bottom-grid">
        {/* Today's Farm Advisory */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
              {t('todayAdvisory')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'स्रोत: म.फु.कृ.वि. राहुरी व भारतीय हवामान विभाग' : lang === 'hi' ? 'स्रोत: राहुरी कृषि वि.वि. व भारत मौसम विभाग' : 'Source: MPKV Rahuri & IMD'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-soft-surface)',
              border: '1px solid rgba(47, 125, 74, 0.15)'
            }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-deep-forest)', display: 'block', marginBottom: '4px' }}>
                {lang === 'mr' ? 'टोमॅटो फवारणी वेळ सल्ला:' : lang === 'hi' ? 'टमाटर छिड़काव समय परामर्श:' : 'Tomato Spray Window Advisory:'}
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {lang === 'mr' 
                  ? 'उद्याच्या संभाव्य पावसापूर्वी आज संध्याकाळी ४:०० ते ६:३० दरम्यान प्रतिबंधात्मक जैविक फवारणीसाठी (कडुनिंब तेल ५ मि.ली./लि.) अनुकूल वेळ आहे.' 
                  : lang === 'hi'
                  ? 'कल की संभावित बारिश से पहले आज शाम ४:०० से ६:३० के बीच निवारक जैविक छिड़काव (नीम तेल ५ मिली/ली) के लिए अनुकूल समय है।'
                  : 'Favorable weather window for preventive biological spraying (Neem Oil 5ml/L) exists today between 4:00 PM and 6:30 PM before tomorrow\'s rain.'}
              </p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-main-bg)',
              border: '1px solid var(--border-light)'
            }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-deep-forest)', display: 'block', marginBottom: '4px' }}>
                {lang === 'mr' ? 'ऊस फुटवे सिंचन सल्ला:' : lang === 'hi' ? 'गन्ना कल्ले विकास सिंचाई परामर्श:' : 'Sugarcane Tillering Irrigation:'}
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {lang === 'mr'
                  ? 'मातीतील ओलावा सध्या ३८% असून पाऊस पडण्याची शक्यता असल्याने उद्या सकाळचे ठिबक सिंचन पुढे ढकलावे.'
                  : lang === 'hi'
                  ? 'मिट्टी में नमी वर्तमान में ३८% है और बारिश की संभावना के कारण कल सुबह की ड्रिप सिंचाई टाल दें।'
                  : 'Hold drip irrigation scheduled for tomorrow morning since soil moisture level is currently 38% and substantial precipitation is expected.'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
            {t('recentActivity')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: act.badgeColor === 'warning' ? 'var(--semantic-warning-bg)' :
                                   act.badgeColor === 'info' ? 'var(--semantic-ai-bg)' : 'var(--semantic-success-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {act.type === 'diagnosis' ? <ScanLine size={16} color="var(--semantic-warning)" /> :
                   act.type === 'weather' ? <CloudSun size={16} color="var(--semantic-ai)" /> :
                   <CheckCircle2 size={16} color="var(--semantic-success)" />}
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-deep-forest)', display: 'block' }}>
                    {lang === 'mr' ? act.titleMr : lang === 'hi' ? (act.titleHi || act.title) : act.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {act.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Stage Location Switcher Modal */}
      <TwoStageLocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
    </div>
  );
}
