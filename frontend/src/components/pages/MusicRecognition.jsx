import { useState, useRef } from 'react'
import { api } from '../../api/config'

function MusicRecognition() {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [songResult, setSongResult] = useState(null)
    const [musicError, setMusicError] = useState(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const timerRef = useRef(null)

    const startRecording = async () => {
        try {
            setMusicError(null)
            setSongResult(null)
            setRecordingTime(0)

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop())
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                await processAudio(audioBlob)
            }

            mediaRecorder.start(100)
            setIsRecording(true)

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

            // Auto stop after 8 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    stopRecording()
                }
            }, 8000)

        } catch (err) {
            setMusicError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const processAudio = async (audioBlob) => {
        setIsProcessing(true)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1]
                const result = await api.recognizeMusic(base64)
                setSongResult(result)
                setIsProcessing(false)
            }
            reader.readAsDataURL(audioBlob)
        } catch (err) {
            setMusicError('Lỗi xử lý audio: ' + err.message)
            setIsProcessing(false)
        }
    }

    const resetMusicState = () => {
        setSongResult(null)
        setMusicError(null)
        setRecordingTime(0)
    }

    return (
        <div className="page music-page">
            <div className="page-header">
                <h2>🎵 Nhận diện nhạc</h2>
                <p>Powered by Shazam API</p>
            </div>

            <div className="music-container">
                {/* Recording Section */}
                {!isProcessing && !songResult && !musicError && (
                    <div className={`music-recorder ${isRecording ? 'recording' : ''}`}>
                        <div className="recorder-icon">{isRecording ? '🎙️' : '🎤'}</div>
                        {isRecording ? (
                            <>
                                <p className="recording-text">Đang lắng nghe... {recordingTime}s</p>
                                <div className="sound-wave">
                                    <span></span><span></span><span></span><span></span><span></span>
                                </div>
                                <button className="record-btn stop" onClick={stopRecording}>
                                    <span>⏹️ Dừng ghi</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <p>Phát nhạc và nhấn nút để nhận diện</p>
                                <button className="record-btn" onClick={startRecording}>
                                    <span>🎤 Bắt đầu ghi</span>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="music-processing">
                        <div className="processing-spinner"></div>
                        <p>Đang nhận diện bài hát...</p>
                    </div>
                )}

                {/* Error State */}
                {musicError && (
                    <div className="music-error">
                        <span className="error-icon">❌</span>
                        <p>{musicError}</p>
                        <button className="retry-btn" onClick={resetMusicState}>Thử lại</button>
                    </div>
                )}

                {/* Result Section */}
                {songResult && (
                    <div className="song-result">
                        {songResult.found ? (
                            <>
                                <div className="song-card">
                                    {songResult.coverUrl && (
                                        <img src={songResult.coverUrl} alt="Album cover" className="song-cover" />
                                    )}
                                    <div className="song-info">
                                        <h3 className="song-title">{songResult.title}</h3>
                                        <p className="song-artist">{songResult.artist}</p>
                                        {songResult.album && <p className="song-album">📀 {songResult.album}</p>}
                                    </div>
                                </div>
                                {songResult.previewUrl && (
                                    <audio controls src={songResult.previewUrl} className="song-preview">
                                        Your browser does not support audio.
                                    </audio>
                                )}
                            </>
                        ) : (
                            <div className="not-found">
                                <span className="not-found-icon">🔍</span>
                                <p>{songResult.message || 'Không tìm thấy bài hát nào phù hợp'}</p>
                            </div>
                        )}
                        <button className="retry-btn" onClick={resetMusicState}>
                            🎤 Nhận diện bài khác
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MusicRecognition
