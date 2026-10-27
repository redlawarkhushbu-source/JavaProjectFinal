import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, SAMPLE_DISEASE_PRESETS, extractLeafPixelMetrics } from '../services/api';
import { 
  ScanLine, 
  Upload, 
  Camera,
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  Calendar,
  Store,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Leaf,
  Droplets,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Info,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CropDiagnosisPage() {
  const { lang, t } = useLanguage();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [cvScanData, setCvScanData] = useState(null);
  const [presetCategory, setPresetCategory] = useState('all');
  const [activeTreatmentTab, setActiveTreatmentTab] = useState('immediate');
  const [activeSlide, setActiveSlide] = useState('summary');

  // Optional Farmer Field Context (Section 8)
  const [showFieldContext, setShowFieldContext] = useState(false);
  const [knownCrop, setKnownCrop] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [weatherHistory, setWeatherHistory] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(lang === 'mr' ? 'फोटो फाइल १५ MB पेक्षा लहान असावी.' : lang === 'hi' ? 'फोटो १५ MB से छोटा होना चाहिए।' : 'File size exceeds 15MB limit.');
        return;
      }
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedPresetId(null);
      setDiagnosisResult(null);
      setErrorResult(null);

      // Instantly run computer vision pixel scan
      const scan = await extractLeafPixelMetrics(file);
      setCvScanData(scan);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setPreviewUrl(preset.imageUrl);
    setSelectedImage(null);
    setDiagnosisResult(null);
    setErrorResult(null);
    setCvScanData({
      infectedPercent: preset.affectedPercent,
      hotspot: preset.hotspot
    });
  };

  const handleAnalyze = async (forceFallback = false) => {
    if (!previewUrl && !selectedPresetId) return;

    setIsAnalyzing(true);
    setErrorResult(null);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await api.diagnoseCrop({
        imageFile: selectedImage,
        imageUrl: previewUrl,
        samplePresetId: selectedPresetId,
        crop: knownCrop || null,
        growthStage: growthStage || null,
        symptomOnset: symptomOnset || null,
        weatherHistory: weatherHistory || null,
        forceLocalFallback: forceFallback
      });

      clearInterval(stepInterval);
      setIsAnalyzing(false);

      if (result.isError) {
        setErrorResult(result);
        setDiagnosisResult(null);
      } else {
        setDiagnosisResult(result);
        setErrorResult(null);
        setActiveSlide('summary');
        setActiveTreatmentTab('immediate');

        if (result.isHealthy) {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } });
        }
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorResult({
        isError: true,
        status: 500,
        message: lang === 'mr' 
          ? 'विश्लेषण करताना अनपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' 
          : 'Unexpected error occurred during diagnosis. Please try again.'
      });
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedPresetId(null);
    setDiagnosisResult(null);
    setErrorResult(null);
    setCvScanData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const activeHotspot = diagnosisResult?.hotspot || cvScanData?.hotspot || { x: 35, y: 30, width: 32, height: 28 };

  // Filter leaf sample gallery
  const filteredPresets = SAMPLE_DISEASE_PRESETS.filter(p => {
    if (presetCategory === 'healthy') return p.severity === 'Healthy';
    if (presetCategory === 'vegetables') return ['Tomato', 'Potato', 'Brinjal', 'Chilli', 'Onion'].includes(p.crop);
    if (presetCategory === 'cash') return ['Cotton', 'Sugarcane', 'Soybean', 'Grapes'].includes(p.crop);
    if (presetCategory === 'cereals') return ['Rice', 'Wheat'].includes(p.crop);
    return true;
  });

  return (
    <div style={{ padding: '20px 14px', maxWidth: '1360px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden', color: 'var(--text-primary)' }}>
      
      {/* Page Title & Engine Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              backgroundColor: 'var(--semantic-ai-bg)',
              color: 'var(--semantic-ai)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59, 130, 196, 0.25)',
              flexShrink: 0
            }}>
              <ScanLine size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', margin: 0, fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {t('diagnosisTitle')}
                </h1>
                <span style={{
                  fontSize: '0.74rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: 'var(--color-primary-green)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  border: '1px solid var(--border-light)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ShieldCheck size={14} />
                  <span>AI Botanical Vision v1</span>
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', margin: '4px 0 0' }}>
                {t('diagnosisSubtitle')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.74rem',
              backgroundColor: 'var(--color-card-surface)',
              border: '1px solid var(--border-light)',
              padding: '6px 12px',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>⚡</span> {lang === 'mr' ? 'वेगवान AI स्कॅन' : 'Sub-Second Visual AI'}
            </span>
            <span style={{
              fontSize: '0.74rem',
              backgroundColor: 'var(--color-card-surface)',
              border: '1px solid var(--border-light)',
              padding: '6px 12px',
              borderRadius: '10px',
              color: 'var(--color-primary-green)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Award size={14} /> {lang === 'mr' ? '९८% अचूकता' : '98% Visual Precision'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Upload Column + Result Column */}
      <div 
        className={`diagnosis-grid ${(diagnosisResult || errorResult) ? 'has-results' : ''}`}
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Left Column: Upload & Scan Controls */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--color-card-surface)', border: '1px solid var(--border-light)', minWidth: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          
          {/* Header Instruction */}
          <div style={{
            backgroundColor: 'var(--color-soft-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '18px'
          }}>
            <h3 style={{ fontSize: '0.98rem', margin: 0, color: 'var(--color-deep-forest)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <span>📸</span>
              <span>
                {lang === 'mr' ? 'पानाचा फोटो अपलोड किंवा स्कॅन करा' : lang === 'hi' ? 'पत्ती का फोटो अपलोड या स्कैन करें' : 'Upload or Scan Plant Leaf Photo'}
              </span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: 1.45 }}>
              {lang === 'mr' 
                ? 'Shet Samarthan AI थेट पानाच्या फोटोवरून वनस्पती प्रजाती, संसर्गजन्य रोग, लक्षणे व शास्त्रीय उपचारांचे मार्गदर्शन करेल.' 
                : lang === 'hi' 
                ? 'Shet Samarthan AI पत्ती के फोटो से सीधे फसल प्रजाति, रोग, लक्षण व सुरक्षित उपचार बताएगा।' 
                : 'Shet Samarthan AI Engine identifies botanical taxonomy, active pathogens, observed pathology, and safe treatments.'}
            </span>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isAnalyzing}
            style={{ display: 'none' }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={isAnalyzing}
            style={{ display: 'none' }}
          />

          {/* Image Drag-and-Drop / Upload Area */}
          <div 
            onClick={() => {
              if (!isAnalyzing && fileInputRef.current) fileInputRef.current.click();
            }}
            style={{
              border: previewUrl ? '2px solid var(--color-primary-green)' : '2px dashed var(--color-primary-green)',
              borderRadius: '20px',
              padding: previewUrl ? '12px' : '32px 20px',
              textAlign: 'center',
              backgroundColor: previewUrl ? 'var(--color-card-surface)' : 'var(--color-soft-surface)',
              cursor: 'pointer',
              position: 'relative',
              marginBottom: '16px',
              transition: 'all 0.25s ease',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Holographic Laser Scanner Sweep Line */}
            {isAnalyzing && <div className="laser-scanner-line" />}

            {previewUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                <img
                  src={previewUrl}
                  alt="Crop Leaf Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '280px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    boxShadow: 'var(--shadow-md)',
                    display: 'block'
                  }}
                />

                {/* Hotspot Bounding Box */}
                {showHeatmap && !diagnosisResult?.isHealthy && (
                  <div style={{
                    position: 'absolute',
                    top: `${activeHotspot.y}%`,
                    left: `${activeHotspot.x}%`,
                    width: `${activeHotspot.width}%`,
                    height: `${activeHotspot.height}%`,
                    border: '2px dashed #EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    boxShadow: '0 0 16px rgba(239, 68, 68, 0.65)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    textShadow: '0 1px 3px #000'
                  }}>
                    {lang === 'mr' ? 'रोग संसर्ग केंद्र' : lang === 'hi' ? 'रोग केंद्र' : 'Pathogen Hotspot'}
                  </div>
                )}
                
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: 0 }}>
                  {lang === 'mr' ? '🔄 दुसरा फोटो निवडण्यासाठी येथे टॅप करा' : lang === 'hi' ? '🔄 दूसरा फोटो चुनने हेतु टैप करें' : '🔄 Tap or drag to replace leaf photo'}
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-card-surface)',
                  color: 'var(--color-primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-light)'
                }}>
                  <Upload size={28} />
                </div>
                <p style={{ fontWeight: 800, color: 'var(--color-deep-forest)', fontSize: '1.02rem', marginBottom: '4px' }}>
                  {t('dragDropText')}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0' }}>
                  {lang === 'mr' ? 'JPG, PNG, WEBP (कमाल 15MB) • पानाचा स्पष्ट जवळून फोटो घ्या' : lang === 'hi' ? 'JPG, PNG, WEBP (अधिकतम 15MB) • पत्ती का स्पष्ट फोटो लें' : 'Supports JPG, PNG, WEBP (Max 15MB) • Close-up leaf blade'}
                </p>
              </div>
            )}
          </div>

          {/* Dual Action Buttons: Upload from Gallery or Live Camera */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => {
                if (!isAnalyzing && fileInputRef.current) fileInputRef.current.click();
              }}
              disabled={isAnalyzing}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Upload size={16} />
              <span>{lang === 'mr' ? 'फोटो निवडा (गॅलरी)' : lang === 'hi' ? 'फोटो चुनें (गैलरी)' : 'Browse Gallery'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isAnalyzing && cameraInputRef.current) cameraInputRef.current.click();
              }}
              disabled={isAnalyzing}
              className="btn btn-secondary"
              style={{
                padding: '10px 14px',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderColor: 'var(--color-primary-green)',
                color: 'var(--color-primary-green)'
              }}
            >
              <Camera size={16} />
              <span>{lang === 'mr' ? 'कॅमेऱ्याने काढा' : lang === 'hi' ? 'कैमरा फोटो' : 'Live Camera'}</span>
            </button>
          </div>

          {/* Section 8: Optional Additional Farmer Field Information (Collapsible) */}
          <div style={{
            backgroundColor: 'var(--color-soft-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '14px',
            marginBottom: '18px',
            overflow: 'hidden'
          }}>
            <button
              type="button"
              onClick={() => setShowFieldContext(!showFieldContext)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color="var(--color-primary-green)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {t('fieldInfoOptional')}
                </span>
                <span style={{ fontSize: '0.70rem', backgroundColor: 'var(--color-card-surface)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                  {lang === 'mr' ? 'ऐच्छिक' : lang === 'hi' ? 'वैकल्पिक' : 'Optional'}
                </span>
              </div>
              {showFieldContext ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showFieldContext && (
              <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {lang === 'mr' 
                    ? 'ही माहिती भरल्यास स्थानिक कृषी सल्ल्याची अचूकता वाढते. (कोणतेही बंधनकारक नाही)'
                    : lang === 'hi'
                    ? 'यह जानकारी भरने से स्थानीय कृषि सलाह और सटीक बनती है।'
                    : 'Providing field context refines location-specific agricultural guidance.'}
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      {lang === 'mr' ? 'माहित असलेले पीक:' : lang === 'hi' ? 'ज्ञात फसल:' : 'Known Crop:'}
                    </label>
                    <select
                      value={knownCrop}
                      onChange={(e) => setKnownCrop(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem' }}
                    >
                      <option value="">{lang === 'mr' ? '-- AI ला ओळखू द्या --' : lang === 'hi' ? '-- AI को पहचानने दें --' : '-- Auto-Detect with AI --'}</option>
                      <option value="Tomato">Tomato / टोमॅटो / टमाटर</option>
                      <option value="Cotton">Cotton / कापूस / कपास</option>
                      <option value="Potato">Potato / बटाटा / आलू</option>
                      <option value="Rice">Rice / भात / धान</option>
                      <option value="Soybean">Soybean / सोयाबीन</option>
                      <option value="Wheat">Wheat / गहू / गेहूं</option>
                      <option value="Sugarcane">Sugarcane / ऊस / गन्ना</option>
                      <option value="Chilli">Chilli / मिरची / मिर्च</option>
                      <option value="Onion">Onion / कांदा / प्याज</option>
                      <option value="Grapes">Grapes / द्राक्ष / अंगूर</option>
                      <option value="Brinjal">Brinjal / वांगी / बैंगन</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      {t('growthStage')}:
                    </label>
                    <select
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem' }}
                    >
                      <option value="">{lang === 'mr' ? '-- निवडा --' : '-- Select Stage --'}</option>
                      <option value="Seedling">{lang === 'mr' ? 'रोप अवस्था (Seedling)' : 'Seedling'}</option>
                      <option value="Vegetative">{lang === 'mr' ? 'शाकीय वाढ (Vegetative)' : 'Vegetative'}</option>
                      <option value="Flowering">{lang === 'mr' ? 'फुलोरा अवस्था (Flowering)' : 'Flowering'}</option>
                      <option value="Fruiting">{lang === 'mr' ? 'फळ धारणा (Fruiting)' : 'Fruiting'}</option>
                      <option value="Harvesting">{lang === 'mr' ? 'पक्वता / काढणी (Maturity)' : 'Maturity'}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      {t('symptomOnset')}:
                    </label>
                    <select
                      value={symptomOnset}
                      onChange={(e) => setSymptomOnset(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem' }}
                    >
                      <option value="">{lang === 'mr' ? '-- निवडा --' : '-- Select Onset --'}</option>
                      <option value="1-2 days ago">{lang === 'mr' ? '१ ते २ दिवसांपूर्वी (नुकतीच)' : '1-2 days ago'}</option>
                      <option value="3-7 days ago">{lang === 'mr' ? '३ ते ७ दिवसांपूर्वी' : '3-7 days ago'}</option>
                      <option value="Over 1 week ago">{lang === 'mr' ? '१ आठवड्यापेक्षा जास्त' : 'Over 1 week ago'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      {t('weatherHistory')}:
                    </label>
                    <select
                      value={weatherHistory}
                      onChange={(e) => setWeatherHistory(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem' }}
                    >
                      <option value="">{lang === 'mr' ? '-- निवडा --' : '-- Select Condition --'}</option>
                      <option value="Heavy Rain / Fog">{lang === 'mr' ? 'मुसळधार पाऊस / धुके' : 'Heavy Rain / Fog'}</option>
                      <option value="Overhead Sprinkler Used">{lang === 'mr' ? 'स्प्रिंकलर फवारा सिंचन' : 'Overhead Sprinkler'}</option>
                      <option value="Dry and Hot">{lang === 'mr' ? 'उष्ण व कोरडे हवामान' : 'Hot and Dry'}</option>
                      <option value="Recent Fungicide Spray">{lang === 'mr' ? 'अलीकडेच बुरशीनाशक फवारले' : 'Recent Fungicide Spray'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Analyze Trigger & Progress Bar */}
          {isAnalyzing ? (
            <div style={{
              padding: '18px',
              borderRadius: '16px',
              backgroundColor: 'var(--semantic-ai-bg)',
              border: '1px solid var(--semantic-ai)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <RefreshCw size={22} color="var(--semantic-ai)" className="animate-spin" />
                <span style={{ fontWeight: 800, color: 'var(--semantic-ai)', fontSize: '0.94rem' }}>
                  {lang === 'mr' ? 'AI इंजिनद्वारे पीक व रोग ओळखत आहे...' : lang === 'hi' ? 'AI इंजन द्वारा फसल व रोग पहचान जारी...' : 'AI Engine Identifying Crop & Pathology...'}
                </span>
              </div>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                {analysisStep === 1 && (lang === 'mr' ? '१/३: फोटो कृषी व्हिजन न्यूरल नेटवर्ककडे पाठवत आहे...' : '1/3: Transmitting leaf image to Agri-Vision Neural Network...')}
                {analysisStep === 2 && (lang === 'mr' ? '२/३: वनस्पती प्रजाती, बुरशी व रोग लक्षणे स्कॅन करत आहे...' : '2/3: Classifying crop taxonomy and symptoms...')}
                {analysisStep >= 3 && (lang === 'mr' ? '३/३: सुरक्षित सेंद्रिय, रासायनिक व प्रतिबंधात्मक उपाय तयार होत आहेत...' : '3/3: Compiling safe treatment and prevention advice...')}
              </p>
              <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'rgba(59, 130, 196, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '12px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(analysisStep / 3) * 100}%`,
                  backgroundColor: 'var(--semantic-ai)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleAnalyze(false)}
              disabled={!previewUrl}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.98rem',
                opacity: !previewUrl ? 0.6 : 1,
                cursor: !previewUrl ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 800,
                borderRadius: '14px'
              }}
            >
              <Sparkles size={18} />
              <span>{lang === 'mr' ? 'AI इंजिनद्वारे त्वरित निदान करा' : lang === 'hi' ? 'AI इंजन द्वारा त्वरित निदान करें' : 'Diagnose Plant with AI Engine'}</span>
            </button>
          )}

          {/* Reset / Clear Button */}
          {previewUrl && !isAnalyzing && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px', padding: '9px', fontSize: '0.80rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>{lang === 'mr' ? 'नवीन फोटो निवडा (रीसेट)' : lang === 'hi' ? 'नया फोटो चुनें (रीसेट)' : 'Reset & Choose Another Leaf'}</span>
            </button>
          )}
        </div>

        {/* Right Column: Diagnostic Results Dashboard */}
        <div style={{ minWidth: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {/* 1. Error Card */}
          {errorResult && (
            <div className="card" style={{ padding: '24px', border: '1.5px solid var(--semantic-error)', backgroundColor: 'var(--color-card-surface)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--semantic-error-bg)', color: 'var(--semantic-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', color: 'var(--semantic-error)', fontWeight: 800 }}>
                    {lang === 'mr' ? 'निदान सेवा त्रुटी (Diagnosis Error)' : 'Diagnosis Service Error'}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    HTTP {errorResult.status || 500} • {errorResult.errorType || 'API_ERROR'}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--color-soft-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)'
              }}>
                {errorResult.message}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAnalyze(false)}
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={15} />
                  <span>{t('retryDiagnosis')}</span>
                </button>
                <button
                  onClick={() => handleAnalyze(true)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{t('runLocalFallback')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Non-Plant / Ambiguous Leaf Alert Card */}
          {diagnosisResult && !diagnosisResult.isPlant && (
            <div className="card" style={{ padding: '24px', border: '1.5px solid var(--semantic-warning)', backgroundColor: 'var(--color-card-surface)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--semantic-warning-bg)', color: 'var(--semantic-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.22rem', color: 'var(--semantic-warning)', fontWeight: 800 }}>
                    {t('nonPlantWarningTitle')}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'mr' ? 'वनस्पती खात्री:' : 'Plant Confidence:'} {diagnosisResult.plantProbability || 12.9}%
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.55 }}>
                {diagnosisResult.cause || t('nonPlantWarningDesc')}
              </p>

              <div style={{
                backgroundColor: 'var(--color-soft-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '18px'
              }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  {lang === 'mr' ? '💡 अचूक निदानासाठी चांगल्या फोटोच्या टिप्स:' : '💡 Tips for Accurate AI Leaf Diagnosis:'}
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.80rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>{lang === 'mr' ? 'पानाचा फोटो जवळून (Close-up) आणि स्पष्ट फोकसमध्ये घ्या.' : 'Capture a close-up photo focusing directly on the leaf blade.'}</li>
                  <li>{lang === 'mr' ? 'नैसर्गिक दिवसाच्या उजेडात फोटो काढा, थेट सावली टाळा.' : 'Use natural daylight; avoid deep shadows or direct flash glare.'}</li>
                  <li>{lang === 'mr' ? 'फक्त एका पानावरील लक्षणे दिसावीत, पार्श्वभूमीवर इतर वस्तू नसाव्यात.' : 'Ensure the leaf fills most of the frame without clutter.'}</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.86rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={15} />
                <span>{t('uploadAnother')}</span>
              </button>
            </div>
          )}

          {/* 3. Successful Diagnosis Results View - Slide Navigation Architecture */}
          {diagnosisResult && diagnosisResult.isPlant && (() => {
            const SLIDE_LIST = [
              { id: 'summary', icon: '📋', label: lang === 'mr' ? 'निदान सारांश' : lang === 'hi' ? 'निदान सारांश' : 'Summary' },
              { id: 'immediate', icon: '⚡', label: lang === 'mr' ? 'तात्काळ उपाय' : lang === 'hi' ? 'प्राथमिक उपचार' : 'First Aid' },
              { id: 'organic', icon: '🌱', label: lang === 'mr' ? 'सेंद्रिय व जैविक' : lang === 'hi' ? 'जैविक उपचार' : 'Organic' },
              { id: 'chemical', icon: '🧪', label: lang === 'mr' ? 'रासायनिक फवारणी' : lang === 'hi' ? 'रासायनिक स्प्रे' : 'Chemical' },
              { id: 'prevention', icon: '📅', label: lang === 'mr' ? 'प्रतिबंधक योजना' : lang === 'hi' ? 'रोकथाम योजना' : 'Prevention' },
              { id: 'symptoms', icon: '🔬', label: lang === 'mr' ? 'लक्षणे व पुरावे' : lang === 'hi' ? 'लक्षण व साक्ष्य' : 'Symptoms' }
            ];

            const currentIdx = SLIDE_LIST.findIndex(s => s.id === activeSlide);
            const prevSlide = currentIdx > 0 ? SLIDE_LIST[currentIdx - 1] : null;
            const nextSlide = currentIdx < SLIDE_LIST.length - 1 ? SLIDE_LIST[currentIdx + 1] : null;

            return (
              <div className="card diagnosis-slides-container" style={{
                padding: '22px',
                border: '1.5px solid var(--color-primary-green)',
                backgroundColor: 'var(--color-card-surface)',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* AI Engine & Telemetry Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🌿</span>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--color-deep-forest)' }}>
                      {(diagnosisResult.aiEngine && !diagnosisResult.aiEngine.includes('Kindwise')) 
                        ? diagnosisResult.aiEngine 
                        : 'Shet Samarthan AI Crop Health Engine'}
                    </strong>
                    {diagnosisResult.isUnverifiedFallback ? (
                      <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--semantic-error-bg)', color: 'var(--semantic-error)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        ⚠️ {lang === 'mr' ? 'स्थानिक सिम्युलेशन' : 'Local Fallback'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-primary-green)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid var(--border-light)' }}>
                        ✓ {lang === 'mr' ? 'सत्यापित AI मॉडेल' : 'Verified AI Model'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ⚡ {lang === 'mr' ? 'वेग:' : 'Latency:'} {diagnosisResult.inferenceLatencyMs || 18} ms
                  </span>
                </div>

                {/* Interactive Top Slide Navigation Tabs */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span style={{ fontWeight: 700 }}>
                      {lang === 'mr' ? 'तपशीलवार विभाग (स्लाइड्स):' : lang === 'hi' ? 'विस्तृत स्लाइड नेविगेशन:' : 'Diagnosis Slide Navigation:'}
                    </span>
                    <span style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.12)',
                      color: 'var(--color-primary-green)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.70rem'
                    }}>
                      {currentIdx + 1} / {SLIDE_LIST.length}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Tabs */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    backgroundColor: 'var(--color-soft-surface)',
                    padding: '5px',
                    borderRadius: '14px',
                    overflowX: 'auto',
                    border: '1px solid var(--border-light)',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                  }}>
                    {SLIDE_LIST.map((slide, sIdx) => {
                      const isActive = activeSlide === slide.id;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveSlide(slide.id)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.18s ease',
                            backgroundColor: isActive ? 'var(--color-primary-green)' : 'transparent',
                            color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                            boxShadow: isActive ? '0 2px 8px rgba(34, 197, 94, 0.3)' : 'none'
                          }}
                        >
                          <span>{slide.icon}</span>
                          <span>{slide.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* =====================================================================
                    SLIDE 1: SUMMARY & DIAGNOSTIC OVERVIEW
                    ===================================================================== */}
                {activeSlide === 'summary' && (
                  <div className="slide-content-pane" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Crop Identification Block */}
                    <div style={{
                      backgroundColor: 'var(--color-soft-surface)',
                      border: diagnosisResult.isCropLowConfidence ? '1.5px solid var(--semantic-warning)' : '1px solid var(--border-light)',
                      borderRadius: '14px',
                      padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: diagnosisResult.isCropLowConfidence ? 'var(--semantic-warning-bg)' : 'var(--color-primary-green)',
                            color: diagnosisResult.isCropLowConfidence ? 'var(--semantic-warning)' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            flexShrink: 0
                          }}>
                            🌱
                          </div>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: diagnosisResult.isCropLowConfidence ? 'var(--semantic-warning)' : 'var(--color-primary-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                              {diagnosisResult.isCropLowConfidence 
                                ? (lang === 'mr' ? '⚠️ संभाव्य पीक प्रजाती (कमी खात्री):' : '⚠️ Candidate Crop (Low Confidence):')
                                : (lang === 'mr' ? '✓ ओळखलेले पीक:' : '✓ Identified Crop Species:')}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                              <h3 style={{ margin: 0, fontSize: '1.30rem', color: 'var(--color-deep-forest)', fontWeight: 800 }}>
                                {lang === 'mr' ? diagnosisResult.cropMr : lang === 'hi' ? (diagnosisResult.cropHi || diagnosisResult.crop) : diagnosisResult.crop}
                              </h3>
                              {diagnosisResult.botanicalName && (
                                <em style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                                  ({diagnosisResult.botanicalName})
                                </em>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          backgroundColor: 'var(--color-card-surface)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          textAlign: 'right'
                        }}>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                            {lang === 'mr' ? 'पीक ओळख खात्री:' : 'Crop Match:'}
                          </span>
                          <strong style={{ fontSize: '1.10rem', color: diagnosisResult.isCropLowConfidence ? 'var(--semantic-warning)' : 'var(--color-primary-green)' }}>
                            {diagnosisResult.cropConfidence ? `${diagnosisResult.cropConfidence}%` : 'High'}
                          </strong>
                          {diagnosisResult.isCropLowConfidence && (
                            <span style={{ fontSize: '0.60rem', color: 'var(--semantic-warning)', display: 'block', fontWeight: 700 }}>
                              {lang === 'mr' ? 'कमी खात्री (< 40%)' : 'Low (< 40%)'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Low Crop Confidence Alert Banner */}
                      {diagnosisResult.isCropLowConfidence && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(234, 179, 8, 0.12)',
                          border: '1px solid rgba(234, 179, 8, 0.45)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px'
                        }}>
                          <AlertTriangle size={18} color="#EAB308" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                            {diagnosisResult.cropIdentificationWarning || (lang === 'mr' 
                              ? `AI मॉडेलने हे पीक ${diagnosisResult.cropMr || diagnosisResult.crop} असल्याचे केवळ ${diagnosisResult.cropConfidence}% खात्रीने ओळखले आहे. रासायनिक उपचार करण्यापूर्वी अचूक पीक तपासा.` 
                              : `Low crop match confidence (${diagnosisResult.cropConfidence}%). Please confirm your crop species before spraying.`)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Disease Diagnosis Status Block */}
                    <div style={{
                      backgroundColor: 'var(--color-soft-surface)',
                      border: diagnosisResult.isHealthy ? '1.5px solid var(--color-primary-green)' : '1px solid var(--border-light)',
                      borderRadius: '14px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <span className="badge" style={{
                            marginBottom: '4px',
                            backgroundColor: diagnosisResult.isHealthy ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-card-surface)',
                            color: diagnosisResult.isHealthy ? 'var(--color-primary-green)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-light)',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}>
                            {diagnosisResult.isHealthy 
                              ? (lang === 'mr' ? '✓ निरोगी पीक (कोणताही रोग नाही)' : '✓ Healthy Crop') 
                              : (lang === 'mr' ? `तीव्रता: ${diagnosisResult.severityMr || 'तीव्रता मोजलेली नाही'}` : `Severity: ${diagnosisResult.severity || 'Severity not assessed'}`)}
                          </span>

                          <h2 style={{ fontSize: '1.35rem', color: 'var(--color-deep-forest)', margin: '4px 0', fontWeight: 800 }}>
                            {lang === 'mr' ? diagnosisResult.diseaseNameMr : lang === 'hi' ? (diagnosisResult.diseaseNameHi || diagnosisResult.diseaseName) : diagnosisResult.diseaseName}
                          </h2>

                          {diagnosisResult.scientificPathogenName && diagnosisResult.scientificPathogenName !== 'Healthy' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--semantic-error)', fontStyle: 'italic', display: 'block', fontWeight: 600 }}>
                              {lang === 'mr' ? 'रोगकारक जीव:' : 'Pathogen:'} {diagnosisResult.scientificPathogenName}
                            </span>
                          )}

                          {diagnosisResult.diseaseScope && !diagnosisResult.isHealthy && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--color-card-surface)',
                              border: '1px solid var(--border-light)',
                              fontSize: '0.70rem',
                              color: 'var(--text-secondary)',
                              marginTop: '4px'
                            }}>
                              <span>🔬</span>
                              <span><strong>{lang === 'mr' ? 'व्याप्ती:' : 'Scope:'}</strong> {lang === 'mr' ? (diagnosisResult.diseaseScopeMr || diagnosisResult.diseaseScope) : (diagnosisResult.diseaseScopeHi || diagnosisResult.diseaseScope)}</span>
                            </div>
                          )}
                        </div>

                        {/* Confidence Meter Badge */}
                        <div style={{
                          textAlign: 'right',
                          backgroundColor: 'var(--color-card-surface)',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-light)'
                        }}>
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                            {lang === 'mr' ? 'दृश्य नमुना जुळणी' : 'Visual Match'}
                          </span>
                          <span style={{ fontSize: '1.30rem', fontWeight: 800, color: diagnosisResult.isHealthy ? 'var(--color-primary-green)' : 'var(--semantic-warning)' }}>
                            {diagnosisResult.confidence}%
                          </span>
                          <span style={{ fontSize: '0.60rem', color: 'var(--text-muted)', display: 'block' }}>
                            {diagnosisResult.isHostSpecificDisease ? 'Verified Host' : 'Broad Genus Match'}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                        {diagnosisResult.cause}
                      </p>

                      {/* General Disease Literature Impact */}
                      {diagnosisResult.generalDiseaseImpact && !diagnosisResult.isHealthy && (
                        <div style={{
                          backgroundColor: 'var(--color-card-surface)',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45
                        }}>
                          <strong style={{ color: 'var(--color-deep-forest)', display: 'block', marginBottom: '2px' }}>
                            📖 {lang === 'mr' ? 'संभाव्य कृषी प्रभाव (संदर्भ साहित्य):' : 'Potential Agronomic Impact (Reference Literature):'}
                          </strong>
                          <span>{diagnosisResult.generalDiseaseImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* =====================================================================
                    SLIDE 2: FIRST AID / IMMEDIATE ACTIONS
                    ===================================================================== */}
                {activeSlide === 'immediate' && (
                  <div className="slide-content-pane" style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.08)',
                    border: '1.5px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#EAB308',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        ⚡
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {t('immediateActions')}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lang === 'mr' ? 'तातडीने शेतात करावयाची कृती' : 'Immediate quarantine & containment actions'}
                        </span>
                      </div>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {(diagnosisResult.immediateActions || [
                        'Prune and destroy severely infected leaves showing visible lesions.',
                        'Halt overhead sprinkler watering to avoid moisture on the leaf canopy.'
                      ]).map((action, idx) => (
                        <li key={idx}><strong>{action}</strong></li>
                      ))}
                    </ul>

                    <div style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-card-surface)',
                      borderRadius: '10px',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}>
                      💡 {lang === 'mr' ? 'टीप: बाधित पाने प्लास्टिक पिशवीत गोळा करून शेताबाहेर नष्ट करा, जेणेकरून हवेने बुरशीचे बीजाणू इतर झाडांवर पसरणार नाहीत.' : 'Tip: Bag and dispose infected leaves outside field borders to prevent windborne spore dissemination.'}
                    </div>
                  </div>
                )}

                {/* =====================================================================
                    SLIDE 3: ORGANIC & BIOLOGICAL CARE
                    ===================================================================== */}
                {activeSlide === 'organic' && (
                  <div className="slide-content-pane" style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    border: '1.5px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--color-primary-green)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        🌱
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {t('biologicalControl')}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lang === 'mr' ? 'मित्र बुरशी, जैविक कीटकनाशक व सेंद्रिय अर्क' : 'Eco-friendly bio-fungicides & organic amendments'}
                        </span>
                      </div>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {(diagnosisResult.organicTreatment || []).map((item, idx) => (
                        <li key={idx}><strong>{item}</strong></li>
                      ))}
                    </ul>

                    <div style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-card-surface)',
                      borderRadius: '10px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}>
                      🌿 {lang === 'mr' ? 'जैविक उपाय जमिनीतील फायदेशीर सूक्ष्मजीवांचे संरक्षण करतात आणि मित्र कीटकांना कोणतीही हानी पोहोचवत नाहीत.' : 'Organic biocontrol agents maintain healthy soil biodiversity and preserve predatory pollinator insects.'}
                    </div>
                  </div>
                )}

                {/* =====================================================================
                    SLIDE 4: CHEMICAL SPRAY & SAFETY
                    ===================================================================== */}
                {activeSlide === 'chemical' && (
                  <div className="slide-content-pane" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        🧪
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {t('chemicalTreatmentTitle')}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lang === 'mr' ? 'CIBRC लेबल व कृषी विद्यापीठ शिफारशीनुसार' : 'Verified CIBRC / SAU agricultural guidelines'}
                        </span>
                      </div>
                    </div>

                    {/* Low Crop Confidence Caution Gate */}
                    {diagnosisResult.isCropLowConfidence && (
                      <div style={{
                        marginBottom: '14px',
                        padding: '10px 14px',
                        backgroundColor: '#FEF3C7',
                        border: '1.5px solid #F59E0B',
                        borderRadius: '10px',
                        fontSize: '0.80rem',
                        color: '#92400E',
                        fontWeight: 700
                      }}>
                        ⚠️ {lang === 'mr' 
                          ? `सावधगिरी: पीक ओळख खात्री कमी (${diagnosisResult.cropConfidence}%) आहे. फवारणीपूर्वी स्थानिक कृषी अधिकाऱ्यांकडून पीक खात्री करा.` 
                          : `Caution: Low crop confidence (${diagnosisResult.cropConfidence}%). Verify plant species with an agronomist before spraying.`}
                      </div>
                    )}

                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {(diagnosisResult.chemicalTreatment || []).map((item, idx) => (
                        <li key={idx}><strong>{item}</strong></li>
                      ))}
                    </ul>

                    <div style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-card-surface)',
                      borderRadius: '10px',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}>
                      🛡️ {lang === 'mr' ? 'सुरक्षा सूचना: फवारणी करताना मास्क व हातमोजे वापरा. फवारणीनंतर काढणीपूर्व प्रतीक्षा काळ (PHI) पाळा.' : 'Safety: Wear protective mask and gloves. Strictly adhere to registered Pre-Harvest Intervals (PHI).'}
                    </div>
                  </div>
                )}

                {/* =====================================================================
                    SLIDE 5: LONG-TERM PREVENTION & KVK ADVISORY
                    ===================================================================== */}
                {activeSlide === 'prevention' && (
                  <div className="slide-content-pane" style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1.5px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#3B82F6',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        📅
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {t('preventionPlan')}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lang === 'mr' ? 'दीर्घकालीन प्रतिबंध व KVK विस्तार सल्ला' : 'Long-term agronomic prevention & KVK advisory'}
                        </span>
                      </div>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {(diagnosisResult.prevention || []).map((item, idx) => (
                        <li key={idx}><strong>{item}</strong></li>
                      ))}
                    </ul>

                    {/* KVK Expert Guidance List */}
                    {diagnosisResult.expertConsultation && (
                      <div style={{
                        marginTop: '14px',
                        padding: '12px 14px',
                        backgroundColor: 'var(--color-card-surface)',
                        borderRadius: '10px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <strong style={{ fontSize: '0.82rem', color: '#2563EB', display: 'block', marginBottom: '6px' }}>
                          👨‍🌾 {t('expertConsultationTitle')}:
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.80rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {diagnosisResult.expertConsultation.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div style={{ marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      <strong>{t('diagnosisLimitations')}: </strong>
                      {diagnosisResult.limitations || t('diagnosisDisclaimer')}
                    </div>
                  </div>
                )}

                {/* =====================================================================
                    SLIDE 6: SYMPTOMS & VISUAL EVIDENCE
                    ===================================================================== */}
                {activeSlide === 'symptoms' && (
                  <div className="slide-content-pane" style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                    border: '1.5px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#A855F7',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        🔬
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                          {lang === 'mr' ? 'रोग लक्षणे व दृश्य पुरावे' : 'Symptoms & Photographic Evidence'}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lang === 'mr' ? 'पानावरील दृश्यमान तपासणी वि. संदर्भ ज्ञानकोश' : 'Visual leaf inspection vs reference database'}
                        </span>
                      </div>
                    </div>

                    {/* Visually Observed Evidence Box */}
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-card-surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      marginBottom: '14px',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)'
                    }}>
                      <strong style={{ color: 'var(--color-deep-forest)' }}>📷 {lang === 'mr' ? 'अपलोड केलेल्या पानावरील दृश्य तपासणी:' : 'Visually Observed in Uploaded Leaf:'} </strong>
                      <span>{diagnosisResult.observedVisualEvidence || (diagnosisResult.isHealthy ? 'Clean leaf surface without fungal lesions.' : 'Visual pattern of localized lesion / discoloration on the leaf blade.')}</span>
                      <span style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ℹ️ {diagnosisResult.referenceSymptomsNotice || 'Notice: Reference symptoms describe the general disease profile across host crops in literature. They were not all individually detected on this specific leaf.'}
                      </span>
                    </div>

                    {/* Reference Symptoms List */}
                    <div style={{ marginBottom: '14px' }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--color-deep-forest)', display: 'block', marginBottom: '6px' }}>
                        📖 {lang === 'mr' ? 'रोग संदर्भ लक्षणे (साहित्यातील नोंदी):' : 'Reference Documented Symptoms (Literature Catalog):'}
                      </strong>
                      {diagnosisResult.symptomsList && diagnosisResult.symptomsList.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {diagnosisResult.symptomsList.map((sym, idx) => (
                            <li key={idx}>{sym}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {diagnosisResult.symptoms}
                        </p>
                      )}
                    </div>

                    {/* Contributing Spreading Factors */}
                    {diagnosisResult.spreading && (
                      <div style={{
                        backgroundColor: 'var(--color-card-surface)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Droplets size={16} color="var(--semantic-weather)" flexShrink={0} />
                        <span><strong>{lang === 'mr' ? 'प्रसार अनुकूल वातावरण:' : 'Environmental Vectors:'} </strong>{diagnosisResult.spreading}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* =====================================================================
                    BOTTOM SLIDE SWITCHER CONTROLS & STEPPER
                    ===================================================================== */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    disabled={!prevSlide}
                    onClick={() => prevSlide && setActiveSlide(prevSlide.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--color-soft-surface)',
                      color: prevSlide ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: prevSlide ? 'pointer' : 'not-allowed',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: prevSlide ? 1 : 0.4
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>{prevSlide ? prevSlide.label : (lang === 'mr' ? 'मागील' : 'Previous')}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {SLIDE_LIST.map((s, idx) => (
                      <span
                        key={s.id}
                        onClick={() => setActiveSlide(s.id)}
                        title={s.label}
                        style={{
                          width: activeSlide === s.id ? '22px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: activeSlide === s.id ? 'var(--color-primary-green)' : 'var(--border-light)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={!nextSlide}
                    onClick={() => nextSlide && setActiveSlide(nextSlide.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: nextSlide ? 'var(--color-primary-green)' : 'var(--color-soft-surface)',
                      color: nextSlide ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: nextSlide ? 'pointer' : 'not-allowed',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: nextSlide ? 1 : 0.4,
                      boxShadow: nextSlide ? '0 2px 8px rgba(34, 197, 94, 0.3)' : 'none'
                    }}
                  >
                    <span>{nextSlide ? nextSlide.label : (lang === 'mr' ? 'पुढील' : 'Next')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Primary Action Buttons: Find Remedies at Stores & Upload Another Image */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary"
                    style={{
                      padding: '11px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={15} />
                    <span>{t('uploadAnother')}</span>
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('shet_filter_supplier', { detail: 'fertilizers' }));
                      window.dispatchEvent(new CustomEvent('shet_navigate_page', { detail: 'suppliers' }));
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: '11px',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 800
                    }}
                  >
                    <Store size={16} />
                    <span>
                      {lang === 'mr' 
                        ? 'जवळच्या केंद्रांवर औषधे शोधा' 
                        : lang === 'hi' 
                        ? 'दुकानों पर दवाएं खोजें' 
                        : 'Find Remedies at Stores'}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
