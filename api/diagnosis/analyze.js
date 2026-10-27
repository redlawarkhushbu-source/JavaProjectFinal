/**
 * Standalone Vercel Serverless Function for Kindwise crop.health Analysis
 * Self-contained to guarantee 100% reliability on Vercel Cloud Lambdas without file tracing issues.
 */

const KINDWISE_DEFAULT_KEY = 'QooQmvWED6ewYOVDu5Ycy48yzgagIHnUThnIc7ASgURoVMJhvc';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Api-Key, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
  }

  try {
    const apiKey = (process.env.KINDWISE_API_KEY && !process.env.KINDWISE_API_KEY.includes('your_'))
      ? process.env.KINDWISE_API_KEY.trim()
      : KINDWISE_DEFAULT_KEY;

    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const imageBase64 = body.image || body.imageBase64;
    const knownCrop = body.crop || body.knownCrop;
    const latitude = body.latitude || body.lat || 18.5204;
    const longitude = body.longitude || body.lng || 73.8567;
    const growthStage = body.growthStage;
    const symptomOnset = body.symptomOnset;
    const weatherHistory = body.weatherHistory;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        errorType: 'EMPTY_IMAGE',
        message: 'No image data was provided for analysis.'
      });
    }

    let formattedImage = imageBase64;
    if (!formattedImage.startsWith('data:image/')) {
      formattedImage = `data:image/jpeg;base64,${formattedImage}`;
    }

    const payload = {
      images: [formattedImage],
      similar_images: true,
      latitude: Number(latitude),
      longitude: Number(longitude)
    };

    const endpoint = 'https://crop.kindwise.com/api/v1/identification?details=common_names,type,taxonomy,gbif_id,eppo_code,eppo_regulation_status,wiki_url,wiki_description,image,images,description,symptoms,severity,spreading,treatment&language=en';

    const t0 = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const apiResponse = await fetch(endpoint, {
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
    const latencyMs = Date.now() - t0;

    if (!apiResponse.ok) {
      const errText = await apiResponse.text().catch(() => '');
      return res.status(apiResponse.status).json({
        success: false,
        status: apiResponse.status,
        errorType: apiResponse.status === 401 ? 'AUTHENTICATION_FAILED' : apiResponse.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'API_ERROR',
        message: `Kindwise API responded with ${apiResponse.status}: ${errText || apiResponse.statusText}`
      });
    }

    const data = await apiResponse.json();
    const mapped = mapResult(data, latencyMs, knownCrop, growthStage, symptomOnset, weatherHistory);
    return res.status(200).json(mapped);
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: 500,
      errorType: err.name === 'AbortError' ? 'TIMEOUT' : 'SERVER_ERROR',
      message: err.name === 'AbortError'
        ? 'Kindwise crop.health request timed out after 25s.'
        : (err.message || 'Server error occurred during diagnosis.')
    });
  }
}

