import fs from 'fs';
import path from 'path';

/**
 * Server-Side Kindwise crop.health Engine
 * Reads API key strictly server-side. Never exposes secret to client browser.
 */

function getApiKey() {
  if (process.env.KINDWISE_API_KEY && !process.env.KINDWISE_API_KEY.includes('your_')) {
    return process.env.KINDWISE_API_KEY.trim();
  }

  // Attempt reading from .env files without external dependencies
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), 'frontend/.env')
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^KINDWISE_API_KEY=(.+)$/m);
        if (match && match[1]) {
          const val = match[1].trim().replace(/^["']|["']$/g, '');
          if (val && !val.includes('your_')) {
            return val;
          }
        }
      } catch (e) {}
    }
  }

  return null;
}

export function isKindwiseConfigured() {
  const key = getApiKey();
  return Boolean(key && key.length > 10);
}

export async function diagnosePlantWithKindwise({
  imageBase64,
  latitude = 18.5204,
  longitude = 73.8567,
  knownCrop = null,
  growthStage = null,
  symptomOnset = null,
  weatherHistory = null
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      errorType: 'MISSING_API_KEY',
      status: 500,
      message: 'Kindwise API key is not configured on the server. Please set KINDWISE_API_KEY in server environment.'
    };
  }

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return {
      success: false,
      errorType: 'EMPTY_IMAGE',
      status: 400,
      message: 'No image data was provided for analysis.'
    };
  }

  // Normalize base64 image data URL
  let formattedImage = imageBase64;
  if (!formattedImage.startsWith('data:image/')) {
    formattedImage = `data:image/jpeg;base64,${formattedImage}`;
  }

  const payload = {
    images: [formattedImage],
    similar_images: true
  };

  if (latitude != null && longitude != null) {
    payload.latitude = Number(latitude);
    payload.longitude = Number(longitude);
  }

  const endpoint = 'https://crop.kindwise.com/api/v1/identification?details=common_names,type,taxonomy,gbif_id,eppo_code,eppo_regulation_status,wiki_url,wiki_description,image,images,description,symptoms,severity,spreading,treatment&language=en';

  const t0 = Date.now();
  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
  } catch (err) {
    return {
      success: false,
      errorType: err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      status: 503,
      message: err.name === 'AbortError' 
        ? 'Kindwise diagnosis request timed out after 25 seconds. Please try again.'
        : 'Network connection error while contacting Kindwise crop.health service.'
    };
  }

  const latencyMs = Date.now() - t0;

  if (response.status === 401) {
    return {
      success: false,
      errorType: 'AUTHENTICATION_FAILED',
      status: 401,
      message: 'Kindwise crop.health API authentication failed. Verify server KINDWISE_API_KEY.'
    };
  }

  if (response.status === 429) {
    return {
      success: false,
      errorType: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      message: 'Kindwise API rate limit or credit quota has been reached. Please retry shortly.'
    };
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      errorDetail = await response.text();
    } catch (e) {}
    return {
      success: false,
      errorType: 'API_ERROR',
      status: response.status,
      message: `Kindwise API responded with status ${response.status}: ${errorDetail || response.statusText}`
    };
  }

  const data = await response.json();

  // 1. Sanitized logging in development and property mapping audit
  const sanitizedResponse = JSON.parse(JSON.stringify(data));
  if (sanitizedResponse.access_token) sanitizedResponse.access_token = '[REDACTED]';
  if (sanitizedResponse.custom_id) delete sanitizedResponse.custom_id;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Kindwise crop.health Dev] Sanitized Raw API Response:\n' + JSON.stringify(sanitizedResponse, null, 2));
  }

  return mapKindwiseResult(data, latencyMs, knownCrop, growthStage, symptomOnset, weatherHistory, sanitizedResponse);
}

