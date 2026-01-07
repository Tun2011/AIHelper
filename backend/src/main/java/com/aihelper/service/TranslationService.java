package com.aihelper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    private final WebClient webClient;
    private final String apiKey;

    public TranslationService(@Value("${google.ai.api.key:}") String apiKeyConfig) {
        if (apiKeyConfig == null || apiKeyConfig.isEmpty()) {
            this.apiKey = "AIzaSyAUB6ZTTqqdNyxFM5-rA17WI4l4Tceg77M";
        } else {
            this.apiKey = apiKeyConfig;
        }

        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> translate(String text, String sourceLang, String targetLang) {
        try {
            if (text == null || text.trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "Văn bản không được để trống");
            }

            // Get language names for better prompt
            String sourceLanguage = getLanguageName(sourceLang);
            String targetLanguage = getLanguageName(targetLang);

            // Build prompt for Gemini
            String prompt = String.format(
                    "Translate the following text from %s to %s. Only respond with the translation, nothing else:\n\n%s",
                    sourceLanguage, targetLanguage, text);

            // Build request body for Gemini API
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 1024));

            // Call Gemini API
            Map<String, Object> response = webClient.post()
                    .uri("/models/gemini-1.5-flash:generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                return Map.of(
                        "success", false,
                        "error", "Không nhận được phản hồi từ Google AI");
            }

            // Parse Gemini response
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String translatedText = (String) parts.get(0).get("text");
                        return Map.of(
                                "success", true,
                                "translatedText", translatedText != null ? translatedText.trim() : "");
                    }
                }
            }

            return Map.of(
                    "success", false,
                    "error", "Không thể dịch văn bản");

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "error", "Lỗi dịch: " + e.getMessage());
        }
    }

    private String getLanguageName(String code) {
        return switch (code) {
            case "vi" -> "Vietnamese";
            case "en" -> "English";
            case "zh" -> "Chinese";
            case "ja" -> "Japanese";
            case "ko" -> "Korean";
            case "fr" -> "French";
            case "de" -> "German";
            case "es" -> "Spanish";
            case "ru" -> "Russian";
            case "th" -> "Thai";
            default -> code;
        };
    }
}
