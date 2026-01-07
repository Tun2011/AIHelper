package com.aihelper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import jakarta.annotation.PostConstruct;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class ChatService {

    private final WebClient webClient;
    private final String apiKey;
    private final AtomicReference<String> cachedModel = new AtomicReference<>(null);

    private static final String[] PREFERRED_MODELS = {
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-2.0-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
    };

    private static final String SYSTEM_PROMPT = """
            Bạn là AI Helper - trợ lý AI thông minh, thân thiện và hữu ích.

            Hướng dẫn:
            - Trả lời bằng tiếng Việt trừ khi người dùng hỏi bằng ngôn ngữ khác
            - Sử dụng emoji phù hợp để tạo cảm giác thân thiện
            - Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin
            - Nếu không biết, hãy thừa nhận thay vì bịa đặt
            - Có thể viết code, giải thích concepts, giúp debug, trả lời câu hỏi
            """;

    public ChatService(@Value("${google.ai.api.key:}") String apiKeyConfig) {
        if (apiKeyConfig == null || apiKeyConfig.isEmpty()) {
            this.apiKey = "AIzaSyAUB6ZTTqqdNyxFM5-rA17WI4l4Tceg77M";
        } else {
            this.apiKey = apiKeyConfig;
        }

        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    @PostConstruct
    public void init() {
        discoverBestModel();
    }

    @SuppressWarnings("unchecked")
    private void discoverBestModel() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri("/models?key=" + apiKey)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("models")) {
                List<Map<String, Object>> models = (List<Map<String, Object>>) response.get("models");

                for (String preferred : PREFERRED_MODELS) {
                    for (Map<String, Object> model : models) {
                        String modelName = (String) model.get("name");
                        if (modelName != null && modelName.contains(preferred)) {
                            String modelId = modelName.replace("models/", "");
                            cachedModel.set(modelId);
                            System.out.println("✅ Chat model selected: " + modelId);
                            return;
                        }
                    }
                }
            }
            cachedModel.set("gemini-pro");
        } catch (Exception e) {
            cachedModel.set("gemini-pro");
        }
    }

    private String getModel() {
        String model = cachedModel.get();
        if (model == null) {
            discoverBestModel();
            model = cachedModel.get();
        }
        return model != null ? model : "gemini-pro";
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> chat(String message, List<Map<String, String>> history, String image, String mimeType) {
        try {
            if (message == null || message.trim().isEmpty()) {
                return Map.of("success", false, "error", "Tin nhắn không được để trống");
            }

            // Build conversation contents
            List<Map<String, Object>> contents = new ArrayList<>();

            // Add system instruction as first user message
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", SYSTEM_PROMPT + "\n\nHãy bắt đầu cuộc trò chuyện."))));
            contents.add(Map.of(
                    "role", "model",
                    "parts", List.of(Map.of("text",
                            "Xin chào! 👋 Tôi là AI Helper, sẵn sàng giúp đỡ bạn. Hãy hỏi tôi bất cứ điều gì!"))));

            // Add conversation history
            if (history != null) {
                for (Map<String, String> msg : history) {
                    String role = "user".equals(msg.get("role")) ? "user" : "model";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.get("content")))));
                }
            }

            // Add current message with optional image
            List<Map<String, Object>> currentParts = new ArrayList<>();
            currentParts.add(Map.of("text", message));

            if (image != null && !image.isEmpty() && mimeType != null) {
                currentParts.add(Map.of("inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", image)));
            }

            contents.add(Map.of(
                    "role", "user",
                    "parts", currentParts));

            Map<String, Object> requestBody = Map.of(
                    "contents", contents,
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 2048));

            String modelToUse = getModel();

            Map<String, Object> response = webClient.post()
                    .uri("/models/" + modelToUse + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                return Map.of("success", false, "error", "Không nhận được phản hồi");
            }

            // Parse response
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String reply = (String) parts.get(0).get("text");
                        return Map.of(
                                "success", true,
                                "reply", reply != null ? reply.trim() : "",
                                "model", modelToUse);
                    }
                }
            }

            return Map.of("success", false, "error", "Không thể xử lý phản hồi");

        } catch (WebClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 404 || status == 503 || status == 429) {
                cachedModel.set(null);
                discoverBestModel();
                return Map.of("success", false, "error", "Model đang bận, vui lòng thử lại.");
            }
            return Map.of("success", false, "error", "Lỗi API: " + e.getMessage());
        } catch (Exception e) {
            return Map.of("success", false, "error", "Lỗi: " + e.getMessage());
        }
    }
}
