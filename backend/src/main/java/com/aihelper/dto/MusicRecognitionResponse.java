package com.aihelper.dto;

public class MusicRecognitionResponse {
    private boolean found;
    private String title;
    private String artist;
    private String album;
    private String coverUrl;
    private String message;
    private String previewUrl;

    public MusicRecognitionResponse() {}

    public static MusicRecognitionResponse notFound(String message) {
        MusicRecognitionResponse response = new MusicRecognitionResponse();
        response.setFound(false);
        response.setMessage(message);
        return response;
    }

    public static MusicRecognitionResponse success(String title, String artist, String album, String coverUrl, String previewUrl) {
        MusicRecognitionResponse response = new MusicRecognitionResponse();
        response.setFound(true);
        response.setTitle(title);
        response.setArtist(artist);
        response.setAlbum(album);
        response.setCoverUrl(coverUrl);
        response.setPreviewUrl(previewUrl);
        response.setMessage("Đã tìm thấy bài hát!");
        return response;
    }

    // Getters and Setters
    public boolean isFound() { return found; }
    public void setFound(boolean found) { this.found = found; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }
}