function mapResult(data, latencyMs, knownCrop, growthStage, symptomOnset, weatherHistory) {
  const result = data.result || {};
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
      severity: 'Uncertain',
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
      timestamp: new Date().toISOString()
    };
  }

  const cropSuggestions = result.crop?.suggestions || [];
  let cropName = knownCrop ? capitalize(knownCrop) : 'Crop';
  let botanicalName = 'Plantae';
  let cropConfidence = 0.0;
  const alternativeCrops = [];

  if (cropSuggestions.length > 0) {
    const topCrop = cropSuggestions[0];
    cropName = capitalize(topCrop.name || knownCrop || 'Crop');
    botanicalName = topCrop.scientific_name || 'Plantae';
    cropConfidence = Math.round((topCrop.probability || 0) * 1000) / 10;

    for (let i = 1; i < Math.min(4, cropSuggestions.length); i++) {
      const alt = cropSuggestions[i];
      alternativeCrops.push({
        name: capitalize(alt.name || ''),
        scientificName: alt.scientific_name || '',
        confidence: Math.round((alt.probability || 0) * 1000) / 10
      });
    }
  }

  const diseaseSuggestions = result.disease?.suggestions || [];
  let diseaseName = 'Healthy Crop';
  let scientificPathogenName = 'Healthy';
  let diseaseConfidence = 0.0;
  let isHealthy = false;
  let severity = 'Moderate';
  let description = '';
  let spreading = '';
  const symptomsList = [];
  const alternativeDiseases = [];
  let topDetails = null;

  if (diseaseSuggestions.length > 0) {
    const topDisease = diseaseSuggestions[0];
    const rawName = (topDisease.name || '').trim();
    scientificPathogenName = (topDisease.scientific_name || '').trim();
    diseaseConfidence = Math.round((topDisease.probability || 0) * 1000) / 10;
    topDetails = topDisease.details || {};

    if (rawName.toLowerCase() === 'healthy' || scientificPathogenName.toLowerCase() === 'healthy') {
      isHealthy = true;
      diseaseName = 'Healthy Crop (No Active Pathogen Detected)';
      severity = 'Healthy';
    } else {
      diseaseName = capitalize(rawName);
      severity = parseSeverity(topDetails.severity || 'Moderate');
    }

    if (topDetails.symptoms && typeof topDetails.symptoms === 'object') {
      for (const [key, val] of Object.entries(topDetails.symptoms)) {
        symptomsList.push(`${key}: ${String(val).trim()}`);
      }
    } else if (typeof topDetails.symptoms === 'string' && topDetails.symptoms.trim()) {
      symptomsList.push(topDetails.symptoms.trim());
    }

    description = topDetails.description || '';
    spreading = topDetails.spreading || '';

    for (let i = 1; i < Math.min(4, diseaseSuggestions.length); i++) {
      const alt = diseaseSuggestions[i];
      alternativeDiseases.push({
        name: capitalize(alt.name || ''),
        scientificName: alt.scientific_name || '',
        confidence: Math.round((alt.probability || 0) * 1000) / 10
      });
    }
  }

  const treatments = extractTreatments(topDetails, isHealthy, cropName, diseaseName);

  return {
    success: true,
    isPlant: true,
    plantProbability: plantProbabilityPct,
    isHealthy,
    status: isHealthy ? 'Healthy' : 'Diseased',
    crop: cropName,
    cropMr: translateCrop(cropName, 'mr'),
    cropHi: translateCrop(cropName, 'hi'),
    botanicalName,
    cropConfidence,
    alternativeCrops,
    diseaseName,
    diseaseNameMr: translateDisease(diseaseName, 'mr'),
    diseaseNameHi: translateDisease(diseaseName, 'hi'),
    scientificPathogenName,
    confidence: diseaseConfidence,
    severity,
    cause: description || 'Visual symptomatic profile analyzed and matched by Kindwise crop.health model.',
    spreading: spreading || 'Pathogen spread typically favored by high relative humidity, rain splashing, or prolonged leaf wetness.',
    symptoms: symptomsList.length > 0 
      ? symptomsList.join('; ') 
      : (isHealthy ? 'Lush green canopy, active venation, and clean leaf surface without signs of chlorosis, necrosis, or pest lesions.' : 'Visible lesions, chlorotic margins, and localized tissue distress.'),
    symptomsList,
    alternativeDiseases,
    immediateActions: treatments.immediateActions,
    organicTreatment: treatments.biological,
    organicTreatmentMr: treatments.biological,
    chemicalTreatment: treatments.chemical,
    chemicalTreatmentMr: treatments.chemical,
    prevention: treatments.prevention,
    preventionMr: treatments.prevention,
    expertConsultation: [
      'Consult your nearest Krishi Vigyan Kendra (KVK) or local Taluka Agriculture Officer if symptoms spread across more than 15% of your plot within 48 hours.',
      'Seek certified extension advice before investing in expensive systemic chemicals or tank-mixing multiple products.',
      'Take a fresh infected leaf specimen in a clean sealed plastic bag for physical inspection and confirmation at the local agricultural university.'
    ],
    limitations: 'Advisory Notice: Prediction confidence reflects statistical computer vision pattern matching against photographic reference datasets. It does not constitute laboratory molecular confirmation. Chemical recommendations are informative and must strictly comply with registered product labels in your jurisdiction.',
    aiEngine: 'Kindwise crop.health Official AI',
    inferenceLatencyMs: latencyMs,
    timestamp: new Date().toISOString(),
    fieldContext: { knownCrop, growthStage, symptomOnset, weatherHistory }
  };
}

function extractTreatments(details, isHealthy, cropName, diseaseName) {
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
  const rawBio = rawTreat['biological treatment'] || rawTreat.biological || [];
  if (Array.isArray(rawBio) && rawBio.length > 0) {
    for (const b of rawBio) biological.push(String(b).trim());
  }

  const rawChem = rawTreat['chemical treatment'] || rawTreat.chemical || [];
  if (Array.isArray(rawChem) && rawChem.length > 0) {
    for (const c of rawChem) chemical.push(String(c).trim());
  }

  const rawPrev = rawTreat.prevention || [];
  if (Array.isArray(rawPrev) && rawPrev.length > 0) {
    for (const p of rawPrev) prevention.push(String(p).trim());
  }

  immediate.push('Prune and isolate severely infected lower leaves showing active sporulation, and remove them safely from the plot.');
  immediate.push('Avoid overhead sprinkler irrigation; switch to drip or furrow irrigation to minimize leaf wetness duration.');
  immediate.push('Improve sunlight penetration and air circulation across the crop canopy by weeding plot borders.');

  if (biological.length === 0) {
    biological.push('Foliar spray of bio-fungicide Trichoderma viride or Pseudomonas fluorescens @ 10g/L in late afternoon.');
    biological.push('Apply 5% Neem Seed Kernel Extract (NSKE) or Neem Oil @ 5ml/L to suppress fungal proliferation.');
  }

  if (chemical.length === 0) {
    chemical.push(`Protective foliar spray of broad-spectrum contact fungicide (e.g. Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb 75% WP @ 2g/L) strictly according to registered label.`);
  }

  chemical.push(`CRITICAL REGULATORY NOTICE: Always verify that products are legally approved for ${cropName} in your state/district with your local Krishi Vigyan Kendra (KVK).`);
  chemical.push('LABEL COMPLIANCE: Adhere strictly to the manufacturer label for dilution and spray intervals. Wear certified PPE (mask, gloves, boots). Observe Pre-Harvest (PHI) and Re-entry (REI) intervals. Never mix pesticides without verified compatibility.');

  if (prevention.length === 0) {
    prevention.push('Practice crop rotation with non-host botanical families for at least 2 consecutive seasons.');
    prevention.push('Source certified disease-free seed stock and apply seed treatment prior to sowing.');
    prevention.push('Disinfect pruning tools and agricultural equipment between plots to avoid mechanical pathogen spread.');
  }

  return { immediateActions: immediate, biological, chemical, prevention };
}

function parseSeverity(val) {
  if (!val || typeof val !== 'string') return 'Moderate';
  const l = val.toLowerCase();
  if (l.includes('severe') || l.includes('high') || l.includes('devastating') || l.includes('critical')) return 'Severe';
  if (l.includes('low') || l.includes('mild') || l.includes('minor')) return 'Mild';
  return 'Moderate';
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
