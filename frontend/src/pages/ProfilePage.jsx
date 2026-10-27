import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Sprout, 
  Layers, 
  Save, 
  CheckCircle2,
  Mic,
  MicOff
} from 'lucide-react';
import { getSafeAvatar } from '../utils/avatarUtils';
import LoginReminderModal from '../components/LoginReminderModal';
import { INDIAN_AGRI_LOCATIONS, findLocationByQuery } from '../services/api';
import { audioService } from '../services/audioService';

export default function ProfilePage() {
  const { lang, t } = useLanguage();
  const { user, setUser, updateLocation } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Farmer');
  const [fullNameMr, setFullNameMr] = useState(user?.fullNameMr || 'शेतकरी');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || user?.city || 'Mumbai');
  const [locality, setLocality] = useState(user?.locality || user?.village || '');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [farmArea, setFarmArea] = useState(user?.farmArea || 2.4);
  const [primaryCrop, setPrimaryCrop] = useState(user?.primaryCrop || 'Cotton & Soybean');
  const [soilType, setSoilType] = useState(user?.soilType || 'Black Soil (Regur)');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);

  const handleDistrictChange = (newDistrict) => {
    setDistrict(newDistrict);
  };

  const handleGpsDetect = () => {
    if (!user) {
      setShowLoginReminder(true);
      return;
    }
    if (!navigator.geolocation) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये GPS समर्थित नाही.' : 'Geolocation not supported.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        let nearest = INDIAN_AGRI_LOCATIONS[0];
        let minDist = 999999;
        INDIAN_AGRI_LOCATIONS.forEach(l => {
          const d = Math.hypot(latitude - l.lat, longitude - l.lng);
          if (d < minDist) {
            minDist = d;
            nearest = l;
          }
        });
        setDistrict(nearest.id);
        setLocality(`GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
      },
      (err) => {
        setGpsLoading(false);
        alert('Could not retrieve GPS location: ' + err.message);
      }
    );
  };

  const handleVoiceInput = () => {
    if (isVoiceListening) {
      audioService.stopListening();
      setIsVoiceListening(false);
      return;
    }
    setIsVoiceListening(true);
    audioService.listenOnce({
      language: lang,
      onResult: (text) => {
        setIsVoiceListening(false);
        if (text) {
          setLocality(text);
        }
      },
      onError: () => setIsVoiceListening(false),
      onEnd: () => setIsVoiceListening(false)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const locMatch = findLocationByQuery(district);
    const cleanLocality = locality.trim();
    const formattedLoc = cleanLocality 
      ? `${cleanLocality}, ${district}, Maharashtra`
      : `${district}, Maharashtra`;

    const updated = {
      ...user,
      fullName,
      fullNameMr,
      phone,
      city: district,
      district: district,
      locality: cleanLocality,
      village: cleanLocality,
      address: formattedLoc,
      location: formattedLoc,
      stage: cleanLocality.length > 0 ? 2 : 1,
      lat: locMatch.lat,
      lng: locMatch.lng,
      farmArea: Number(farmArea),
      primaryCrop,
      soilType
    };
    setUser(updated);
    localStorage.setItem('shet_user', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem' }}>{t('navProfile')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {lang === 'mr' 
            ? 'तुमची शेती रचना आणि वैयक्तिक शेतकरी माहिती व्यवस्थापित करा.' 
            : lang === 'hi' 
            ? 'अपने खेत का विन्यास और व्यक्तिगत किसान विवरण प्रबंधित करें।' 
            : 'Manage your farm configuration and personal farmer details.'}
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {savedSuccess && (
          <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={18} color="var(--semantic-success)" />
            <span>
              {lang === 'mr' 
                ? 'माहिती यशस्वीरित्या जतन करण्यात आली!' 
                : lang === 'hi' 
                ? 'प्रोफ़ाइल और खेत विवरण सफलतापूर्वक सहेजे गए!' 
                : 'Profile and farm details successfully saved!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <img
              src={getSafeAvatar(user)}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getSafeAvatar(user?.fullName || 'Farmer');
              }}
              alt={user?.fullName}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary-green)' }}
            />
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                {lang === 'mr' ? fullNameMr : lang === 'hi' ? fullNameMr : fullName}
              </h2>
              <span className="badge badge-success" style={{ marginTop: '6px' }}>
                {lang === 'mr' ? 'प्रमाणित शेतकरी खाते' : lang === 'hi' ? 'सत्यापित किसान खाता' : 'Verified Farmer Account'}
              </span>
            </div>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'पूर्ण नाव (इंग्रजीत)' : lang === 'hi' ? 'पूरा नाम (अंग्रेजी में)' : 'Full Name (English)'}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'पूर्ण नाव (मराठीत)' : lang === 'hi' ? 'पूरा नाम (हिंदी में)' : 'Full Name (Regional)'}</label>
              <input
                type="text"
                value={fullNameMr}
                onChange={(e) => setFullNameMr(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'मोबाईल नंबर' : lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{lang === 'mr' ? 'टप्पा १: मुख्य जिल्हा / शहर' : 'Stage 1: Main District / City'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-green)', fontWeight: 700 }}>
                  {district}
                </span>
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="form-control"
              >
                {INDIAN_AGRI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label} — {loc.region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage 2: Specific Local Area / Village */}
          <div style={{
            backgroundColor: 'var(--color-soft-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '16px 18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  {lang === 'mr' ? 'टप्पा २: स्थानिक गल्ली / गाव / पत्ता (स्थानिक विक्रेत्यांसाठी)' : 'Stage 2: Village / Locality / Street Address (For Nearest Stores)'}
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {lang === 'mr' ? 'अचूक १ ते ५ किमी अंतरावर विक्रेते शोधण्यासाठी गाव/गल्ली प्रविष्ट करा' : 'Enter specific area to sort Krishi Kendras within 1–5 km'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={gpsLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-card-surface)',
                  border: '1.5px solid var(--color-primary-green)',
                  color: 'var(--color-primary-green)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: gpsLoading ? 'wait' : 'pointer'
                }}
              >
                <span>📍 {gpsLoading ? (lang === 'mr' ? 'शोधत आहे...' : 'Locating...') : (lang === 'mr' ? 'GPS ने शोधा' : 'Auto-Detect GPS')}</span>
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={isVoiceListening ? (lang === 'mr' ? '🎙️ ऐकत आहे... गाव किंवा परिसर बोला...' : lang === 'hi' ? '🎙️ सुन रहा हूँ... गांव या क्षेत्र बोलें...' : '🎙️ Listening... speak locality...') : (lang === 'mr' ? 'उदा. दादर पश्चिम, सेनापती बापट मार्ग / वाशी सेक्टर १९ / हवेली' : lang === 'hi' ? 'उदा. दादर पश्चिम, सेनापति बापट मार्ग / वाशी सेक्टर १९ / हवेली' : 'e.g. Dadar West, Senapati Bapat Marg / Vashi APMC / Haveli')}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="form-control"
                style={{
                  paddingRight: '42px',
                  borderColor: isVoiceListening ? 'var(--color-primary-green)' : undefined,
                  boxShadow: isVoiceListening ? '0 0 0 3px rgba(47, 125, 74, 0.2)' : undefined
                }}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isVoiceListening ? '#EF4444' : 'rgba(47, 125, 74, 0.1)',
                  color: isVoiceListening ? '#FFFFFF' : 'var(--color-primary-green)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={lang === 'mr' ? 'बोलून स्थान सांगा' : lang === 'hi' ? 'बोलकर स्थान बताएं' : 'Speak locality'}
              >
                {isVoiceListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.76rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {lang === 'mr' ? 'सक्रिय जतन होणारे शेत स्थान:' : 'Formatted Active Location:'}
                <strong style={{ color: 'var(--color-deep-forest)', marginLeft: '6px' }}>
                  {locality.trim() ? `${locality.trim()}, ${district}, Maharashtra` : `${district}, Maharashtra`}
                </strong>
              </span>

              <span className={`badge ${locality.trim() ? 'badge-success' : 'badge-weather'}`} style={{ fontSize: '0.68rem' }}>
                {locality.trim() ? (lang === 'mr' ? '🎯 टप्पा २: हायपर-लोकल' : '🎯 Stage 2 Active') : (lang === 'mr' ? '🏙️ टप्पा १: शहर पातळी' : '🏙️ Stage 1 Active')}
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', margin: '24px 0 16px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            {lang === 'mr' ? 'शेतजमीन तपशील व रचना' : lang === 'hi' ? 'खेत भूमि विवरण व विन्यास' : 'Farmland Configuration'}
          </h3>

          <div className="form-grid-3" style={{ marginBottom: '28px' }}>
            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'एकूण क्षेत्र (एकर)' : lang === 'hi' ? 'कुल क्षेत्र (एकड़)' : 'Total Land Area (Acres)'}</label>
              <input
                type="number"
                step="0.1"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'प्रमुख पिके' : lang === 'hi' ? 'प्रमुख फसलें' : 'Primary Crops'}</label>
              <input
                type="text"
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'mr' ? 'मातीचा प्रकार' : lang === 'hi' ? 'मिट्टी का प्रकार' : 'Soil Classification'}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="form-control"
              >
                <option value="Black Soil (Regur)">{lang === 'mr' ? 'काळी कसदार रेगुर माती' : lang === 'hi' ? 'काली कपास मिट्टी' : 'Black Soil (Regur)'}</option>
                <option value="Red Soil">{lang === 'mr' ? 'लाल माती' : lang === 'hi' ? 'लाल मिट्टी' : 'Red Soil'}</option>
                <option value="Alluvial Soil">{lang === 'mr' ? 'गाळाची माती' : lang === 'hi' ? 'जलोढ़ मिट्टी' : 'Alluvial Soil'}</option>
                <option value="Sandy Loam">{lang === 'mr' ? 'वालुकामय पोयटा' : lang === 'hi' ? 'बलुई दोमट' : 'Sandy Loam'}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            <Save size={18} />
            <span>{lang === 'mr' ? 'माहिती सेव्ह करा' : lang === 'hi' ? 'विवरण सुरक्षित करें' : 'Save Farm Changes'}</span>
          </button>
        </form>
      </div>
      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={() => setShowLoginReminder(false)}
        onNavigateAuth={() => {
          setShowLoginReminder(false);
          window.dispatchEvent(new CustomEvent('shet_navigate_page', { detail: 'auth' }));
        }}
        title={lang === 'mr' ? 'GPS शेत स्थानासाठी कृपया लॉगिन करा' : lang === 'hi' ? 'GPS खेत स्थान के लिए कृपया लॉगिन करें' : 'Sign In Required for Farm GPS'}
        message={lang === 'mr' 
          ? 'थेट GPS स्थान आपल्या शेतकरी खात्याशी सुरक्षित जोडले जाते. कृपया प्रथम लॉगिन किंवा साइन इन करा.' 
          : 'Live farm GPS coordinates require an active account to be saved to your farm profile.'}
      />
    </div>
  );
}
