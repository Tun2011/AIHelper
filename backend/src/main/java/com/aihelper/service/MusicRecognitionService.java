package com.aihelper.service;

import com.aihelper.dto.MusicRecognitionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class MusicRecognitionService {

    private final WebClient webClient;
    private final String apiToken;

    public MusicRecognitionService(@Value("${audd.api.token:}") String apiTokenConfig) {
        // Use config or fallback to hardcoded token
        if (apiTokenConfig == null || apiTokenConfig.isEmpty()) {
            this.apiToken = "5a521409ff0845062c14e01b49af36dc";
        } else {
            this.apiToken = apiTokenConfig;
        }

        this.webClient = WebClient.builder()
                .baseUrl("https://api.audd.io")
                .build();
    }

    public MusicRecognitionResponse recognizeSong(String audioBase64) {
        try {
            if (apiToken == null || apiToken.isEmpty()) {
                return MusicRecognitionResponse.notFound("API token chưa được cấu hình.");
            }

            // Build multipart form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("api_token", apiToken);
            formData.add("audio", audioBase64);
            formData.add("return", "apple_music,spotify");

            // Send request to AudD API
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri("/")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                return MusicRecognitionResponse.notFound("Không nhận được phản hồi từ server.");
            }

            return parseAuddResponse(response);

        } catch (WebClientResponseException e) {
            return MusicRecognitionResponse.notFound("Lỗi API: " + e.getStatusCode() + " - " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return MusicRecognitionResponse.notFound("Audio data không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            return MusicRecognitionResponse.notFound("Lỗi nhận diện: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private MusicRecognitionResponse parseAuddResponse(Map<String, Object> response) {
        try {
            String status = (String) response.get("status");

            if (!"success".equals(status)) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                if (error != null) {
                    String errorMsg = (String) error.get("error_message");
                    return MusicRecognitionResponse.notFound("Lỗi: " + errorMsg);
                }
                return MusicRecognitionResponse.notFound("Không tìm thấy bài hát.");
            }

            Map<String, Object> result = (Map<String, Object>) response.get("result");
            if (result == null) {
                return MusicRecognitionResponse.notFound("Không tìm thấy bài hát nào phù hợp.");
            }

            String title = (String) result.get("title");
            String artist = (String) result.get("artist");
            String album = (String) result.getOrDefault("album", "");
            String songLink = (String) result.get("song_link");

            // Get cover image from Spotify
            String coverUrl = "";
            Map<String, Object> spotify = (Map<String, Object>) result.get("spotify");
            if (spotify != null) {
                Map<String, Object> spotifyAlbum = (Map<String, Object>) spotify.get("album");
                if (spotifyAlbum != null) {
                    List<Map<String, Object>> images = (List<Map<String, Object>>) spotifyAlbum.get("images");
                    if (images != null && !images.isEmpty()) {
                        coverUrl = (String) images.get(0).get("url");
                    }
                }
            }

            // Get preview URL from Apple Music
            String previewUrl = "";
            Map<String, Object> appleMusic = (Map<String, Object>) result.get("apple_music");
            if (appleMusic != null) {
                List<Map<String, Object>> previews = (List<Map<String, Object>>) appleMusic.get("previews");
                if (previews != null && !previews.isEmpty()) {
                    previewUrl = (String) previews.get(0).get("url");
                }
            }

            return MusicRecognitionResponse.success(title, artist, album, coverUrl, previewUrl);

        } catch (Exception e) {
            return MusicRecognitionResponse.notFound("Lỗi xử lý kết quả: " + e.getMessage());
        }
    }
}
