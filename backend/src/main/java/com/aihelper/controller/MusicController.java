package com.aihelper.controller;

import com.aihelper.dto.MusicRecognitionRequest;
import com.aihelper.dto.MusicRecognitionResponse;
import com.aihelper.service.MusicRecognitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/music")
@CrossOrigin(origins = "*")
public class MusicController {

    private final MusicRecognitionService musicRecognitionService;

    public MusicController(MusicRecognitionService musicRecognitionService) {
        this.musicRecognitionService = musicRecognitionService;
    }

    @PostMapping("/recognize")
    public ResponseEntity<MusicRecognitionResponse> recognizeMusic(@RequestBody MusicRecognitionRequest request) {
        if (request.getAudioBase64() == null || request.getAudioBase64().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(MusicRecognitionResponse.notFound("Audio data is required"));
        }

        MusicRecognitionResponse response = musicRecognitionService.recognizeSong(request.getAudioBase64());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Music Recognition API is running!");
    }
}
