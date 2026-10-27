import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import FarmCanvas3D from '../components/FarmCanvas3D';
import { 
  Box, 
  RotateCcw, 
  Eye, 
  Layers, 
  CloudRain, 
  Sun, 
  AlertTriangle, 
  Sparkles,
  Info,
  Droplets,
  TrendingUp,
  Compass
} from 'lucide-react';

export default function Farm3DPage() {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();

  const [cropType, setCropType] = useState('Tomato');
  const [soilType, setSoilType] = useState('Black Soil (Regur)');
  const [farmArea, setFarmArea] = useState(2.4);
  const [simMode, setSimMode] = useState('normal'); // 'normal' | 'rain' | 'drought' | 'pest'
  const [cameraView, setCameraView] = useState('iso'); // 'iso' | 'top'
  const [resetCounter, setResetCounter] = useState(0);

  // Dynamic agronomic calculations based on farm inputs
  const calculatedStats = {
    waterNeed: Math.round(farmArea * (simMode === 'drought' ? 32000 : 18500)),
    yieldEstimate: cropType === 'Tomato' ? (farmArea * 15.2).toFixed(1) :
                   cropType === 'Brinjal' ? (farmArea * 12.8).toFixed(1) :
                   cropType === 'Chilli' ? (farmArea * 4.5).toFixed(1) :
                   cropType === 'Onion' ? (farmArea * 11.4).toFixed(1) :
                   cropType === 'Sugarcane' ? (farmArea * 42.0).toFixed(1) :
                   cropType === 'Cotton' ? (farmArea * 1.8).toFixed(1) :
                   cropType === 'Wheat' ? (farmArea * 2.4).toFixed(1) :
                   (farmArea * 3.1).toFixed(1),
    unit: cropType === 'Tomato' || cropType === 'Sugarcane' || cropType === 'Brinjal' || cropType === 'Onion' ? 'Tons' : 'Quintals',
    healthScore: simMode === 'normal' ? 88 : simMode === 'rain' ? 76 : simMode === 'drought' ? 49 : 44
  };

  // Adaptive theme colors: Strict 3-color dark mode (Pure Black, Dark Green, White)
  const pageBg = isDark ? '#000000' : '#F8FAF9';
  const cardBg = isDark ? '#07261C' : '#FFFFFF';
  const cardBorder = isDark ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid #E2E8F0';
  const cardShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.65)' : '0 4px 14px rgba(0, 0, 0, 0.05)';
  const textTitle = isDark ? '#FFFFFF' : '#0D241B';
  const textMuted = isDark ? '#E5E7EB' : '#4B6354';
  const inputBg = isDark ? '#041B13' : '#FFFFFF';
  const inputBorder = isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #CBD5E1';
  const inputColor = isDark ? '#FFFFFF' : '#1A3022';
  const subBoxBg = isDark ? '#041B13' : '#F8FAF9';
  const subBoxBorder = isDark ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid #EDF2F7';

  return (
    <div style={{
      backgroundColor: pageBg,
      color: isDark ? '#ECFDF5' : '#1A3022',
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 24px',
      transition: 'background-color 0.25s ease, color 0.25s ease'
    }}>
      {/* Top Header & Simulation Quick Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ color: textTitle, fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              {t('simulatorTitle')}
            </h2>
            <span style={{
              backgroundColor: isDark ? 'rgba(74, 222, 128, 0.18)' : '#DCFCE7',
              color: isDark ? '#4ADE80' : '#166534',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '6px'
            }}>
              {lang === 'mr' ? '३D परस्परसंवादी' : lang === 'hi' ? '३D इंटरैक्टिव' : '3D Interactive'}
            </span>
          </div>
          <p style={{ color: textMuted, fontSize: '0.82rem', margin: '3px 0 0' }}>
            {t('simulatorSubtitle')}
          </p>
        </div>

        {/* Camera Views & Reset */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setCameraView('iso');
              setResetCounter(c => c + 1);
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: cameraView === 'iso' 
                ? 'var(--color-primary-green)' 
                : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF'),
              color: cameraView === 'iso' ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#475569'),
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: cameraView === 'iso' 
                ? '1px solid #22C55E' 
                : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1'),
              boxShadow: cameraView === 'iso' ? '0 0 12px rgba(34, 197, 94, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Compass size={14} />
            <span>{t('isoView')}</span>
          </button>

          <button
            onClick={() => {
              setCameraView('top');
              setResetCounter(c => c + 1);
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: cameraView === 'top' 
                ? 'var(--color-primary-green)' 
                : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF'),
              color: cameraView === 'top' ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#475569'),
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: cameraView === 'top' 
                ? '1px solid #22C55E' 
                : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1'),
              boxShadow: cameraView === 'top' ? '0 0 12px rgba(34, 197, 94, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={14} />
            <span>{t('topView')}</span>
          </button>

          <button
            onClick={() => {
              setCameraView('iso');
              setSimMode('normal');
              setResetCounter(c => c + 1);
            }}
            title={t('resetView')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1',
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={14} />
            <span>{t('resetView')}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area + Sidebar Overlays */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '20px',
        flex: 1,
        minHeight: '620px'
      }} className="simulator-grid">
        {/* 3D Scene Viewport */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: isDark ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid #CBD5E1',
          backgroundColor: '#0A1A14',
          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.08)'
        }}>
          <FarmCanvas3D 
            cropType={cropType} 
            soilType={soilType} 
            farmArea={farmArea} 
            simMode={simMode}
            cameraView={cameraView}
            resetCounter={resetCounter}
          />

          {/* Floating simulation indicator badge on the 3D scene */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isDark ? 'rgba(13, 36, 27, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(0, 0, 0, 0.12)',
            padding: '8px 14px',
            borderRadius: '24px',
            color: isDark ? '#FFFFFF' : '#1A3022',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: simMode === 'normal' ? '#22C55E' : simMode === 'rain' ? '#5B9BD5' : '#D95C4F'
            }} />
            <span>
              {simMode === 'normal' ? (lang === 'mr' ? 'सामान्य सूर्यप्रकाश व वाढ' : lang === 'hi' ? 'सामान्य धूप और वृद्धि' : 'Normal Sunlight & Growth') :
               simMode === 'rain' ? (lang === 'mr' ? 'मान्सून पर्जन्यवृष्टी सक्रिय' : lang === 'hi' ? 'मानसून वर्षा सक्रिय' : 'Monsoon Rainfall Active') :
               simMode === 'drought' ? (lang === 'mr' ? 'दुष्काळ ताण परिस्थिती' : lang === 'hi' ? 'सूखा तनाव स्थिति' : 'Drought Stress Condition') :
               (lang === 'mr' ? 'कीड प्रादुर्भाव अलर्ट' : lang === 'hi' ? 'कीट प्रकोप चेतावनी' : 'Pest Outbreak Alert')}
            </span>
          </div>

          {/* Educational notice overlay at bottom of canvas */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            backgroundColor: isDark ? 'rgba(7, 23, 16, 0.85)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '9px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: isDark ? 'rgba(236, 253, 245, 0.8)' : '#334155'
          }}>
            <Info size={14} color={isDark ? '#4ADE80' : '#166534'} style={{ flexShrink: 0 }} />
            <span>
              {lang === 'mr' 
                ? 'शैक्षणिक शेती सिम्युलेटर: पिकांची वाढ, मातीचा प्रकार आणि नारळाच्या बागेचे ३D दृश्य. फिरवण्यासाठी माउस ड्रॅग करा, झूम करण्यासाठी स्क्रोल करा.'
                : lang === 'hi'
                ? 'शैक्षणिक कृषि सिम्युलेटर: फसल विकास, मिट्टी का प्रकार और नारियल के बाग का ३D दृश्य। घुमाने के लिए माउस खींचें, ज़ूम करने के लिए स्क्रॉल करें।'
                : 'Educational Agronomic Simulator: Interactive 3D crop canopy, soil profile, farmhouse, well, and coconut grove. Drag mouse to rotate, scroll to zoom.'}
            </span>
          </div>
        </div>

        {/* Right Configuration & Agronomic Metrics Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {/* Configuration Card */}
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '18px',
            padding: '20px',
            border: cardBorder,
            boxShadow: cardShadow
          }}>
            <h3 style={{ fontSize: '1rem', color: textTitle, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Layers size={18} color="var(--color-primary-green)" />
              <span>{lang === 'mr' ? 'शेती रचना' : lang === 'hi' ? 'खेत विन्यास' : 'Farm Configuration'}</span>
            </h3>

            {/* Crop Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', color: textMuted, display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                {t('cropType')}
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: inputBg,
                  color: inputColor,
                  border: inputBorder,
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="Tomato">{lang === 'mr' ? 'टोमॅटो - फळे व आधार' : lang === 'hi' ? 'टमाटर - फल व सहारा' : 'Tomato (Fruit Clusters & Trellis)'}</option>
                <option value="Brinjal">{lang === 'mr' ? 'वांगी - जांभळी फळे' : lang === 'hi' ? 'बैंगन - बैंगनी फल' : 'Brinjal / Eggplant (Deep Violet & Broad Leaves)'}</option>
                <option value="Chilli">{lang === 'mr' ? 'मिरची - तिखट लाल व हिरवी' : lang === 'hi' ? 'मिर्च - लाल व हरी मिर्च' : 'Chilli / Pepper (Red & Green Spikes)'}</option>
                <option value="Onion">{lang === 'mr' ? 'कांदा - कांदा कंद व पात' : lang === 'hi' ? 'प्याज - प्याज कंद व हरी पत्ती' : 'Onion (Exposed Bulbs & Scallions)'}</option>
                <option value="Cotton">{lang === 'mr' ? 'कापूस - पांढरे बोंड' : lang === 'hi' ? 'कपास - सफेद डोडे' : 'Cotton (Fluffy White Bolls)'}</option>
                <option value="Sugarcane">{lang === 'mr' ? 'ऊस - उंच कांडी' : lang === 'hi' ? 'गन्ना - लंबा गन्ना' : 'Sugarcane (Segmented Nodes & Canes)'}</option>
                <option value="Wheat">{lang === 'mr' ? 'गहू - सोनेरी लोंब्या' : lang === 'hi' ? 'गेहूं - सुनहरी बालियां' : 'Wheat (Golden Bearded Spikes)'}</option>
                <option value="Rice">{lang === 'mr' ? 'भात / धान - झुकलेल्या लोंब्या' : lang === 'hi' ? 'धान / चावल - झुकी बालियां' : 'Rice / Paddy (Drooping Panicles)'}</option>
              </select>
            </div>

            {/* Soil Type Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', color: textMuted, display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                {t('soilType')}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: inputBg,
                  color: inputColor,
                  border: inputBorder,
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="Black Soil (Regur)">{lang === 'mr' ? 'काळी कसदार रेगुर माती' : lang === 'hi' ? 'काली कपास रेगुर मिट्टी' : 'Black Soil / Regur'}</option>
                <option value="Red Soil">{lang === 'mr' ? 'लाल माती' : lang === 'hi' ? 'लाल मिट्टी' : 'Red Soil'}</option>
                <option value="Alluvial Soil">{lang === 'mr' ? 'गाळाची माती' : lang === 'hi' ? 'जलोढ़ मिट्टी' : 'Alluvial Soil'}</option>
                <option value="Sandy Loam">{lang === 'mr' ? 'वालुकामय पोयटा' : lang === 'hi' ? 'बलुई दोमट' : 'Sandy Loam'}</option>
              </select>
            </div>

            {/* Farm Area Range Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: textMuted, fontWeight: 600 }}>
                  {t('farmArea')}
                </label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-green)' }}>
                  {farmArea} {lang === 'mr' ? 'एकर' : lang === 'hi' ? 'एकड़' : 'Acres'}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={farmArea}
                onChange={(e) => setFarmArea(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--color-primary-green)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Simulation Triggers Card */}
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '18px',
            padding: '20px',
            border: cardBorder,
            boxShadow: cardShadow
          }}>
            <h3 style={{ fontSize: '1rem', color: textTitle, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Sparkles size={18} color="var(--color-primary-green)" />
              <span>{t('environmentSim')}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setSimMode('normal')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  backgroundColor: simMode === 'normal' 
                    ? (isDark ? 'var(--color-primary-green)' : '#DCFCE7') 
                    : subBoxBg,
                  border: simMode === 'normal' 
                    ? (isDark ? '1px solid #4ADE80' : '1.5px solid #22C55E') 
                    : subBoxBorder,
                  color: simMode === 'normal' 
                    ? (isDark ? '#FFFFFF' : '#166534') 
                    : (isDark ? '#FFFFFF' : '#334155'),
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <Sun size={18} color="#22C55E" />
                <span>{t('simNormal')}</span>
              </button>

              <button
                onClick={() => setSimMode('rain')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  backgroundColor: simMode === 'rain' 
                    ? (isDark ? '#143527' : '#E0F2FE') 
                    : subBoxBg,
                  border: simMode === 'rain' 
                    ? (isDark ? '1px solid #5B9BD5' : '1.5px solid #0284C7') 
                    : subBoxBorder,
                  color: simMode === 'rain' 
                    ? (isDark ? '#FFFFFF' : '#075985') 
                    : (isDark ? '#FFFFFF' : '#334155'),
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <CloudRain size={18} color="#5B9BD5" />
                <span>{t('simRain')}</span>
              </button>

              <button
                onClick={() => setSimMode('drought')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  backgroundColor: simMode === 'drought' 
                    ? (isDark ? '#2E2210' : '#FEF3C7') 
                    : subBoxBg,
                  border: simMode === 'drought' 
                    ? (isDark ? '1px solid #E5A83B' : '1.5px solid #D97706') 
                    : subBoxBorder,
                  color: simMode === 'drought' 
                    ? (isDark ? '#FFFFFF' : '#92400E') 
                    : (isDark ? '#FFFFFF' : '#334155'),
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <Sun size={18} color="#E5A83B" />
                <span>{t('simDrought')}</span>
              </button>

              <button
                onClick={() => setSimMode('pest')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  backgroundColor: simMode === 'pest' 
                    ? (isDark ? '#2D1412' : '#FEE2E2') 
                    : subBoxBg,
                  border: simMode === 'pest' 
                    ? (isDark ? '1px solid #D95C4F' : '1.5px solid #DC2626') 
                    : subBoxBorder,
                  color: simMode === 'pest' 
                    ? (isDark ? '#FFFFFF' : '#991B1B') 
                    : (isDark ? '#FFFFFF' : '#334155'),
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <AlertTriangle size={18} color="#D95C4F" />
                <span>{t('simPest')}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Agronomic Metrics Overlay Card */}
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '18px',
            padding: '20px',
            border: cardBorder,
            boxShadow: cardShadow
          }}>
            <h3 style={{ fontSize: '1rem', color: textTitle, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <TrendingUp size={18} color="var(--color-primary-green)" />
              <span>{t('simulatedAgronomy')}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '11px 14px',
                borderRadius: '12px',
                backgroundColor: subBoxBg,
                border: subBoxBorder
              }}>
                <span style={{ fontSize: '0.8rem', color: textMuted, fontWeight: 600 }}>{t('farmVigorIndex')}:</span>
                <span style={{ 
                  fontSize: '0.92rem', 
                  fontWeight: 800, 
                  color: calculatedStats.healthScore > 75 ? 'var(--color-primary-green)' : '#E5A83B' 
                }}>
                  {calculatedStats.healthScore}%
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '11px 14px',
                borderRadius: '12px',
                backgroundColor: subBoxBg,
                border: subBoxBorder
              }}>
                <span style={{ fontSize: '0.8rem', color: textMuted, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Droplets size={14} color="#5B9BD5" />
                  <span>{t('waterRequirement')}:</span>
                </span>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: textTitle }}>
                  {calculatedStats.waterNeed.toLocaleString()} L
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '11px 14px',
                borderRadius: '12px',
                backgroundColor: subBoxBg,
                border: subBoxBorder
              }}>
                <span style={{ fontSize: '0.8rem', color: textMuted, fontWeight: 600 }}>{t('projectedYield')}:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-primary-green)' }}>
                  {calculatedStats.yieldEstimate} {calculatedStats.unit === 'Tons' ? (lang === 'mr' ? 'टन' : lang === 'hi' ? 'टन' : 'Tons') : (lang === 'mr' ? 'क्विंटल' : lang === 'hi' ? 'क्विंटल' : 'Quintals')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
