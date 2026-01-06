package com.aihelper.service;

import com.aihelper.dto.MusicRecognitionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Base64;
import java.util.Map;

@Service
public class MusicRecognitionService {

    private final WebClient webClient;
    private final String apiKey;

    public MusicRecognitionService(@Value("${shazam.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://shazam-api.com/api")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .build();
    }

    public MusicRecognitionResponse recognizeSong(String audioBase64) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return MusicRecognitionResponse.notFound("API key chưa được cấu hình. Vui lòng thêm SHAZAM_API_KEY.");
            }

            // Decode base64 to bytes
            byte[] audioBytes = Base64.getDecoder().decode(audioBase64);

            // Step 1: Send audio to /recognize endpoint
            Map<String, Object> recognizeResponse = webClient.post()
                    .uri("/recognize")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(audioBytes)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (recognizeResponse == null) {
                return MusicRecognitionResponse.notFound("Không nhận được phản hồi từ server.");
            }

            // Check if we got a UUID for polling
            String uuid = (String) recognizeResponse.get("uuid");
            if (uuid != null) {
                // Step 2: Poll for results
                return pollForResults(uuid);
            }

            // Direct response (some APIs return immediately)
            return parseResponse(recognizeResponse);

        } catch (WebClientResponseException e) {
            return MusicRecognitionResponse.notFound("Lỗi API: " + e.getStatusCode() + " - " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return MusicRecognitionResponse.notFound("Audio data không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            return MusicRecognitionResponse.notFound("Lỗi nhận diện: " + e.getMessage());
        }
    }

    private MusicRecognitionResponse pollForResults(String uuid) {
        int maxAttempts = 10;
        int delayMs = 1000;

        for (int i = 0; i < maxAttempts; i++) {
            try {
                Thread.sleep(delayMs);
                
                Map<String, Object> result = webClient.get()
                        .uri("/results/" + uuid)
                        .header("Authorization", "Bearer " + apiKey)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (result != null) {
                    String status = (String) result.get("status");
                    if ("completed".equals(status) || result.containsKey("track")) {
                        return parseResponse(result);
                    } else if ("failed".equals(status)) {
                        return MusicRecognitionResponse.notFound("Không tìm thấy bài hát nào phù hợp.");
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                // Continue polling
            }
        }
        return MusicRecognitionResponse.notFound("Hết thời gian chờ. Vui lòng thử lại.");
    }

    @SuppressWarnings("unchecked")
    private MusicRecognitionResponse parseResponse(Map<String, Object> response) {
        try {
            Map<String, Object> track = (Map<String, Object>) response.get("track");
            if (track == null) {
                // Try alternate response format
                if (response.containsKey("title")) {
                    return MusicRecognitionResponse.success(
                            (String) response.get("title"),
                            (String) response.get("subtitle"),
                            (String) response.getOrDefault("album", ""),
                            (String) response.get("images"),
                            (String) response.get("url")
                    );
                }
                return MusicRecognitionResponse.notFound("Không tìm thấy bài hát nào phù hợp.");
            }

            String title = (String) track.get("title");
            String artist = (String) track.get("subtitle");
            
            // Get album from sections if available
            String album = "";
            
            // Get cover image
            String coverUrl = "";
            Map<String, Object> images = (Map<String, Object>) track.get("images");
            if (images != null) {
                coverUrl = (String) images.getOrDefault("coverart", images.get("background"));
            }

            // Get preview URL if available
            String previewUrl = "";
            Map<String, Object> hub = (Map<String, Object>) track.get("hub");
            if (hub != null) {
                var actions = hub.get("actions");
                if (actions instanceof java.util.List) {
                    for (Object action : (java.util.List<?>) actions) {
                        if (action instanceof Map) {
                            Map<String, Object> actionMap = (Map<String, Object>) action;
                            if ("uri".equals(actionMap.get("type"))) {
                                previewUrl = (String) actionMap.get("uri");
                                break;
                            }
                        }
                    }
                }
            }

            return MusicRecognitionResponse.success(title, artist, album, coverUrl, previewUrl);

        } catch (Exception e) {
            return MusicRecognitionResponse.notFound("Lỗi xử lý kết quả: " + e.getMessage());
        }
    }
}
