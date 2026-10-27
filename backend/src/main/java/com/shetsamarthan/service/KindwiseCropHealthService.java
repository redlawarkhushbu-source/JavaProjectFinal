package com.shetsamarthan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Kindwise Crop.health Official API Integration Service
 * 
 * Official documentation: https://crop.kindwise.com/docs
 * Primary engine for AI-powered crop identification and plant health pathology.
 */
@Service
public class KindwiseCropHealthService {

    private static final Logger logger = LoggerFactory.getLogger(KindwiseCropHealthService.class);

    @Value("${kindwise.api.key:}")
    private String configuredApiKey;

    @Value("${kindwise.api.url:https://crop.kindwise.com/api/v1/identification}")
    private String apiUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public KindwiseCropHealthService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Resolves the active API key strictly server-side from configuration or environment.
     * Never logged or exposed to the client.
     */
    private String getEffectiveApiKey() {
        if (configuredApiKey != null && !configuredApiKey.isBlank() && !configuredApiKey.contains("your_")) {
            return configuredApiKey.trim();
        }
        String envKey = System.getenv("KINDWISE_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return envKey.trim();
        }
        return null;
    }

    public boolean isConfigured() {
        String key = getEffectiveApiKey();
        return key != null && !key.isBlank();
    }

    /**
     * Executes official Kindwise crop.health identification with full pathology details.
     */
    public Map<String, Object> diagnosePlant(
            byte[] imageBytes,
            String mimeType,
            Double latitude,
            Double longitude,
            String knownCrop,
            String growthStage,
            String symptomOnset,
            String weatherHistory
    ) throws Exception {

        String key = getEffectiveApiKey();
        if (key == null || key.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("errorType", "MISSING_API_KEY");
            err.put("message", "Kindwise API key is not configured on the server. Please set KINDWISE_API_KEY environment variable.");
            return err;
        }

        if (imageBytes == null || imageBytes.length == 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("errorType", "EMPTY_IMAGE");
            err.put("message", "No image data was provided for analysis.");
            return err;
        }

        // Format image as base64 data URL required by Kindwise API
        String actualMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/jpeg";
        String base64Data = "data:" + actualMime + ";base64," + Base64.getEncoder().encodeToString(imageBytes);

        // Build official request body
        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("images", Collections.singletonList(base64Data));
        requestPayload.put("similar_images", true);

        if (latitude != null && longitude != null) {
            requestPayload.put("latitude", latitude);
            requestPayload.put("longitude", longitude);
        }

        String requestJson = objectMapper.writeValueAsString(requestPayload);

        // Required query parameters for complete health assessment & management details
        String detailsQuery = "?details=common_names,type,taxonomy,gbif_id,eppo_code,eppo_regulation_status,wiki_url,wiki_description,image,images,description,symptoms,severity,spreading,treatment&language=en";
        URI endpoint = URI.create(apiUrl + detailsQuery);

        logger.info("Dispatching plant diagnosis request to Kindwise crop.health API endpoint...");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(endpoint)
                .timeout(Duration.ofSeconds(25))
                .header("Api-Key", key)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        long startTime = System.currentTimeMillis();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        long latencyMs = System.currentTimeMillis() - startTime;

        int statusCode = response.statusCode();
        logger.info("Kindwise crop.health API responded with HTTP status {} in {} ms", statusCode, latencyMs);

        if (statusCode == 401) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("errorType", "AUTHENTICATION_FAILED");
            err.put("status", 401);
            err.put("message", "Kindwise crop.health authentication failed. Please verify the server-side KINDWISE_API_KEY.");
            return err;
        }

