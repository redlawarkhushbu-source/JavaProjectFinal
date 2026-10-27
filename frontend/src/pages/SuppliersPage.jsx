import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api, SUPPLIERS_DATA, INDIAN_AGRI_LOCATIONS, findLocationByQuery } from '../services/api';
import { 
  Store, 
  MapPin, 
  Phone, 
  Star, 
  Search, 
  CheckCircle2, 
  Navigation, 
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Compass,
  LocateFixed,
  Building2,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import { audioService } from '../services/audioService';
import GoogleMapView from '../components/GoogleMapView';
import TwoStageLocationModal from '../components/TwoStageLocationModal';

const POPULAR_CITIES = [
  { id: 'Mumbai', label: 'Mumbai (मुंबई)', state: 'Maharashtra' },
  { id: 'Pune', label: 'Pune (पुणे)', state: 'Maharashtra' },
  { id: 'Nashik', label: 'Nashik (नाशिक)', state: 'Maharashtra' },
  { id: 'Nagpur', label: 'Nagpur (नागपूर)', state: 'Maharashtra' },
  { id: 'Kolhapur', label: 'Kolhapur (कोल्हापूर)', state: 'Maharashtra' },
  { id: 'Thane', label: 'Thane (ठाणे)', state: 'Maharashtra' }
];

const LOCALITY_PRESETS = {
  Mumbai: ['Dadar West', 'APMC Vashi', 'Borivali West', 'Andheri East', 'Panvel', 'Thane West'],
  Pune: ['Market Yard / Gultekdi', 'Hadapsar', 'Khed Shivapur', 'Rajgurunagar (Khed)', 'MIDC Bhosari', 'Haveli'],
  Nashik: ['Dindori Road', 'Mohadi', 'Panchavati', 'Niphad'],
  Nagpur: ['Cotton Market', 'Kalmeshwar', 'Hingna']
};

export default function SuppliersPage() {
  const { lang, t } = useLanguage();
  const { user, updateLocation } = useAuth();

  const [selectedCity, setSelectedCity] = useState(user?.district || user?.city || 'Mumbai');
  const [selectedLocality, setSelectedLocality] = useState(user?.locality || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState(SUPPLIERS_DATA);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Global listeners for voice assistant category filtering & city jumps
  useEffect(() => {
    const handleFilterEvent = (e) => {
      if (e.detail) {
        setSelectedCategory(e.detail);
      }
    };
    const handleCityEvent = (e) => {
      if (e.detail) {
        setSelectedCity(e.detail);
        setSelectedLocality('');
      }
    };
    window.addEventListener('shet_filter_supplier', handleFilterEvent);
    window.addEventListener('shet_select_supplier_city', handleCityEvent);
    return () => {
      window.removeEventListener('shet_filter_supplier', handleFilterEvent);
      window.removeEventListener('shet_select_supplier_city', handleCityEvent);
    };
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
          setSearchQuery(text);
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

  const categories = [
    { id: 'all', label: t('categoryAll') },
    { id: 'seeds', label: t('categorySeeds') },
    { id: 'manure', label: t('categoryManure') },
    { id: 'fertilizers', label: t('categoryFertilizers') },
    { id: 'medicines', label: t('categoryMedicines') },
    { id: 'irrigation', label: t('categoryIrrigation') || (lang === 'mr' ? 'ठिबक व यंत्रसामग्री' : lang === 'hi' ? 'ड्रिप व कृषि उपकरण' : 'Drip & Machinery') }
  ];

  // Sync state if user location updates from Navbar or Dashboard
  useEffect(() => {
    if (user?.district || user?.city) {
      setSelectedCity(user?.district || user?.city);
      setSelectedLocality(user?.locality || '');
    }
  }, [user?.district, user?.city, user?.locality]);

  // Load and filter suppliers dynamically based on active city, locality, and category
  useEffect(() => {
    async function filterSuppliers() {
      const locMatch = findLocationByQuery(selectedCity);
      const data = await api.getSuppliers({
        city: selectedCity,
        district: selectedCity,
        locality: selectedLocality,
        lat: user?.lat || locMatch.lat,
        lng: user?.lng || locMatch.lng,
        category: selectedCategory,
        query: searchQuery
      });
      setSuppliers(data);
      if (data.length > 0 && !activeSupplier) {
        setActiveSupplier(data[0]);
      }
    }
    filterSuppliers();
  }, [selectedCity, selectedLocality, selectedCategory, searchQuery, user?.lat, user?.lng]);

  const activeCityData = findLocationByQuery(selectedCity);
  const localitiesForCity = LOCALITY_PRESETS[selectedCity] || ['Main Agricultural Market', 'Gram Panchayat Center'];

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setSelectedLocality('');
    updateLocation({ city: cityId, district: cityId, locality: '', stage: 1 });
  };

  const handleLocalityChange = (locName) => {
    const newLoc = selectedLocality === locName ? '' : locName;
    setSelectedLocality(newLoc);
    updateLocation({ city: selectedCity, district: selectedCity, locality: newLoc, stage: newLoc ? 2 : 1 });
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-soft-surface)',
              color: 'var(--color-primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.85rem', margin: 0 }}>{t('suppliersTitle')}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '2px 0 0' }}>
                {t('suppliersSubtitle')}
              </p>
            </div>
          </div>

          {/* Quick Two-Stage Location Switcher Button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-card-surface)',
              border: '1.5px solid var(--color-primary-green)',
              padding: '8px 16px',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <MapPin size={16} color="var(--color-primary-green)" />
            <span>
              {selectedLocality ? `${selectedLocality}, ` : ''}{selectedCity}
            </span>
            <span style={{ color: 'var(--color-primary-green)', fontSize: '0.75rem' }}>
              ({lang === 'mr' ? 'स्थान बदला ⌵' : 'Change ⌵'})
            </span>
          </button>
        </div>
      </div>

      {/* TWO-STAGE LOCATION FILTER CARD */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: '20px', border: '1.5px solid rgba(47, 125, 74, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: 'rgba(47, 125, 74, 0.1)',
              color: 'var(--color-primary-green)',
              padding: '3px 10px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {lang === 'mr' ? 'दोन-टप्पे स्थान शोध' : lang === 'hi' ? 'दो-चरणीय स्थान खोज' : 'Two-Stage Area Filter'}
            </span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-deep-forest)' }}>
              {lang === 'mr' ? 'टप्पा १: जिल्हा निवडा' : 'Stage 1: Select District / City'}
            </strong>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {selectedLocality 
              ? (lang === 'mr' ? `🎯 टप्पा २: ${selectedLocality} परिसरातील विक्रेते दाखवत आहे` : `🎯 Stage 2: Showing stores closest to ${selectedLocality}`)
              : (lang === 'mr' ? `🏙️ टप्पा १: ${selectedCity} जिल्ह्यातील सर्व कृषी केंद्र दाखवत आहे` : `🏙️ Stage 1: Showing stores across ${selectedCity}`)}
          </span>
        </div>

        {/* Stage 1: City Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {POPULAR_CITIES.map((c) => {
            const isSelected = selectedCity === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCityChange(c.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--color-deep-forest)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--color-deep-forest)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={13} color={isSelected ? '#B7D66A' : 'var(--color-primary-green)'} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stage 2: Neighborhood / Locality Filter */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-deep-forest)' }}>
              {lang === 'mr' ? 'टप्पा २ (अचूक अंतरासाठी स्थानिक परिसर निवडा):' : 'Stage 2 (Refine to local area for nearest km):'}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {localitiesForCity.map((loc) => {
                const isSelected = selectedLocality === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => handleLocalityChange(loc)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--color-primary-green)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--color-soft-surface)' : 'var(--color-card-surface)',
                      color: isSelected ? 'var(--color-primary-green)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MapPin size={11} />
                    <span>{loc}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
                    {/* Search Box with Hands-Free Voice Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={isVoiceSearching ? (lang === 'mr' ? '🎙️ ऐकत आहे... बोला...' : lang === 'hi' ? '🎙️ सुन रहा हूँ... बोलें...' : '🎙️ Listening... speak now...') : (lang === 'mr' ? 'दुकान, खते किंवा बियाणे शोधा...' : t('searchPlaceholder'))}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ 
                paddingLeft: '40px', 
                paddingRight: '44px',
                borderColor: isVoiceSearching ? 'var(--color-primary-green)' : undefined,
                boxShadow: isVoiceSearching ? '0 0 0 3px rgba(47, 125, 74, 0.2)' : undefined
              }}
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: isVoiceSearching ? '#EF4444' : 'rgba(47, 125, 74, 0.1)',
                color: isVoiceSearching ? '#FFFFFF' : 'var(--color-primary-green)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={lang === 'mr' ? 'बोलून शोधा (Voice Search)' : 'Search by voice'}
            >
              {isVoiceSearching ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === cat.id ? 'var(--color-primary-green)' : 'var(--color-soft-surface)',
                  color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-deep-forest)',
                  border: '1px solid rgba(47, 125, 74, 0.2)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Supplier Cards List + Interactive Map */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }} className="suppliers-grid">
        {/* Suppliers List */}
        <div className="suppliers-list-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {suppliers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Store size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3>{lang === 'mr' ? 'कोणताही विक्रेता आढळला नाही' : lang === 'hi' ? 'कोई विक्रेता नहीं मिला' : 'No suppliers found'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {lang === 'mr' ? 'कृपया वेगळा शब्द किंवा श्रेणी निवडून शोधा.' : lang === 'hi' ? 'कृपया कोई भिन्न शब्द या श्रेणी चुनकर खोजें।' : 'Try searching for a different keyword or category.'}
              </p>
            </div>
          ) : (
            suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="card card-interactive"
                style={{
                  padding: '20px',
                  border: activeSupplier?.id === supplier.id ? '2px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                  backgroundColor: activeSupplier?.id === supplier.id ? 'var(--color-soft-surface)' : 'var(--color-card-surface)'
                }}
                onClick={() => setActiveSupplier(supplier)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--color-deep-forest)', margin: 0 }}>
                        {lang === 'mr' ? supplier.nameMr : lang === 'hi' ? (supplier.nameHi || supplier.nameMr || supplier.name) : supplier.name}
                      </h3>
                      {supplier.verified && (
                        <span title={lang === 'mr' ? 'शासकीय प्रमाणित कृषी केंद्र' : lang === 'hi' ? 'शासकीय प्रमाणित कृषि केंद्र' : 'Government Certified Krishi Kendra'} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <ShieldCheck size={16} color="var(--color-primary-green)" />
                        </span>
                      )}
                      {supplier.isHyperLocal && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          {lang === 'mr' ? '🎯 स्थानिक केंद्र' : '🎯 Local Area Store'}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-green)', fontWeight: 600 }}>
                      {lang === 'mr' ? supplier.categoryMr : lang === 'hi' ? (supplier.categoryHi || supplier.categoryMr || supplier.categoryLabel) : supplier.categoryLabel}
                    </span>
                  </div>

                  <span className="badge badge-info" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    {supplier.distanceKm} {lang === 'mr' ? 'किमी अंतरावर' : lang === 'hi' ? 'किमी दूर' : 'km away'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <MapPin size={14} color="var(--color-primary-green)" />
                  <span>{lang === 'mr' ? supplier.addressMr : lang === 'hi' ? (supplier.addressHi || supplier.addressMr || supplier.address) : supplier.address}</span>
                </div>

                {/* In Stock Tags */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    {lang === 'mr' ? 'उपलब्ध साठा ठळक मुद्दे:' : lang === 'hi' ? 'उपलब्ध स्टॉक विवरण:' : 'Available Stock Highlights:'}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {supplier.inStock.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-main-bg)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  <a
                    href={`tel:${supplier.phone}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={14} />
                    <span>{t('callStore')}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${supplier.lat},${supplier.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation size={14} />
                    <span>{t('getDirections')}</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map View */}
        <div className="suppliers-map-column" style={{
          position: 'sticky',
          top: '96px',
          height: '560px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '1.5px solid rgba(47, 125, 74, 0.2)'
        }}>
          <GoogleMapView
            suppliers={suppliers}
            activeSupplier={activeSupplier}
            onSelectSupplier={setActiveSupplier}
            lang={lang}
            userLocation={{
              lat: user?.lat || activeCityData.lat,
              lng: user?.lng || activeCityData.lng
            }}
            centerCoords={{
              lat: activeCityData.lat,
              lng: activeCityData.lng
            }}
          />
        </div>
      </div>

      {/* Two-Stage Location Selector Modal */}
      <TwoStageLocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSaved={({ city, locality }) => {
          setSelectedCity(city);
          setSelectedLocality(locality);
        }}
      />
    </div>
  );
}