function mapKindwiseResult(data, latencyMs, knownCrop, growthStage, symptomOnset, weatherHistory, sanitizedResponse = null) {
  const result = data.result || {};

  // 1. Plant Verification (is_plant)
  const isPlantObj = result.is_plant || {};
  const isPlantBinary = isPlantObj.binary !== false;
  const isPlantProb = typeof isPlantObj.probability === 'number' ? isPlantObj.probability : 1.0;
  const isPlantThreshold = typeof isPlantObj.threshold === 'number' ? isPlantObj.threshold : 0.5;

  const isPlantConfirmed = isPlantBinary && (isPlantProb >= isPlantThreshold);
  const plantProbabilityPct = Math.round(isPlantProb * 1000) / 10;

  if (!isPlantConfirmed) {
    return {
      success: true,
      isPlant: false,
      plantProbability: plantProbabilityPct,
      status: 'NonPlantOrAmbiguous',
      severity: 'Severity not assessed',
      severityMr: 'तीव्रता मोजलेली नाही',
      severityHi: 'तीव्रता का आकलन नहीं किया गया',
      crop: 'Unknown',
      cropMr: 'अनोळखी',
      cropHi: 'अज्ञात',
      diseaseName: 'Plant Leaf Not Confirmed',
      diseaseNameMr: 'वनस्पतीचे पान ओळखले नाही',
      diseaseNameHi: 'पौधे की पत्ती पहचानी नहीं गई',
      confidence: plantProbabilityPct,
      cause: 'The uploaded image does not appear to contain a recognizable plant leaf or agricultural crop.',
      symptoms: 'Low botanical feature confidence. Photo may be blurry, poorly lit, obstructed, or depicting tools, soil, or non-plant objects.',
      warning: 'Please capture a clear, focused, close-up photograph of an active crop leaf in good daylight.',
      limitations: 'The AI model requires distinct botanical structures (such as veins, blade margins, and chlorophyll pigmentation) to perform diagnosis.',
      aiEngine: 'Kindwise crop.health Official AI',
      inferenceLatencyMs: latencyMs,
      timestamp: new Date().toISOString(),
      _sanitizedRawResponse: sanitizedResponse
    };
  }

  // 2. Crop Taxonomy Identification & Confidence Analysis
  const cropSuggestions = result.crop?.suggestions || [];
  let cropName = knownCrop ? capitalize(knownCrop) : 'Crop';
  let botanicalName = 'Plantae';
  let cropProbabilityRaw = 0.0;
  let cropConfidence = 0.0;
  const alternativeCrops = [];

  if (cropSuggestions.length > 0) {
    const topCrop = cropSuggestions[0];
    cropName = capitalize(topCrop.name || knownCrop || 'Crop');
    botanicalName = topCrop.scientific_name || 'Plantae';
    cropProbabilityRaw = topCrop.probability || 0.0;
    cropConfidence = Math.round(cropProbabilityRaw * 1000) / 10;

    for (let i = 1; i < Math.min(4, cropSuggestions.length); i++) {
      const alt = cropSuggestions[i];
      alternativeCrops.push({
        name: capitalize(alt.name || ''),
        scientificName: alt.scientific_name || '',
        confidence: Math.round((alt.probability || 0) * 1000) / 10
      });
    }
  }

  // Determine crop confidence level & warning
  const isCropLowConfidence = cropConfidence < 40.0;
  const cropConfidenceLevel = cropConfidence >= 70.0 ? 'high' : (cropConfidence >= 40.0 ? 'moderate' : 'low');
  const cropIdentificationWarning = isCropLowConfidence
    ? `Low Crop Match Confidence (${cropConfidence}%): The AI model cannot reliably confirm that this leaf belongs to ${cropName} (${botanicalName}). Visual features may be ambiguous or captured at an extreme angle. Please verify your crop or upload a clearer close-up showing leaf venation and stem.`
    : null;

  // 3. Health & Disease Assessment
  const diseaseSuggestions = result.disease?.suggestions || [];
  let diseaseName = 'Healthy Crop';
  let scientificPathogenName = 'Healthy';
  let diseaseProbabilityRaw = 0.0;
  let diseaseConfidence = 0.0;
  let isHealthy = false;
  let description = '';
  let spreading = '';
  const symptomsList = [];
  const alternativeDiseases = [];
  let topDetails = null;

  // Broad pathogen identification check (e.g. Anthracnose / Colletotrichum)
  let isHostSpecificDisease = false;
  let diseaseScope = 'General Pathology';
  let diseaseScopeMr = 'सामान्य रोग वर्गीकरण';
  let diseaseScopeHi = 'सामान्य रोग वर्गीकरण';

  if (diseaseSuggestions.length > 0) {
    const topDisease = diseaseSuggestions[0];
    const rawName = (topDisease.name || '').trim();
    scientificPathogenName = (topDisease.scientific_name || '').trim();
    diseaseProbabilityRaw = topDisease.probability || 0.0;
    diseaseConfidence = Math.round(diseaseProbabilityRaw * 1000) / 10;
    topDetails = topDisease.details || {};

    if (rawName.toLowerCase() === 'healthy' || scientificPathogenName.toLowerCase() === 'healthy') {
      isHealthy = true;
      diseaseName = 'Healthy Crop (No Active Pathogen Detected)';
      diseaseScope = 'Healthy';
      isHostSpecificDisease = true;
    } else {
      diseaseName = capitalize(rawName);

      // Verify whether anthracnose is genus-level Colletotrichum or specific to sugarcane
      const pathogenLower = scientificPathogenName.toLowerCase();
      const diseaseLower = rawName.toLowerCase();
      if (pathogenLower === 'colletotrichum' || diseaseLower === 'anthracnose') {
        isHostSpecificDisease = false;
        diseaseScope = 'Broad Pathogen Group (Colletotrichum genus - Anthracnose). Not host-specific to sugarcane.';
        diseaseScopeMr = 'विस्तृत रोगकारक गट (कॉलेटोट्रिकम प्रजाती - करपा). उसासाठी विशिष्ट नाही.';
        diseaseScopeHi = 'व्यापक रोगज़नक़ समूह (कॉलेटोट्राइकम जीनस - एन्थ्रेक्नोज). गन्ने तक विशिष्ट नहीं.';
      } else {
        isHostSpecificDisease = !isCropLowConfidence && cropConfidence >= 70.0;
        diseaseScope = isHostSpecificDisease ? 'Crop-Specific Pathology' : 'Broad Visual Pattern Match';
        diseaseScopeMr = isHostSpecificDisease ? 'पीक-विशिष्ट रोग' : 'दृश्य नमुना जुळणी';
        diseaseScopeHi = isHostSpecificDisease ? 'फसल-विशिष्ट रोग' : 'दृश्य पैटर्न मिलान';
      }
    }

    // Extract reference symptoms from encyclopedia
    if (topDetails.symptoms && typeof topDetails.symptoms === 'object') {
      for (const [key, val] of Object.entries(topDetails.symptoms)) {
        symptomsList.push(`${key}: ${String(val).trim()}`);
      }
    } else if (typeof topDetails.symptoms === 'string' && topDetails.symptoms.trim()) {
      symptomsList.push(topDetails.symptoms.trim());
    }

    description = topDetails.description || '';
    spreading = topDetails.spreading || '';

    // Alternative diagnoses
    for (let i = 1; i < Math.min(4, diseaseSuggestions.length); i++) {
      const alt = diseaseSuggestions[i];
      alternativeDiseases.push({
        name: capitalize(alt.name || ''),
        scientificName: alt.scientific_name || '',
        confidence: Math.round((alt.probability || 0) * 1000) / 10
      });
    }
  }

  // 4. Severity Assessment Rule:
  // "Do not derive severity from disease confidence or general disease descriptions. If severity cannot be reliably measured, display 'Severity not assessed'."
  const severity = isHealthy ? 'Healthy' : 'Severity not assessed';
  const severityMr = isHealthy ? 'निरोगी' : 'तीव्रता मोजलेली नाही';
  const severityHi = isHealthy ? 'स्वस्थ' : 'तीव्रता का आकलन नहीं किया गया';

  // Preserve general encyclopedic disease impact paragraph separately
  const generalDiseaseImpact = topDetails?.severity || '';

  // 5. Crop-Specific & Verified Treatment Guidance
  const treatmentObj = extractTreatments(topDetails, isHealthy, cropName, botanicalName, diseaseName, isCropLowConfidence, cropConfidence);

  // 6. Source Property Mapping Audit Object
  const fieldSourceMapping = {
    crop: 'result.crop.suggestions[0].name',
    botanicalName: 'result.crop.suggestions[0].scientific_name',
    cropConfidence: 'result.crop.suggestions[0].probability (percentage formatted)',
    cropConfidenceLevel: 'Derived threshold: <40% low, 40-70% moderate, >=70% high',
    cropIdentificationWarning: 'Generated when cropConfidence < 40% to prevent unverified treatment',
    diseaseName: 'result.disease.suggestions[0].name',
    scientificPathogenName: 'result.disease.suggestions[0].scientific_name',
    confidence: 'result.disease.suggestions[0].probability (visual pattern match percentage)',
    diseaseScope: 'Taxonomic evaluation: Colletotrichum represents a broad fungal genus across crops',
    isHostSpecificDisease: 'false for genus-level Colletotrichum or when crop identification is unconfirmed',
    referenceSymptoms: 'result.disease.suggestions[0].details.symptoms (encyclopedic reference catalog, NOT visually confirmed on this leaf)',
    generalDiseaseImpact: 'result.disease.suggestions[0].details.severity (encyclopedic description of potential agricultural loss)',
    severity: 'Set strictly to "Severity not assessed" as leaf lesion severity cannot be reliably quantified from single photo',
    treatment: 'result.disease.suggestions[0].details.treatment cross-checked with crop-specific CIBRC/SAU guidance'
  };

  return {
    success: true,
    isPlant: true,
    plantProbability: plantProbabilityPct,
    isHealthy,
    status: isHealthy ? 'Healthy' : 'Diseased',
    
    // Crop identification fields
    crop: cropName,
    cropMr: translateCrop(cropName, 'mr'),
    cropHi: translateCrop(cropName, 'hi'),
    botanicalName,
    cropConfidence,
    cropProbabilityRaw,
    cropConfidenceLevel,
    isCropLowConfidence,
    cropIdentificationWarning,
    alternativeCrops,

    // Disease pathology fields
    diseaseName,
    diseaseNameMr: translateDisease(diseaseName, 'mr'),
    diseaseNameHi: translateDisease(diseaseName, 'hi'),
    scientificPathogenName,
    confidence: diseaseConfidence,
    diseaseProbabilityRaw,
    isHostSpecificDisease,
    diseaseScope,
    diseaseScopeMr,
    diseaseScopeHi,
    severity,
    severityMr,
    severityHi,
    generalDiseaseImpact,

    cause: description || 'Visual symptomatic profile analyzed and matched by Kindwise crop.health model.',
    spreading: spreading || 'Pathogen spread typically favored by high relative humidity, rain splashing, or prolonged leaf wetness.',
    
    // Separated symptoms: reference catalog vs visually observed
    referenceSymptoms: symptomsList,
    symptoms: symptomsList.length > 0 
      ? symptomsList.join('; ') 
      : (isHealthy ? 'Lush green canopy, active venation, and clean leaf surface without signs of chlorosis, necrosis, or pest lesions.' : 'Visible lesions, chlorotic margins, and localized tissue distress.'),
    symptomsList,
    referenceSymptomsNotice: 'Reference symptoms describe typical signs documented across host crops in agricultural literature. They were not all individually detected on this specific leaf.',
    observedVisualEvidence: isHealthy 
      ? 'Clean leaf surface without active fungal sporulation or chlorotic rings.' 
      : 'Visual pattern of localized lesion / discoloration on the examined leaf blade.',
    alternativeDiseases,

    // Division A: Immediate Cultural / Field Triage Actions
    immediateActions: treatmentObj.immediateActions,

    // Division B: Biological & Non-Chemical Controls
    organicTreatment: treatmentObj.biological,
    organicTreatmentMr: treatmentObj.biological,

    // Division C: Chemical Treatment & Safe Medication Guidance
    chemicalTreatment: treatmentObj.chemical,
    chemicalTreatmentMr: treatmentObj.chemical,

    // Division D: Prevention Plan
    prevention: treatmentObj.prevention,
    preventionMr: treatmentObj.prevention,

    // Expert Consultation Guidelines
    expertConsultation: [
      'Consult your nearest Krishi Vigyan Kendra (KVK) or local Taluka Agriculture Officer if symptoms spread across more than 15% of your plot within 48 hours.',
      'Seek certified extension advice before investing in expensive systemic chemicals or tank-mixing multiple products.',
      'Take a fresh infected leaf specimen in a clean sealed plastic bag for physical inspection and confirmation at the local agricultural university.'
    ],

    // Limitations Disclaimer
    limitations: 'Advisory Notice: Prediction confidence reflects statistical computer vision pattern matching against photographic reference datasets. It does not constitute laboratory molecular confirmation. Chemical recommendations are informative and must strictly comply with registered product labels in your jurisdiction.',

    aiEngine: 'Kindwise crop.health Official AI',
    inferenceLatencyMs: latencyMs,
    timestamp: new Date().toISOString(),

    // Audit and Debug Telemetry
    _fieldSourceMapping: fieldSourceMapping,
    _sanitizedRawResponse: sanitizedResponse,

    fieldContext: {
      knownCrop,
      growthStage,
      symptomOnset,
      weatherHistory
    }
  };
}

