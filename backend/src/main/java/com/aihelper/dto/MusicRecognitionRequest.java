package com.aihelper.dto;

public class MusicRecognitionRequest {
    private String audioBase64;

    public MusicRecognitionRequest() {}

    public MusicRecognitionRequest(String audioBase64) {
        this.audioBase64 = audioBase64;
    }

    public String getAudioBase64() {
        return audioBase64;
    }

    public void setAudioBase64(String audioBase64) {
        this.audioBase64 = audioBase64;
    }
}