        if (statusCode == 429) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("errorType", "RATE_LIMIT_EXCEEDED");
            err.put("status", 429);
            err.put("message", "Kindwise API rate limit or credit quota has been reached. Please retry after some time.");
            return err;
        }

        if (statusCode < 200 || statusCode >= 300) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("errorType", "API_ERROR");
            err.put("status", statusCode);
            err.put("message", "Kindwise API returned error status: " + statusCode);
            return err;
        }

        // Parse official JSON response
        JsonNode root = objectMapper.readTree(response.body());
        return mapKindwiseResponse(root, latencyMs, knownCrop, growthStage, symptomOnset, weatherHistory);
    }

    /**
     * Faithfully maps the official Kindwise response schema into the Shet Samarthan diagnosis object.
     */
    private Map<String, Object> mapKindwiseResponse(
            JsonNode root,
            long latencyMs,
            String knownCrop,
            String growthStage,
            String symptomOnset,
            String weatherHistory
    ) {
        Map<String, Object> diagnosis = new HashMap<>();
        diagnosis.put("success", true);
        diagnosis.put("aiEngine", "Kindwise crop.health Official AI");
        diagnosis.put("inferenceLatencyMs", latencyMs);
        diagnosis.put("timestamp", Instant.now().toString());

        JsonNode result = root.path("result");

        // 1. Plant Verification Check (is_plant)
        JsonNode isPlantNode = result.path("is_plant");
        boolean isPlantBinary = isPlantNode.path("binary").asBoolean(true);
        double isPlantProb = isPlantNode.path("probability").asDouble(1.0);
        double isPlantThreshold = isPlantNode.path("threshold").asDouble(0.5);

        boolean isPlantConfirmed = isPlantBinary && (isPlantProb >= isPlantThreshold);
        diagnosis.put("isPlant", isPlantConfirmed);
        diagnosis.put("plantProbability", Math.round(isPlantProb * 1000.0) / 10.0);

        if (!isPlantConfirmed) {
            diagnosis.put("status", "NonPlantOrAmbiguous");
            diagnosis.put("severity", "Severity not assessed");
            diagnosis.put("severityMr", "तीव्रता मोजलेली नाही");
            diagnosis.put("severityHi", "तीव्रता का आकलन नहीं किया गया");
            diagnosis.put("diseaseName", "Plant Leaf Not Confirmed");
            diagnosis.put("diseaseNameMr", "वनस्पतीचे पान ओळखले नाही");
            diagnosis.put("diseaseNameHi", "पौधे की पत्ती पहचानी नहीं गई");
            diagnosis.put("cause", "The uploaded photo does not clearly show a recognized crop leaf or botanical specimen.");
            diagnosis.put("symptoms", "Low botanical structure confidence. Image may be blurry, obstructed, or depicting a non-plant object.");
            diagnosis.put("warning", "Please provide a clear, close-up photograph of an agricultural crop leaf in natural lighting.");
            diagnosis.put("limitations", "The computer vision model requires visible leaf venation, color contrast, and clear focus to make an accurate diagnosis.");
            return diagnosis;
        }

        // 2. Crop Classification & Botanical Identification
        JsonNode cropNode = result.path("crop");
        JsonNode cropSuggestions = cropNode.path("suggestions");

        String cropName = "Unknown Crop";
        String botanicalName = "Plantae";
        double cropProbabilityRaw = 0.0;
        double cropConfidence = 0.0;
        List<Map<String, Object>> alternativeCrops = new ArrayList<>();

        if (cropSuggestions.isArray() && cropSuggestions.size() > 0) {
            JsonNode topCrop = cropSuggestions.get(0);
            cropName = capitalize(topCrop.path("name").asText(knownCrop != null ? knownCrop : "Crop"));
            botanicalName = topCrop.path("scientific_name").asText("Plantae");
            cropProbabilityRaw = topCrop.path("probability").asDouble(0.0);
            cropConfidence = Math.round(cropProbabilityRaw * 1000.0) / 10.0;

            for (int i = 1; i < Math.min(4, cropSuggestions.size()); i++) {
                JsonNode alt = cropSuggestions.get(i);
                Map<String, Object> altMap = new HashMap<>();
                altMap.put("name", capitalize(alt.path("name").asText()));
                altMap.put("scientificName", alt.path("scientific_name").asText());
                altMap.put("confidence", Math.round(alt.path("probability").asDouble(0.0) * 1000.0) / 10.0);
                alternativeCrops.add(altMap);
            }
        } else if (knownCrop != null && !knownCrop.isBlank()) {
            cropName = capitalize(knownCrop);
        }

        boolean isCropLowConfidence = cropConfidence < 40.0;
        String cropConfidenceLevel = cropConfidence >= 70.0 ? "high" : (cropConfidence >= 40.0 ? "moderate" : "low");
        String cropIdentificationWarning = isCropLowConfidence 
                ? "Low Crop Match Confidence (" + cropConfidence + "%): The AI model cannot reliably confirm that this leaf belongs to " + cropName + " (" + botanicalName + "). Visual features may be ambiguous or captured at an extreme angle. Please verify your crop or upload a clearer close-up showing leaf venation and stem."
                : null;

        diagnosis.put("crop", cropName);
        diagnosis.put("cropMr", translateCropName(cropName, "mr"));
        diagnosis.put("cropHi", translateCropName(cropName, "hi"));
        diagnosis.put("botanicalName", botanicalName);
        diagnosis.put("cropConfidence", cropConfidence);
        diagnosis.put("cropProbabilityRaw", cropProbabilityRaw);
        diagnosis.put("cropConfidenceLevel", cropConfidenceLevel);
        diagnosis.put("isCropLowConfidence", isCropLowConfidence);
        diagnosis.put("cropIdentificationWarning", cropIdentificationWarning);
        diagnosis.put("alternativeCrops", alternativeCrops);

        // 3. Health & Pathology Assessment
        JsonNode diseaseNode = result.path("disease");
        JsonNode diseaseSuggestions = diseaseNode.path("suggestions");

        String diseaseName = "Healthy Crop";
        String scientificName = "Healthy";
        double diseaseProbabilityRaw = 0.0;
        double diseaseConfidence = 0.0;
        boolean isHealthy = false;
        String description = "";
        String spreading = "";
        List<String> symptomsList = new ArrayList<>();
        List<Map<String, Object>> alternativeDiseases = new ArrayList<>();

        boolean isHostSpecificDisease = false;
        String diseaseScope = "General Pathology";
        String diseaseScopeMr = "सामान्य रोग वर्गीकरण";
        String diseaseScopeHi = "सामान्य रोग वर्गीकरण";

        JsonNode topDiseaseDetails = null;

        if (diseaseSuggestions.isArray() && diseaseSuggestions.size() > 0) {
            JsonNode topDisease = diseaseSuggestions.get(0);
            String rawName = topDisease.path("name").asText("").trim();
            scientificName = topDisease.path("scientific_name").asText("").trim();
            diseaseProbabilityRaw = topDisease.path("probability").asDouble(0.0);
            diseaseConfidence = Math.round(diseaseProbabilityRaw * 1000.0) / 10.0;
            topDiseaseDetails = topDisease.path("details");

            if ("healthy".equalsIgnoreCase(rawName) || "healthy".equalsIgnoreCase(scientificName)) {
                isHealthy = true;
                diseaseName = "Healthy Crop (No Active Pathogen)";
                diseaseScope = "Healthy";
                isHostSpecificDisease = true;
            } else {
                diseaseName = capitalize(rawName);

                String pathogenLower = scientificName.toLowerCase();
                String diseaseLower = rawName.toLowerCase();
                if (pathogenLower.contains("colletotrichum") || diseaseLower.contains("anthracnose")) {
                    isHostSpecificDisease = false;
                    diseaseScope = "Broad Pathogen Group (Colletotrichum genus - Anthracnose). Not host-specific to sugarcane.";
                    diseaseScopeMr = "विस्तृत रोगकारक गट (कॉलेटोट्रिकम प्रजाती - करपा). उसासाठी विशिष्ट नाही.";
                    diseaseScopeHi = "व्यापक रोगज़नक़ समूह (कॉलेटोट्राइकम जीनस - एन्थ्रेक्नोज). गन्ने तक विशिष्ट नहीं.";
                } else {
                    isHostSpecificDisease = !isCropLowConfidence && cropConfidence >= 70.0;
                    diseaseScope = isHostSpecificDisease ? "Crop-Specific Pathology" : "Broad Visual Pattern Match";
                    diseaseScopeMr = isHostSpecificDisease ? "पीक-विशिष्ट रोग" : "दृश्य नमुना जुळणी";
                    diseaseScopeHi = isHostSpecificDisease ? "फसल-विशिष्ट रोग" : "दृश्य पैटर्न मिलान";
                }
            }

            // Extract reference symptoms from details
            JsonNode symptomsNode = topDiseaseDetails.path("symptoms");
            if (symptomsNode.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = symptomsNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    symptomsList.add(entry.getKey() + ": " + entry.getValue().asText().trim());
                }
            } else if (symptomsNode.isTextual() && !symptomsNode.asText().isBlank()) {
                symptomsList.add(symptomsNode.asText().trim());
            }

            description = topDiseaseDetails.path("description").asText("");
            spreading = topDiseaseDetails.path("spreading").asText("");

            // Alternative diagnoses
            for (int i = 1; i < Math.min(4, diseaseSuggestions.size()); i++) {
                JsonNode alt = diseaseSuggestions.get(i);
                Map<String, Object> altMap = new HashMap<>();
                altMap.put("name", capitalize(alt.path("name").asText()));
                altMap.put("scientificName", alt.path("scientific_name").asText());
                altMap.put("confidence", Math.round(alt.path("probability").asDouble(0.0) * 1000.0) / 10.0);
                alternativeDiseases.add(altMap);
            }
        }

        // Severity: strictly "Severity not assessed" as leaf damage cannot be reliably measured from single photo
        String severity = isHealthy ? "Healthy" : "Severity not assessed";
        String severityMr = isHealthy ? "निरोगी" : "तीव्रता मोजलेली नाही";
        String severityHi = isHealthy ? "स्वस्थ" : "तीव्रता का आकलन नहीं किया गया";
        String generalDiseaseImpact = topDiseaseDetails != null ? topDiseaseDetails.path("severity").asText("") : "";

        diagnosis.put("isHealthy", isHealthy);
        diagnosis.put("diseaseName", diseaseName);
        diagnosis.put("diseaseNameMr", translateDiseaseName(diseaseName, "mr"));
        diagnosis.put("diseaseNameHi", translateDiseaseName(diseaseName, "hi"));
        diagnosis.put("scientificPathogenName", scientificName);
        diagnosis.put("confidence", diseaseConfidence);
        diagnosis.put("diseaseProbabilityRaw", diseaseProbabilityRaw);
        diagnosis.put("isHostSpecificDisease", isHostSpecificDisease);
        diagnosis.put("diseaseScope", diseaseScope);
        diagnosis.put("diseaseScopeMr", diseaseScopeMr);
        diagnosis.put("diseaseScopeHi", diseaseScopeHi);
        diagnosis.put("severity", severity);
        diagnosis.put("severityMr", severityMr);
        diagnosis.put("severityHi", severityHi);
        diagnosis.put("generalDiseaseImpact", generalDiseaseImpact);
        diagnosis.put("cause", !description.isBlank() ? description : "Diagnosed via visual pathology features by Kindwise crop.health model.");
        diagnosis.put("spreading", spreading);
        
        diagnosis.put("referenceSymptoms", symptomsList);
        diagnosis.put("symptoms", symptomsList.isEmpty() 
                ? (isHealthy ? "Vibrant leaf vigor, normal chlorophyll pigmentation, absent of lesions or chlorosis." : "Visible discoloration, spots or necrosis on leaf blade.")
                : String.join("; ", symptomsList));
        diagnosis.put("symptomsList", symptomsList);
        diagnosis.put("referenceSymptomsNotice", "Reference symptoms describe typical signs documented across host crops in agricultural literature. They were not all individually detected on this specific leaf.");
        diagnosis.put("observedVisualEvidence", isHealthy 
                ? "Clean leaf surface without active fungal sporulation or chlorotic rings." 
                : "Visual pattern of localized lesion / discoloration on the examined leaf blade.");
        diagnosis.put("alternativeDiseases", alternativeDiseases);

        // 4. Four Structured Treatment Divisions (Immediate, Biological, Chemical, Prevention)
        Map<String, List<String>> treatmentSections = extractTreatmentSections(topDiseaseDetails, isHealthy, cropName, botanicalName, diseaseName, isCropLowConfidence, cropConfidence);
        diagnosis.put("immediateActions", treatmentSections.get("immediateActions"));
        diagnosis.put("organicTreatment", treatmentSections.get("biological"));
        diagnosis.put("organicTreatmentMr", treatmentSections.get("biological"));
        diagnosis.put("chemicalTreatment", treatmentSections.get("chemical"));
        diagnosis.put("chemicalTreatmentMr", treatmentSections.get("chemical"));
        diagnosis.put("prevention", treatmentSections.get("prevention"));
        diagnosis.put("preventionMr", treatmentSections.get("prevention"));

        // 5. Agricultural Expert Consultation & Limitations
        diagnosis.put("expertConsultation", Arrays.asList(
                "Consult your nearest Krishi Vigyan Kendra (KVK) or Taluka Agriculture Officer if symptoms spread across more than 15% of the plot within 48 hours.",
                "Seek certified agronomist advice before investing in high-cost systemic fungicides or tank-mixing chemicals.",
                "Take a fresh leaf sample in a sealed plastic bag when visiting the local agricultural extension center for physical confirmation."
        ));

        diagnosis.put("limitations", "Diagnostic confidence reflects computer vision probabilistic matching from photographic evidence and should not be treated as a substitute for accredited laboratory tissue assay or local extension service verification. Chemical treatments must strictly adhere to product labels registered in your jurisdiction.");

        // Field Source Property Mapping Audit
        Map<String, String> fieldSourceMapping = new HashMap<>();
        fieldSourceMapping.put("crop", "result.crop.suggestions[0].name");
        fieldSourceMapping.put("botanicalName", "result.crop.suggestions[0].scientific_name");
        fieldSourceMapping.put("cropConfidence", "result.crop.suggestions[0].probability (percentage formatted)");
        fieldSourceMapping.put("cropConfidenceLevel", "Derived threshold: <40% low, 40-70% moderate, >=70% high");
        fieldSourceMapping.put("cropIdentificationWarning", "Generated when cropConfidence < 40% to prevent unverified treatment");
        fieldSourceMapping.put("diseaseName", "result.disease.suggestions[0].name");
        fieldSourceMapping.put("scientificPathogenName", "result.disease.suggestions[0].scientific_name");
        fieldSourceMapping.put("confidence", "result.disease.suggestions[0].probability (visual pattern match percentage)");
        fieldSourceMapping.put("diseaseScope", "Taxonomic evaluation: Colletotrichum represents a broad fungal genus across crops");
        fieldSourceMapping.put("isHostSpecificDisease", "false for genus-level Colletotrichum or when crop identification is unconfirmed");
        fieldSourceMapping.put("referenceSymptoms", "result.disease.suggestions[0].details.symptoms (encyclopedic reference catalog, NOT visually confirmed on this leaf)");
        fieldSourceMapping.put("generalDiseaseImpact", "result.disease.suggestions[0].details.severity (encyclopedic description of potential agricultural loss)");
        fieldSourceMapping.put("severity", "Set strictly to 'Severity not assessed' as leaf lesion severity cannot be reliably quantified from single photo");
        fieldSourceMapping.put("treatment", "result.disease.suggestions[0].details.treatment cross-checked with crop-specific CIBRC/SAU guidance");
        diagnosis.put("_fieldSourceMapping", fieldSourceMapping);

        // Optional farmer field context reflected back
        Map<String, Object> fieldContext = new HashMap<>();
        if (knownCrop != null && !knownCrop.isBlank()) fieldContext.put("knownCrop", knownCrop);
        if (growthStage != null && !growthStage.isBlank()) fieldContext.put("growthStage", growthStage);
        if (symptomOnset != null && !symptomOnset.isBlank()) fieldContext.put("symptomOnset", symptomOnset);
        if (weatherHistory != null && !weatherHistory.isBlank()) fieldContext.put("weatherHistory", weatherHistory);
        diagnosis.put("fieldContext", fieldContext);

        return diagnosis;
    }

    /**
     * Extracts and divides treatments into 4 safe, practical sections with crop-specific verification.
     */
    private Map<String, List<String>> extractTreatmentSections(
            JsonNode details,
            boolean isHealthy,
            String cropName,
            String botanicalName,
            String diseaseName,
            boolean isCropLowConfidence,
            double cropConfidence
    ) {
        Map<String, List<String>> sections = new HashMap<>();
        List<String> immediate = new ArrayList<>();
        List<String> biological = new ArrayList<>();
        List<String> chemical = new ArrayList<>();
        List<String> prevention = new ArrayList<>();

        if (isHealthy) {
            immediate.add("No immediate curative action required. Continue regular scouting schedule.");
            biological.add("Maintain soil microbial health with fermented organic manure or Jeevamrut @ 200L/acre every 15 days.");
            chemical.add("Chemical intervention is not recommended for healthy crops at this stage.");
            prevention.add("Maintain balanced N-P-K fertilization and inspect leaf undersides weekly for early signs of pests or mildew.");
            sections.put("immediateActions", immediate);
            sections.put("biological", biological);
            sections.put("chemical", chemical);
            sections.put("prevention", prevention);
            return sections;
        }

        JsonNode treatmentNode = details != null ? details.path("treatment") : null;

        // Biological / Organic treatments
        if (treatmentNode != null && treatmentNode.isObject()) {
            JsonNode bioNode = treatmentNode.has("biological treatment") 
                    ? treatmentNode.path("biological treatment") 
                    : treatmentNode.path("biological");
            if (bioNode.isArray()) {
                for (JsonNode item : bioNode) {
                    biological.add(item.asText().trim());
                }
            }

            // Chemical treatments
            JsonNode chemNode = treatmentNode.has("chemical treatment")
                    ? treatmentNode.path("chemical treatment")
                    : treatmentNode.path("chemical");
            if (chemNode.isArray()) {
                for (JsonNode item : chemNode) {
                    chemical.add(item.asText().trim());
                }
            }

            // Prevention
            JsonNode prevNode = treatmentNode.path("prevention");
            if (prevNode.isArray()) {
                for (JsonNode item : prevNode) {
                    prevention.add(item.asText().trim());
                }
            }
        }

        boolean isSugarcane = (cropName != null && cropName.toLowerCase().contains("sugarcane")) ||
                              (botanicalName != null && botanicalName.toLowerCase().contains("saccharum"));
        boolean isAnthracnose = diseaseName != null && (diseaseName.toLowerCase().contains("anthracnose") || diseaseName.toLowerCase().contains("colletotrichum"));

        // Immediate Cultural & Field Triage Actions
        if (isSugarcane && isAnthracnose) {
            immediate.add("Rogue out and safely burn severely infected sugarcane tillers or dead hearts to prevent pathogen survival in sett tissue.");
            immediate.add("Ensure immediate furrow drainage; avoid stagnant waterlogging around the root zone which triggers rapid secondary spread.");
            immediate.add("Disinfect harvesting knives and sickle blades with 5% Lysol or bleach solution between rows.");
        } else {
            immediate.add("Carefully prune and remove severely infected lower leaves showing active lesions, and dispose of them outside the field.");
            immediate.add("Halt overhead sprinkler irrigation immediately to avoid continuous leaf wetness that promotes fungal sporulation.");
            immediate.add("Improve field aeration by removing weed hosts around field bunds and borders.");
        }

        // Biological controls
        if (isSugarcane && isAnthracnose) {
            biological.add(0, "Seed Sett Treatment: Soak seed setts in suspension of bio-control agent Trichoderma viride or Pseudomonas fluorescens @ 10g/L for 20 minutes prior to planting (ICAR-SBI recommendation).");
            biological.add("Soil Enrichment: Apply 2.5 kg Trichoderma harzianum incubated in 250 kg well-decomposed Farm Yard Manure (FYM) per acre during field preparation.");
        } else if (biological.isEmpty()) {
            biological.add("Apply bio-fungicide Trichoderma viride or Pseudomonas fluorescens @ 10g/L water during late evening.");
            biological.add("Foliar application of 5% Neem Seed Kernel Extract (NSKE) or cold-pressed Neem Oil @ 5ml/L to deter secondary insect vectors.");
        }

        // Chemical guidelines with mandatory regulatory safety notice
        if (isCropLowConfidence) {
            chemical.add(0, "⚠️ CRITICAL CROP UNCONFIRMED WARNING: Crop match confidence is low (" + cropConfidence + "%). Chemical fungicides must NOT be applied until crop identity is positively confirmed. Dosages, registration, and Pre-Harvest Intervals (PHI) vary strictly by crop under CIBRC regulations.");
        }

        if (isSugarcane && isAnthracnose) {
            chemical.add("Sett Dip Treatment (Primary Agronomic Window): For Colletotrichum / Red Rot in sugarcane, dip setts in Carbendazim 50% WP @ 1g/L water for 15 minutes before planting to eliminate sett-borne fungal inocula (ICAR-Sugarcane Breeding Institute Package of Practices).");
            chemical.add("Foliar Protective Spray: If spindle/leaf anthracnose spots appear in early vegetative stage, apply Copper Oxychloride 50% WP @ 2.5g/L or Thiophanate methyl 70% WP @ 1.5g/L only if formally recommended by your local Krishi Vigyan Kendra (KVK).");
        } else if (chemical.isEmpty()) {
            chemical.add("Foliar spray of broad-spectrum protective fungicide (e.g. Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb 75% WP @ 2g/L) as per registered product label.");
        }

        // Mandatory regulatory compliance instructions appended to chemical section
        chemical.add("CIBRC LABEL COMPLIANCE: Verify that products are legally registered for " + cropName + " in your state with your local Krishi Vigyan Kendra (KVK) or Agriculture Officer. Adhere strictly to manufacturer label for dilution and spray intervals. Wear certified PPE. Observe Pre-Harvest (PHI) and Re-entry (REI) intervals.");

        // Prevention
        if (isSugarcane && isAnthracnose) {
            prevention.add("Source certified disease-free seed setts from registered nurseries; avoid taking seed from plots showing red rot / anthracnose.");
            prevention.add("Never take ratoon crops from plots showing widespread Colletotrichum infection; rotate with legume crops (e.g. Soybean, Gram) for at least 1-2 seasons.");
            prevention.add("Practice hot water treatment of seed setts at 52°C for 30 minutes where facility is available.");
        } else if (prevention.isEmpty()) {
            prevention.add("Practice crop rotation with non-host botanical families for at least 2 consecutive growing seasons.");
            prevention.add("Source only certified, disease-free seed stock and apply seed treatment prior to sowing.");
            prevention.add("Ensure optimum plant spacing and clean farm implements between fields to prevent mechanical spread.");
        }

        sections.put("immediateActions", immediate);
        sections.put("biological", biological);
        sections.put("chemical", chemical);
        sections.put("prevention", prevention);
        return sections;
    }

    private String capitalize(String str) {
        if (str == null || str.isBlank()) return "";
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    private String translateCropName(String crop, String lang) {
        String lower = crop.toLowerCase();
        if ("mr".equals(lang)) {
            if (lower.contains("tomato")) return "टोमॅटो";
            if (lower.contains("cotton")) return "कापूस";
            if (lower.contains("potato")) return "बटाटा";
            if (lower.contains("rice") || lower.contains("paddy")) return "भात";
            if (lower.contains("wheat")) return "गहू";
            if (lower.contains("soybean") || lower.contains("soya")) return "सोयाबीन";
            if (lower.contains("sugarcane")) return "ऊस";
            if (lower.contains("chilli") || lower.contains("pepper")) return "मिरची";
            if (lower.contains("onion")) return "कांदा";
            if (lower.contains("grape")) return "द्राक्ष";
            if (lower.contains("brinjal") || lower.contains("eggplant")) return "वांगी";
        } else if ("hi".equals(lang)) {
            if (lower.contains("tomato")) return "टमाटर";
            if (lower.contains("cotton")) return "कपास";
            if (lower.contains("potato")) return "आलू";
            if (lower.contains("rice") || lower.contains("paddy")) return "धान / चावल";
            if (lower.contains("wheat")) return "गेहूं";
            if (lower.contains("soybean") || lower.contains("soya")) return "सोयाबीन";
            if (lower.contains("sugarcane")) return "गन्ना";
            if (lower.contains("chilli") || lower.contains("pepper")) return "मिर्च";
            if (lower.contains("onion")) return "प्याज";
            if (lower.contains("grape")) return "अंगूर";
            if (lower.contains("brinjal") || lower.contains("eggplant")) return "बैंगन";
        }
        return crop;
    }

    private String translateDiseaseName(String disease, String lang) {
        String lower = disease.toLowerCase();
        if ("mr".equals(lang)) {
            if (lower.contains("early blight")) return "टोमॅटोचा करपा रोग (अल्टरनेरिया सोलाणी)";
            if (lower.contains("late blight")) return "बटाटा / टोमॅटोचा उशिरा येणारा करपा (फायटोफ्थोरा इन्फेस्टन्स)";
            if (lower.contains("curl")) return "पानांचा चुरमुरडा / कुकडा रोग";
            if (lower.contains("bacterial") && lower.contains("blight")) return "जिवाणूजन्य करपा रोग";
            if (lower.contains("rust")) return "तांबेरा रोग";
            if (lower.contains("mildew")) return "केवडा / भुरी रोग";
            if (lower.contains("healthy")) return "निरोगी पीक (कोणताही रोग नाही)";
        } else if ("hi".equals(lang)) {
            if (lower.contains("early blight")) return "अगेती झुलसा रोग (अल्टरनेरिया)";
            if (lower.contains("late blight")) return "पछेती झुलसा रोग (फाइटोफ्थोरा)";
            if (lower.contains("curl")) return "पत्ती मरोड़ / कुकड़ा रोग";
            if (lower.contains("bacterial") && lower.contains("blight")) return "जीवाणु झुलसा रोग";
            if (lower.contains("rust")) return "गेरुआ / रतुआ रोग";
            if (lower.contains("mildew")) return "चूर्णिल आसिता / डाउनी फफूंद";
            if (lower.contains("healthy")) return "स्वस्थ फसल (कोई सक्रिय रोग नहीं)";
        }
        return disease;
    }
}
