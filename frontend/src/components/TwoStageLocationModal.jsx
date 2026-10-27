import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { INDIAN_AGRI_LOCATIONS, findLocationByQuery, calculateDistanceKm } from '../services/api';
import { 
  MapPin, 
  X, 
  Navigation, 
  CheckCircle2, 
  Building2, 
  Compass, 
  Mic, 
  MicOff, 
  Search, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LocateFixed,
  Store,
  CloudSun
} from 'lucide-react';
import LoginReminderModal from './LoginReminderModal';
import { audioService } from '../services/audioService';

// Recommended popular localities for key agricultural and metropolitan centers in Maharashtra
const CITY_LOCALITIES = {
  Mumbai: [
    { name: 'Dadar West', nameMr: 'दादर पश्चिम', lat: 19.0178, lng: 72.8478 },
    { name: 'APMC Vashi', nameMr: 'एपीएमसी वाशी', lat: 19.0771, lng: 73.0033 },
    { name: 'Borivali West', nameMr: 'बोरिवली पश्चिम', lat: 19.2307, lng: 72.8567 },
    { name: 'Andheri East', nameMr: 'अंधेरी पूर्व', lat: 19.1136, lng: 72.8697 },
    { name: 'Panvel / Raigad', nameMr: 'पनवेल / रायगड', lat: 18.9894, lng: 73.1175 },
    { name: 'Thane West', nameMr: 'ठाणे पश्चिम', lat: 19.1860, lng: 72.9754 }
  ],
  Pune: [
    { name: 'Haveli', nameMr: 'हवेली', lat: 18.4682, lng: 73.8790 },
    { name: 'Market Yard / Gultekdi', nameMr: 'मार्केट यार्ड / गुलटेकडी', lat: 18.4985, lng: 73.8672 },
    { name: 'Hadapsar', nameMr: 'हडपसर', lat: 18.5089, lng: 73.9259 },
    { name: 'Khed Shivapur', nameMr: 'खेड शिवापूर', lat: 18.3541, lng: 73.8569 },
    { name: 'Rajgurunagar (Khed)', nameMr: 'राजगुरूनगर (खेड)', lat: 18.8558, lng: 73.9056 },
    { name: 'Baramati', nameMr: 'बारामती', lat: 18.1517, lng: 74.5771 },
    { name: 'MIDC Bhosari', nameMr: 'एमआयडीसी भोसरी', lat: 18.6279, lng: 73.8443 }
  ],
  Nashik: [
    { name: 'Dindori Road', nameMr: 'दिंडोरी रोड', lat: 20.0125, lng: 73.7910 },
    { name: 'Mohadi Agro Hub', nameMr: 'मोहाडी ॲग्रो हब', lat: 20.0712, lng: 73.8432 },
    { name: 'Panchavati', nameMr: 'पंचवटी', lat: 20.0094, lng: 73.7997 },
    { name: 'Niphad Grape Belt', nameMr: 'निफाड द्राक्ष पट्टा', lat: 20.0722, lng: 74.1089 }
  ],
  Nagpur: [
    { name: 'Cotton Market', nameMr: 'कॉटन मार्केट', lat: 21.1400, lng: 79.0900 },
    { name: 'Kalmeshwar Citrus Hub', nameMr: 'कळमेश्वर संत्रा पट्टा', lat: 21.2333, lng: 78.9167 },
    { name: 'Hingna', nameMr: 'हिंगणा', lat: 21.0667, lng: 78.9667 }
  ],
  Kolhapur: [
    { name: 'Karveer', nameMr: 'करवीर', lat: 16.7050, lng: 74.2433 },
    { name: 'Shirol Sugarcane Belt', nameMr: 'शिरोळ ऊस पट्टा', lat: 16.7456, lng: 74.5982 },
    { name: 'Hatkanangle', nameMr: 'हातकणंगले', lat: 16.7500, lng: 74.4500 }
  ]
};

