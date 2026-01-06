import { useState, useRef, useEffect } from 'react'
import './ChatAssistant.css'

function ChatAssistant() {
    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatHistory])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [chatMessage])

    const sendChat = async () => {
        if (!chatMessage.trim()) return

        const userMessage = chatMessage.trim()
        setChatMessage('')
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])

        // Simulate AI response
        setIsTyping(true)
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: 'Xin chào! Tôi là AI Helper. Tính năng AI Chat đang được phát triển. Bạn có thể sử dụng các tính năng khác như Nhận diện nhạc hoặc Color Picker! 🚀'
            }])
            setIsTyping(false)
        }, 1000)
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
                                <div className="chatgpt-message-content">
                                    <span className="chatgpt-message-role">
                                        {msg.role === 'user' ? 'Bạn' : 'AI Helper'}
                                    </span>
                                    <p>{msg.content}</p>
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
                <div className="chatgpt-input-container">
                    <button className="chatgpt-attach-btn" title="Đính kèm file">
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

                    <button className="chatgpt-voice-btn" title="Ghi âm">
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
