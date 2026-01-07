import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../api/config'
import './ChatAssistant.css'

function ChatAssistant() {
    const [chatMessage, setChatMessage] = useState('')
    // Load history from localStorage
    const [chatHistory, setChatHistory] = useState(() => {
        const saved = localStorage.getItem('chatHistory')
        return saved ? JSON.parse(saved) : []
    })
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState(null)
    const [isListening, setIsListening] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
        // Save to localStorage whenever history changes
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    }, [chatHistory])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [chatMessage])

    // Voice Input
    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Trình duyệt không hỗ trợ nhận diện giọng nói.')
            return
        }

        if (isListening) {
            // It will stop automatically or we can't force stop easily without ref, 
            // but usually toggling UI state is enough as we don't hold the instance.
            // For proper toggle, we'd need to keep recognition instance in ref.
            // For now simplest is just let it finish or use the one-shot.
            // Actually, let's keep it simple: one shot recognition.
            return
        }

        const recognition = new window.webkitSpeechRecognition()
        recognition.lang = 'vi-VN'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setChatMessage(prev => prev + (prev ? ' ' : '') + transcript)
        }

        recognition.start()
    }

    // Image Upload
    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            setSelectedImage({
                data: reader.result.split(',')[1],
                mimeType: file.type,
                preview: reader.result
            })
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setSelectedImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const clearChat = () => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?')) {
            setChatHistory([])
            localStorage.removeItem('chatHistory')
        }
    }

    const sendChat = async () => {
        if (!chatMessage.trim() && !selectedImage) return

        const userMessage = chatMessage.trim()
        const imageToSend = selectedImage

        setChatMessage('')
        setSelectedImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setError(null)

        // Add user message to history
        const newHistory = [...chatHistory, {
            role: 'user',
            content: userMessage,
            image: imageToSend?.preview
        }]
        setChatHistory(newHistory)

        // Call AI API
        setIsTyping(true)
        try {
            const result = await api.chat(
                userMessage,
                chatHistory, // Note: backend handles text-only history for now, which is fine
                imageToSend?.data,
                imageToSend?.mimeType
            )

            if (result.success) {
                setChatHistory(prev => [...prev, {
                    role: 'ai',
                    content: result.reply
                }])
            } else {
                setError(result.error || 'Có lỗi xảy ra')
                setChatHistory(prev => [...prev, {
                    role: 'ai',
                    content: '❌ ' + (result.error || 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại!')
                }])
            }
        } catch (err) {
            setError('Không thể kết nối đến server')
            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: '❌ Không thể kết nối đến server. Vui lòng kiểm tra backend!'
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendChat()
        }
    }

    const hasMessages = chatHistory.length > 0

    return (
        <div className="chatgpt-page">
            {/* Header with Clear button */}
            {hasMessages && (
                <div className="chat-actions" style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                    <button
                        onClick={clearChat}
                        style={{
                            padding: '8px 12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--error)',
                            border: '1px solid var(--error)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        🗑️ Xóa hội thoại
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="chatgpt-messages-area">
                {!hasMessages ? (
                    // Empty state - centered greeting
                    <div className="chatgpt-empty-state">
                        <h1 className="chatgpt-greeting">Tôi có thể giúp gì cho bạn?</h1>
                    </div>
                ) : (
                    // Chat history
                    <div className="chatgpt-messages">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`chatgpt-message ${msg.role}`}>
                                <div className="chatgpt-message-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="chatgpt-message-content" style={{ overflowWrap: 'anywhere' }}>
                                    <span className="chatgpt-message-role">
                                        {msg.role === 'user' ? 'Bạn' : 'AI Helper'}
                                    </span>
                                    {msg.image && (
                                        <img src={msg.image} alt="User upload" className="chat-image" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }} />
                                    )}
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chatgpt-message ai">
                                <div className="chatgpt-message-avatar">🤖</div>
                                <div className="chatgpt-message-content">
                                    <span className="chatgpt-message-role">AI Helper</span>
                                    <div className="chatgpt-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area - Always at bottom */}
            <div className="chatgpt-input-wrapper">
                {selectedImage && (
                    <div className="image-preview-container">
                        <img src={selectedImage.preview} alt="Upload preview" className="image-preview" />
                        <button className="remove-image-btn" onClick={removeImage}>×</button>
                    </div>
                )}
                <div className="chatgpt-input-container">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <button
                        className={`chatgpt-attach-btn ${selectedImage ? 'active' : ''}`}
                        title="Đính kèm ảnh"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>

                    <textarea
                        ref={textareaRef}
                        className="chatgpt-input"
                        placeholder="Hỏi bất kỳ điều gì"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    <button
                        className={`chatgpt-voice-btn ${isListening ? 'listening' : ''}`}
                        title="Ghi âm"
                        onClick={toggleVoiceInput}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    </button>

                    <button
                        className={`chatgpt-send-btn ${chatMessage.trim() ? 'active' : ''}`}
                        onClick={sendChat}
                        disabled={!chatMessage.trim()}
                        title="Gửi"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
                <p className="chatgpt-disclaimer">AI Helper có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</p>
            </div>
        </div>
    )
}

export default ChatAssistant