export default function TwoStageLocationModal({ isOpen, onClose, onLocationSaved }) {
  const { lang } = useLanguage();
  const { user, updateLocation } = useAuth();

  const [stage, setStage] = useState(user?.stage || 1);
  const [selectedCity, setSelectedCity] = useState(user?.district || user?.city || 'Mumbai');
  const [locality, setLocality] = useState(user?.locality || user?.village || '');
  const [address, setAddress] = useState(user?.address || '');
  const [userCoords, setUserCoords] = useState({ lat: user?.lat || 19.0760, lng: user?.lng || 72.8777 });
  const [isGpsActive, setIsGpsActive] = useState(Boolean(user?.isGps));
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

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
          setAddress(`${text}, ${selectedCity}, Maharashtra`);
          setStage(2);
        }
      },
      onError: () => {
        setIsVoiceListening(false);
      },
      onEnd: () => {
        setIsVoiceListening(false);
      }
    });
  };
  const [showLoginReminder, setShowLoginReminder] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeCity = user?.district || user?.city || 'Mumbai';
      setSelectedCity(activeCity);
      setLocality(user?.locality || user?.village || '');
      setAddress(user?.address || user?.location || '');
      setUserCoords({ lat: user?.lat || 19.0760, lng: user?.lng || 72.8777 });
      setStage(user?.stage || (user?.locality ? 2 : 1));
      setSaveSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const currentLocData = findLocationByQuery(selectedCity);
  const availableLocalities = CITY_LOCALITIES[selectedCity] || [
    { name: 'Main Agricultural Market', nameMr: 'मुख्य कृषी बाजार', lat: currentLocData.lat, lng: currentLocData.lng },
    { name: 'Gram Panchayat Area', nameMr: 'ग्रामपंचायत परिसर', lat: currentLocData.lat + 0.02, lng: currentLocData.lng + 0.02 }
  ];

  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId);
    const locInfo = findLocationByQuery(cityId);
    setUserCoords({ lat: locInfo.lat, lng: locInfo.lng });
    // Reset specific locality when switching city in Stage 1
    setLocality('');
    setAddress(`${cityId}, Maharashtra`);
    setIsGpsActive(false);
  };

  const handleLocalitySelect = (locObj) => {
    setLocality(locObj.name);
    setUserCoords({ lat: locObj.lat, lng: locObj.lng });
    setAddress(`${locObj.name}, ${selectedCity}, Maharashtra`);
    setStage(2);
    setIsGpsActive(false);
  };

  const handleGpsDetect = () => {
    if (!user) {
      setShowLoginReminder(true);
      return;
    }
    if (!navigator.geolocation) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये GPS समर्थित नाही.' : 'GPS Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setIsGpsActive(true);
        setStage(2);
        
        // Find nearest city
        let nearestCity = INDIAN_AGRI_LOCATIONS[0];
        let minDist = 999999;
        INDIAN_AGRI_LOCATIONS.forEach(l => {
          const d = calculateDistanceKm(latitude, longitude, l.lat, l.lng);
          if (d != null && d < minDist) {
            minDist = d;
            nearestCity = l;
          }
        });
        setSelectedCity(nearestCity.id);
        const gpsLabel = `Live Farm GPS (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`;
        setLocality(gpsLabel);
        setAddress(`${gpsLabel}, ${nearestCity.id}, Maharashtra`);

        // Automatically update and persist location so it stays saved across login & logout
        updateLocation({
          city: nearestCity.id,
          district: nearestCity.id,
          locality: gpsLabel,
          village: gpsLabel,
          address: `${gpsLabel}, ${nearestCity.id}, Maharashtra`,
          stage: 2,
          lat: latitude,
          lng: longitude,
          isGps: true
        });
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS detection error:', err);
        // Prompt device settings instruction as requested
        alert(
          lang === 'mr'
            ? '📍 स्थान परवानगी आवश्यक: शेताचे अचूक GPS स्थान शोधण्यासाठी कृपया आपल्या डिव्हाइस किंवा ब्राउझर सेटिंग्जमध्ये (Settings > Privacy / Site Settings > Location > Allow) जाऊन स्थान परवानगी चालू करा.'
            : lang === 'hi'
            ? '📍 स्थान अनुमति आवश्यक: खेत का सटीक GPS स्थान खोजने के लिए कृपया अपनी डिवाइस या ब्राउज़र सेटिंग्स (Settings > Privacy / Site Settings > Location > Allow) में लोकेशन अनुमति चालू करें।'
            : '📍 Location Permission Required: Please open your device or browser Settings (Settings > Privacy & Security > Site Permissions > Location > Allow) to enable location services and auto-detect your farm.'
        );
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    const isStage2 = stage === 2 || (locality && locality.trim().length > 0);
    const resolvedLocality = isStage2 ? locality.trim() : '';

    updateLocation({
      city: selectedCity,
      district: selectedCity,
      locality: resolvedLocality,
      village: resolvedLocality,
      address: address || `${resolvedLocality ? resolvedLocality + ', ' : ''}${selectedCity}, Maharashtra`,
      stage: isStage2 ? 2 : 1,
      lat: userCoords.lat,
      lng: userCoords.lng,
      isGps: isGpsActive
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onLocationSaved) onLocationSaved({ city: selectedCity, locality: resolvedLocality, stage: isStage2 ? 2 : 1 });
      onClose();
    }, 600);
  };

  const popularCities = [
    { id: 'Mumbai', label: 'Mumbai (मुंबई)', badge: 'Coastal Belt' },
    { id: 'Pune', label: 'Pune (पुणे)', badge: 'Western Ghats' },
    { id: 'Nashik', label: 'Nashik (नाशिक)', badge: 'Grape Belt' },
    { id: 'Nagpur', label: 'Nagpur (नागपूर)', badge: 'Citrus & Cotton' },
    { id: 'Kolhapur', label: 'Kolhapur (कोल्हापूर)', badge: 'Sugarcane Valley' },
    { id: 'Thane', label: 'Thane (ठाणे)', badge: 'North Konkan' },
    { id: 'Baramati', label: 'Baramati (बारामती)', badge: 'Agri-Tech' },
    { id: 'Solapur', label: 'Solapur (सोलापूर)', badge: 'Pomegranate' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '24px 14px 80px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box'
    }}>
      <div className="location-modal modal-card" style={{
        backgroundColor: 'var(--color-card-surface)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '720px',
        margin: 'auto 0',
        maxHeight: 'none',
        boxShadow: 'var(--shadow-floating)',
        border: '1.5px solid var(--border-light)',
        color: 'var(--text-primary)',
        animation: 'fadeIn 0.2s ease-out',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1.5px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                backgroundColor: 'rgba(47, 125, 74, 0.12)',
                color: 'var(--color-primary-green)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Compass size={14} />
                {lang === 'mr' ? 'दोन-टप्पे स्थान निवड प्रणाली' : lang === 'hi' ? 'दो-चरणीय स्थान चयन प्रणाली' : 'Two-Stage Location Flow'}
              </span>
              <span style={{
                backgroundColor: stage === 2 ? '#E8F5E9' : '#E3F2FD',
                color: stage === 2 ? '#2E7D32' : '#1565C0',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {stage === 2 
                  ? (lang === 'mr' ? 'टप्पा २: गल्ली/परिसर सक्रिय' : lang === 'hi' ? 'चरण २: अति-स्थानीय सक्रिय' : 'Stage 2: Hyper-Local Active')
                  : (lang === 'mr' ? 'टप्पा १: शहर/जिल्हा सक्रिय' : lang === 'hi' ? 'चरण १: शहर/ज़िला सक्रिय' : 'Stage 1: City Overview Active')}
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', margin: '4px 0', color: 'var(--color-deep-forest)' }}>
              {lang === 'mr' ? 'शेती स्थान व परिसर निवडा' : lang === 'hi' ? 'खेत का स्थान और क्षेत्र चुनें' : 'Configure Farm Location'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {lang === 'mr' 
                ? 'टप्पा १ मध्ये शहर निवडा. टप्पा २ मध्ये अधिक अचूक माहितीसाठी गल्ली/गाव प्रविष्ट करा.' 
                : lang === 'hi'
                ? 'चरण १ में शहर चुनें। चरण २ में स्थानीय मौसम व दुकानों के लिए सटीक पता दर्ज करें।'
                : 'Stage 1 shows general city advisory; Stage 2 refines to local suppliers and micro-climate.'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Two-Stage Progress Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Stage 1 Tab */}
            <div 
              onClick={() => setStage(1)}
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                border: stage === 1 ? '2px solid var(--color-primary-green)' : '1.5px solid var(--border-light)',
                backgroundColor: stage === 1 ? 'rgba(47, 125, 74, 0.15)' : 'var(--color-card-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: stage === 1 ? 'var(--color-primary-green)' : '#9E9E9E',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>1</span>
                <strong style={{ fontSize: '0.9rem', color: stage === 1 ? 'var(--color-primary-green)' : 'var(--text-secondary)' }}>
                  {lang === 'mr' ? 'टप्पा १: शहर / जिल्हा' : lang === 'hi' ? 'चरण १: शहर / ज़िला' : 'Stage 1: City / District'}
                </strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '30px' }}>
                {selectedCity} ({currentLocData.region})
              </p>
            </div>

            {/* Stage 2 Tab */}
            <div 
              onClick={() => setStage(2)}
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                border: stage === 2 ? '2px solid var(--color-primary-green)' : '1.5px solid var(--border-light)',
                backgroundColor: stage === 2 ? 'rgba(47, 125, 74, 0.15)' : 'var(--color-card-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: stage === 2 ? 'var(--color-primary-green)' : '#9E9E9E',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>2</span>
                <strong style={{ fontSize: '0.9rem', color: stage === 2 ? 'var(--color-primary-green)' : 'var(--text-secondary)' }}>
                  {lang === 'mr' ? 'टप्पा २: गल्ली / परिसर / GPS' : lang === 'hi' ? 'चरण २: मुहल्ला / गाँव / GPS' : 'Stage 2: Local Address / GPS'}
                </strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '30px' }}>
                {locality || (lang === 'mr' ? 'पर्यायी: अचूक अंतर मिळवा' : 'Optional: get exact km distance')}
              </p>
            </div>
          </div>

          {/* STAGE 1: CITY / DISTRICT SELECTION */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
              {lang === 'mr' ? '१. प्रमुख कृषी जिल्हे व शहरे (क्लिक करा)' : lang === 'hi' ? '१. मुख्य कृषि ज़िले व शहर (क्लिक करें)' : '1. Select Major Agricultural City / District'}
            </label>

            {/* Quick City Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {popularCities.map((c) => {
                const isSelected = selectedCity === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCitySelect(c.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--color-primary-green)' : '1.5px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--color-primary-green)' : 'var(--color-card-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(18, 55, 42, 0.18)' : 'none'
                    }}
                  >
                    <Building2 size={14} color={isSelected ? '#FFFFFF' : 'var(--color-primary-green)'} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* All Indian Agri Locations Dropdown */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.88rem', padding: '10px 14px' }}
              >
                {INDIAN_AGRI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label} — {loc.region} ({loc.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STAGE 2: HYPER-LOCAL NEIGHBORHOOD / VILLAGE / GPS */}
          <div style={{
            backgroundColor: 'var(--color-soft-surface)',
            borderRadius: '18px',
            padding: '20px',
            border: '1.5px solid rgba(47, 125, 74, 0.18)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', margin: 0 }}>
                  {lang === 'mr' ? '२. विशिष्ट परिसर / गल्ली / गाव (टप्पा २)' : lang === 'hi' ? '२. विशिष्ट मुहल्ला / गाँव (चरण २)' : '2. Specific Neighborhood / Village (Stage 2)'}
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {lang === 'mr' ? `${selectedCity} मधील स्थानिक विक्रेते शोधण्यासाठी निवडा:` : `Choose nearby locality in ${selectedCity} for exact km distance:`}
                </span>
              </div>

              {/* GPS Auto-Detect Button */}
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
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: gpsLoading ? 'wait' : 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <LocateFixed size={15} />
                <span>{gpsLoading 
                  ? (lang === 'mr' ? 'शोधत आहे...' : 'Locating...') 
                  : (lang === 'mr' ? 'थेट GPS वापरा' : lang === 'hi' ? 'लाइव GPS का प्रयोग करें' : 'Use Current GPS')}</span>
              </button>
            </div>

            {/* Quick Locality Chips for the Selected City */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {availableLocalities.map((loc) => {
                const isSelected = locality === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleLocalitySelect(loc)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--color-primary-green)' : 'var(--color-card-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <MapPin size={12} color={isSelected ? '#FFFFFF' : 'var(--text-muted)'} />
                    <span>{lang === 'mr' && loc.nameMr ? loc.nameMr : loc.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Manual Address Input with Voice Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={isVoiceListening ? (lang === 'mr' ? '🎙️ ऐकत आहे... गावाचे किंवा परिसराचे नाव बोला...' : lang === 'hi' ? '🎙️ सुन रहा हूँ... गांव या क्षेत्र का नाम बोलें...' : '🎙️ Listening... speak village or area name...') : (lang === 'mr' 
                  ? 'किंवा आपले गाव/परिसर टाईप करा (उदा. दादर पश्चिम, वाशी सेक्टर १९, हवेली)' 
                  : 'Or type custom address (e.g. Dadar West, Vashi Sector 19, Haveli)')}
                value={locality}
                onChange={(e) => {
                  setLocality(e.target.value);
                  setAddress(`${e.target.value}, ${selectedCity}, Maharashtra`);
                  setStage(e.target.value.trim().length > 0 ? 2 : 1);
                }}
                className="form-control"
                style={{ 
                  fontSize: '0.88rem', 
                  padding: '10px 42px 10px 14px',
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
                  backgroundColor: isVoiceListening ? '#EF4444' : 'rgba(47, 125, 74, 0.12)',
                  color: isVoiceListening ? '#FFFFFF' : 'var(--color-primary-green)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={lang === 'mr' ? 'गावाचे नाव बोलून सांगा' : 'Speak Village / Locality'}
              >
                {isVoiceListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{
            backgroundColor: 'var(--color-card-surface)',
            border: '1.5px solid var(--border-light)',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(47, 125, 74, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-green)'
              }}>
                <MapPin size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                  {lang === 'mr' ? 'निवडलेले सक्रिय स्थान:' : 'Selected Active Location:'}
                </span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-deep-forest)' }}>
                  {locality ? `${locality}, ` : ''}{selectedCity}, Maharashtra
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                  {currentLocData.region} • GPS: {userCoords.lat.toFixed(3)}°N, {userCoords.lng.toFixed(3)}°E
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${locality ? 'badge-success' : 'badge-weather'}`}>
                {locality 
                  ? (lang === 'mr' ? '🎯 हायपर-लोकल (अति-स्थानिक)' : '🎯 Hyper-Local Active')
                  : (lang === 'mr' ? '🏙️ शहर पातळी (सामान्य)' : '🏙️ General City Level')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 20px' }}
            >
              {lang === 'mr' ? 'रद्द करा' : lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>{lang === 'mr' ? 'स्थान अद्ययावत झाले!' : 'Location Applied!'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{lang === 'mr' ? 'स्थान जतन करा व लागू करा' : lang === 'hi' ? 'स्थान सहेजें और लागू करें' : 'Apply Farm Location'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Login Reminder Modal Guard */}
      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={() => setShowLoginReminder(false)}
        onNavigateAuth={() => {
          setShowLoginReminder(false);
          onClose();
          window.dispatchEvent(new CustomEvent('shet_navigate_page', { detail: 'auth' }));
        }}
        title={lang === 'mr' ? 'GPS शेत स्थानासाठी कृपया लॉगिन करा' : lang === 'hi' ? 'GPS खेत स्थान के लिए कृपया पहले लॉगिन करें' : 'Sign In Required for Farm GPS'}
        message={lang === 'mr' 
          ? 'थेट GPS स्थान आपल्या शेतकरी खात्याशी सुरक्षित जोडले जाते, ज्यामुळे अचूक हवामान अंदाज, उपग्रह नकाशे आणि नजीकची कृषी केंद्रे मिळतात. कृपया प्रथम लॉगिन किंवा नोंदणी करा.' 
          : 'GPS live farm detection requires an active account so your coordinates can be safely linked to your farm profile and synchronized with satellite & weather systems.'}
      />
    </div>
  );
}