function extractTreatments(details, isHealthy, cropName, botanicalName, diseaseName, isCropLowConfidence, cropConfidence) {
  const immediate = [];
  const biological = [];
  const chemical = [];
  const prevention = [];

  if (isHealthy) {
    immediate.push('No immediate curative intervention required. Maintain routine plot scouting.');
    biological.push('Apply beneficial organic manure or Jeevamrut @ 200L/acre with regular irrigation every 15 days.');
    chemical.push('Chemical fungicide/pesticide sprays are strictly unnecessary for healthy plants at this stage.');
    prevention.push('Inspect the undersides of leaves weekly for early signs of mites, aphids, or fungal spores.');
    return { immediateActions: immediate, biological, chemical, prevention };
  }

  const rawTreat = details?.treatment || {};

  // 1. Biological treatment
  const rawBio = rawTreat['biological treatment'] || rawTreat.biological || [];
  if (Array.isArray(rawBio) && rawBio.length > 0) {
    for (const b of rawBio) biological.push(String(b).trim());
  }

  // 2. Chemical treatment
  const rawChem = rawTreat['chemical treatment'] || rawTreat.chemical || [];
  if (Array.isArray(rawChem) && rawChem.length > 0) {
    for (const c of rawChem) chemical.push(String(c).trim());
  }

  // 3. Prevention
  const rawPrev = rawTreat.prevention || [];
  if (Array.isArray(rawPrev) && rawPrev.length > 0) {
    for (const p of rawPrev) prevention.push(String(p).trim());
  }

  const isSugarcane = (cropName && cropName.toLowerCase().includes('sugarcane')) || 
                      (botanicalName && botanicalName.toLowerCase().includes('saccharum'));
  const isAnthracnose = diseaseName && (diseaseName.toLowerCase().includes('anthracnose') || diseaseName.toLowerCase().includes('colletotrichum'));

  // Immediate Cultural / Field Actions
  if (isSugarcane && isAnthracnose) {
    immediate.push('Rogue out and safely burn severely infected sugarcane tillers or dead hearts to prevent pathogen survival in sett tissue.');
    immediate.push('Ensure immediate furrow drainage; avoid stagnant waterlogging around the root zone which triggers rapid secondary spread.');
    immediate.push('Disinfect harvesting knives and sickle blades with 5% Lysol or bleach solution between rows.');
  } else {
    immediate.push('Prune and isolate severely infected lower leaves showing active sporulation, and remove them safely from the plot.');
    immediate.push('Avoid overhead sprinkler irrigation; switch to drip or furrow irrigation to minimize leaf wetness duration.');
    immediate.push('Improve sunlight penetration and air circulation across the crop canopy by weeding plot borders.');
  }

  // Biological controls
  if (isSugarcane && isAnthracnose) {
    biological.unshift('Seed Sett Treatment: Soak seed setts in suspension of bio-control agent Trichoderma viride or Pseudomonas fluorescens @ 10g/L for 20 minutes prior to planting (ICAR-SBI recommendation).');
    biological.push('Soil Enrichment: Apply 2.5 kg Trichoderma harzianum incubated in 250 kg well-decomposed Farm Yard Manure (FYM) per acre during field preparation.');
  } else if (biological.length === 0) {
    biological.push('Foliar spray of bio-fungicide Trichoderma viride or Pseudomonas fluorescens @ 10g/L in late afternoon.');
    biological.push('Apply 5% Neem Seed Kernel Extract (NSKE) or Neem Oil @ 5ml/L to suppress fungal proliferation.');
  }

  // Chemical treatment with mandatory crop-specific verification
  if (isCropLowConfidence) {
    chemical.unshift(`⚠️ CRITICAL CROP UNCONFIRMED WARNING: Crop match confidence is low (${cropConfidence}%). Chemical fungicides must NOT be applied until crop identity is positively confirmed. Dosages, registration, and Pre-Harvest Intervals (PHI) vary strictly by crop under CIBRC regulations.`);
  }

  if (isSugarcane && isAnthracnose) {
    chemical.push('Sett Dip Treatment (Primary Agronomic Window): For Colletotrichum / Red Rot in sugarcane, dip setts in Carbendazim 50% WP @ 1g/L water for 15 minutes before planting to eliminate sett-borne fungal inocula (ICAR-Sugarcane Breeding Institute Package of Practices).');
    chemical.push('Foliar Protective Spray: If spindle/leaf anthracnose spots appear in early vegetative stage, apply Copper Oxychloride 50% WP @ 2.5g/L or Thiophanate methyl 70% WP @ 1.5g/L only if formally recommended by your local Krishi Vigyan Kendra (KVK).');
  } else if (chemical.length === 0) {
    chemical.push(`Protective foliar spray of broad-spectrum contact fungicide (e.g. Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb 75% WP @ 2g/L) strictly according to registered label.`);
  }

  // Mandatory Safety & Regulatory Box Appended to Chemical Treatment
  chemical.push(`CIBRC LABEL COMPLIANCE: Verify that products are legally registered for ${cropName} in your state with your local Krishi Vigyan Kendra (KVK) or Agriculture Officer. Adhere strictly to manufacturer label for dilution and spray intervals. Wear certified PPE. Observe Pre-Harvest (PHI) and Re-entry (REI) intervals.`);

  // Prevention
  if (isSugarcane && isAnthracnose) {
    prevention.push('Source certified disease-free seed setts from registered nurseries; avoid taking seed from plots showing red rot / anthracnose.');
    prevention.push('Never take ratoon crops from plots showing widespread Colletotrichum infection; rotate with legume crops (e.g. Soybean, Gram) for at least 1-2 seasons.');
    prevention.push('Practice hot water treatment of seed setts at 52°C for 30 minutes where facility is available.');
  } else if (prevention.length === 0) {
    prevention.push('Practice crop rotation with non-host botanical families for at least 2 consecutive seasons.');
    prevention.push('Source certified disease-free seed stock and apply seed treatment prior to sowing.');
    prevention.push('Disinfect pruning tools and agricultural equipment between plots to avoid mechanical pathogen spread.');
  }

  return { immediateActions: immediate, biological, chemical, prevention };
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function translateCrop(crop, lang) {
  const l = (crop || '').toLowerCase();
  if (lang === 'mr') {
    if (l.includes('tomato')) return 'टोमॅटो';
    if (l.includes('cotton')) return 'कापूस';
    if (l.includes('potato')) return 'बटाटा';
    if (l.includes('rice') || l.includes('paddy')) return 'भात';
    if (l.includes('wheat')) return 'गहू';
    if (l.includes('soybean') || l.includes('soya')) return 'सोयाबीन';
    if (l.includes('sugarcane')) return 'ऊस';
    if (l.includes('chilli') || l.includes('pepper')) return 'मिरची';
    if (l.includes('onion')) return 'कांदा';
    if (l.includes('grape')) return 'द्राक्ष';
    if (l.includes('brinjal') || l.includes('eggplant')) return 'वांगी';
  } else if (lang === 'hi') {
    if (l.includes('tomato')) return 'टमाटर';
    if (l.includes('cotton')) return 'कपास';
    if (l.includes('potato')) return 'आलू';
    if (l.includes('rice') || l.includes('paddy')) return 'धान / चावल';
    if (l.includes('wheat')) return 'गेहूं';
    if (l.includes('soybean') || l.includes('soya')) return 'सोयाबीन';
    if (l.includes('sugarcane')) return 'गन्ना';
    if (l.includes('chilli') || l.includes('pepper')) return 'मिर्च';
    if (l.includes('onion')) return 'प्याज';
    if (l.includes('grape')) return 'अंगूर';
    if (l.includes('brinjal') || l.includes('eggplant')) return 'बैंगन';
  }
  return crop;
}

function translateDisease(disease, lang) {
  const l = (disease || '').toLowerCase();
  if (lang === 'mr') {
    if (l.includes('early blight')) return 'टोमॅटोचा करपा रोग (अल्टरनेरिया सोलाणी)';
    if (l.includes('late blight')) return 'उशिरा येणारा करपा (फायटोफ्थोरा इन्फेस्टन्स)';
    if (l.includes('curl')) return 'पानांचा चुरमुरडा / कुकडा रोग';
    if (l.includes('bacterial') && l.includes('blight')) return 'जिवाणूजन्य करपा रोग';
    if (l.includes('rust')) return 'तांबेरा रोग';
    if (l.includes('mildew')) return 'केवडा / भुरी रोग';
    if (l.includes('healthy')) return 'निरोगी पीक (कोणताही रोग आढळला नाही)';
  } else if (lang === 'hi') {
    if (l.includes('early blight')) return 'अगेती झुलसा रोग (अल्टरनेरिया)';
    if (l.includes('late blight')) return 'पछेती झुलसा रोग (फाइटोफ्थोरा)';
    if (l.includes('curl')) return 'पत्ती मरोड़ / कुकड़ा रोग';
    if (l.includes('bacterial') && l.includes('blight')) return 'जीवाणु झुलसा रोग';
    if (l.includes('rust')) return 'गेरुआ / रतुआ रोग';
    if (l.includes('mildew')) return 'चूर्णिल आसिता / डाउनी फफूंद';
    if (l.includes('healthy')) return 'स्वस्थ फसल (कोई सक्रिय रोग नहीं)';
  }
  return disease;
}
