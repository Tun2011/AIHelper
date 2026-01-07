package com.aihelper.controller;

import com.aihelper.service.TranslationService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@CrossOrigin(origins = "*")
public class TranslationController {

    private final TranslationService translationService;

    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping
    public Map<String, Object> translate(@RequestBody TranslateRequest request) {
        return translationService.translate(
                request.getText(),
                request.getSourceLang(),
                request.getTargetLang());
    }

    public static class TranslateRequest {
        private String text;
        private String sourceLang;
        private String targetLang;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getSourceLang() {
            return sourceLang;
        }

        public void setSourceLang(String sourceLang) {
            this.sourceLang = sourceLang;
        }

        public String getTargetLang() {
            return targetLang;
        }

        public void setTargetLang(String targetLang) {
            this.targetLang = targetLang;
        }
    }
}
