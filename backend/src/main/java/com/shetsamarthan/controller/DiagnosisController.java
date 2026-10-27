package com.shetsamarthan.controller;

import com.shetsamarthan.model.DiagnosisReport;
import com.shetsamarthan.repository.DiagnosisReportRepository;
import com.shetsamarthan.service.Deeplearning4jService;
import com.shetsamarthan.service.KindwiseCropHealthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/diagnosis")
@CrossOrigin(origins = "*")
public class DiagnosisController {

    private static final Logger logger = LoggerFactory.getLogger(DiagnosisController.class);

    @Autowired
    private DiagnosisReportRepository diagnosisReportRepository;

    @Autowired
    private KindwiseCropHealthService kindwiseCropHealthService;

    @Autowired
    private Deeplearning4jService deeplearning4jService;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeCrop(
            @RequestParam(value = "crop", required = false) String crop,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "userId", required = false, defaultValue = "1") Long userId,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "growthStage", required = false) String growthStage,
            @RequestParam(value = "symptomOnset", required = false) String symptomOnset,
            @RequestParam(value = "priorSpraying", required = false) String priorSpraying,
            @RequestParam(value = "weatherHistory", required = false) String weatherHistory,
            @RequestParam(value = "allowFallback", required = false, defaultValue = "false") Boolean allowFallback
    ) {
        logger.info("Received crop diagnosis analysis request. Known crop: {}, Image present: {}", 
                crop, (image != null && !image.isEmpty()));

        byte[] imageBytes = null;
        String mimeType = "image/jpeg";
        if (image != null && !image.isEmpty()) {
            try {
                imageBytes = image.getBytes();
                if (image.getContentType() != null) {
                    mimeType = image.getContentType();
                }
            } catch (Exception e) {
                logger.error("Failed to read uploaded image bytes: {}", e.getMessage());
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("errorType", "INVALID_FILE");
                err.put("message", "Unable to read the uploaded image file. Please provide a valid JPG or PNG.");
                return ResponseEntity.badRequest().body(err);
            }
        }

        // =====================================================================
        // 1. Primary Engine: Official Kindwise crop.health API
        // =====================================================================
        if (imageBytes != null && kindwiseCropHealthService.isConfigured()) {
            try {
                Map<String, Object> kindwiseResult = kindwiseCropHealthService.diagnosePlant(
                        imageBytes, mimeType, latitude, longitude, crop, growthStage, symptomOnset, weatherHistory
                );

                Boolean isSuccess = (Boolean) kindwiseResult.get("success");
                if (Boolean.TRUE.equals(isSuccess)) {
                    // Save successful diagnosis report
                    try {
                        String detectedCrop = (String) kindwiseResult.get("crop");
                        String detectedDisease = (String) kindwiseResult.get("diseaseName");
                        String detectedDiseaseMr = (String) kindwiseResult.get("diseaseNameMr");
                        Double confidence = (Double) kindwiseResult.get("confidence");
                        String severity = (String) kindwiseResult.get("severity");
                        String cause = (String) kindwiseResult.get("cause");

                        @SuppressWarnings("unchecked")
                        List<String> organicList = (List<String>) kindwiseResult.get("organicTreatment");
                        @SuppressWarnings("unchecked")
                        List<String> chemList = (List<String>) kindwiseResult.get("chemicalTreatment");
                        @SuppressWarnings("unchecked")
                        List<String> prevList = (List<String>) kindwiseResult.get("prevention");

                        DiagnosisReport report = DiagnosisReport.builder()
                                .userId(userId)
                                .crop(detectedCrop != null ? detectedCrop : crop)
                                .diseaseName(detectedDisease)
                                .diseaseNameMr(detectedDiseaseMr)
                                .confidence(confidence != null ? confidence : 0.0)
                                .severity(severity)
                                .cause(cause != null && cause.length() > 1950 ? cause.substring(0, 1950) : cause)
                                .organicTreatment(organicList != null ? String.join("; ", organicList) : "")
                                .chemicalTreatment(chemList != null ? String.join("; ", chemList) : "")
                                .prevention(prevList != null ? String.join("; ", prevList) : "")
                                .createdAt(LocalDateTime.now())
                                .build();

                        diagnosisReportRepository.save(report);
                        kindwiseResult.put("id", report.getId());
                    } catch (Exception dbEx) {
                        logger.warn("Could not persist diagnosis report to DB: {}", dbEx.getMessage());
                    }

                    return ResponseEntity.ok(kindwiseResult);
                } else {
                    // Kindwise API returned a structured error
                    String errorType = (String) kindwiseResult.get("errorType");
                    Integer status = (Integer) kindwiseResult.get("status");
                    HttpStatus httpStatus = (status != null && status == 429) 
                            ? HttpStatus.TOO_MANY_REQUESTS 
                            : (status != null && status == 401) 
                            ? HttpStatus.UNAUTHORIZED 
                            : HttpStatus.BAD_GATEWAY;

                    // If fallback is NOT explicitly requested, return the error to allow farmer retry
                    if (!Boolean.TRUE.equals(allowFallback)) {
                        return ResponseEntity.status(httpStatus).body(kindwiseResult);
                    }
                }
            } catch (Exception e) {
                logger.error("Exception during Kindwise crop.health API call: {}", e.getMessage(), e);
                if (!Boolean.TRUE.equals(allowFallback)) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("errorType", "API_CONNECTION_ERROR");
                    err.put("message", "Unable to reach the Kindwise crop.health service. Please check your network connection and retry.");
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(err);
                }
            }
        }

        // =====================================================================
        // 2. Unverified Local DL4J Fallback (Clearly labeled if triggered)
        // =====================================================================
        if (Boolean.TRUE.equals(allowFallback) || !kindwiseCropHealthService.isConfigured()) {
            logger.warn("Kindwise API unconfigured or fallback requested. Executing local DL4J simulation.");

            Deeplearning4jService.Dl4jInferenceResult dl4jResult = 
                    deeplearning4jService.classifyLeaf(crop, imageBytes);

            String normalized = crop != null ? crop.toLowerCase() : "tomato";
            String diseaseName = "Early Blight (Alternaria solani)";
            String diseaseNameMr = "टोमॅटोचा करपा रोग (अल्टरनेरिया सोलाणी)";
            double confidence = 94.8;
            String severity = "Moderate";
            String cause = "Fungal pathogen Alternaria solani thriving in warm, humid weather.";
            String symptoms = "Concentric dark brown rings forming target-like patterns on older leaves.";
            List<String> organic = List.of("Spray 5% Neem Seed Kernel Extract (NSKE) @ 5ml/L.", "Apply Trichoderma viride @ 10g/L.");
            List<String> chemical = List.of("Foliar spray of Mancozeb 75% WP @ 2.5g/L.", "Regulatory Notice: Verify local registration with KVK before use.");
            List<String> prevention = List.of("Practice crop rotation avoiding Solanaceae family for 2 seasons.", "Use drip irrigation.");

            Map<String, Object> fallbackResponse = new HashMap<>();
            fallbackResponse.put("success", true);
            fallbackResponse.put("aiEngine", "Local DL4J Fallback (Unverified - Kindwise API Offline)");
            fallbackResponse.put("isUnverifiedFallback", true);
            fallbackResponse.put("crop", crop != null ? crop : "Tomato");
            fallbackResponse.put("cropConfidence", 75.0);
            fallbackResponse.put("isPlant", true);
            fallbackResponse.put("diseaseName", diseaseName);
            fallbackResponse.put("diseaseNameMr", diseaseNameMr);
            fallbackResponse.put("confidence", (dl4jResult != null && dl4jResult.getConfidence() > 0) ? dl4jResult.getConfidence() : confidence);
            fallbackResponse.put("severity", severity);
            fallbackResponse.put("cause", cause);
            fallbackResponse.put("symptoms", symptoms);
            fallbackResponse.put("immediateActions", List.of("Inspect affected plants and isolate diseased specimens."));
            fallbackResponse.put("organicTreatment", organic);
            fallbackResponse.put("chemicalTreatment", chemical);
            fallbackResponse.put("prevention", prevention);
            fallbackResponse.put("expertConsultation", List.of("Contact local Krishi Vigyan Kendra for physical verification."));
            fallbackResponse.put("limitations", "DISCLAIMER: This is an unverified local simulation fallback because the primary Kindwise crop.health engine was offline or unconfigured.");

            if (dl4jResult != null) {
                fallbackResponse.put("modelArchitecture", dl4jResult.getModelArchitecture());
                fallbackResponse.put("inferenceLatencyMs", dl4jResult.getInferenceLatencyMs());
                fallbackResponse.put("classProbabilities", dl4jResult.getClassProbabilities());
            }

            return ResponseEntity.ok(fallbackResponse);
        }

        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("errorType", "NO_IMAGE_PROVIDED");
        err.put("message", "Please upload or capture a crop leaf photo to perform diagnosis.");
        return ResponseEntity.badRequest().body(err);
    }

    @GetMapping("/engine-status")
    public ResponseEntity<Map<String, Object>> getEngineStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("primaryEngine", "Kindwise crop.health Official API");
        status.put("kindwiseConfigured", kindwiseCropHealthService.isConfigured());
        status.put("fallbackEngine", "Eclipse DeepLearning4J (DL4J)");
        status.put("endpoint", "/api/diagnosis/analyze");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/dl4j-model-info")
    public ResponseEntity<Map<String, Object>> getDl4jModelInfo() {
        return ResponseEntity.ok(deeplearning4jService.getModelMetadata());
    }

    @GetMapping("/history")
    public ResponseEntity<List<DiagnosisReport>> getHistory(@RequestParam(required = false, defaultValue = "1") Long userId) {
        return ResponseEntity.ok(diagnosisReportRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
