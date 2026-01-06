import { useState } from 'react'

function ChatAssistant() {
    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])

    const sendChat = () => {
        if (!chatMessage.trim()) return
        setChatHistory([...chatHistory, { role: 'user', content: chatMessage }])
        // TODO: Gọi API chat AI
        setChatHistory(prev => [...prev, { role: 'ai', content: 'Tính năng AI Chat đang được phát triển! 🚧' }])
        setChatMessage('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendChat()
        }
    }

    return (
        <div className="page chat-page">
            <div className="page-header">
                <h2>💬 AI Chat</h2>
                <p>Hỏi đáp với trí tuệ nhân tạo</p>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {chatHistory.length === 0 && (
                        <div className="chat-empty">
                            <span className="empty-icon">🤖</span>
                            <p>Bắt đầu cuộc trò chuyện với AI!</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>

                <div className="chat-input-container">
                    <textarea
                        className="chat-input"
                        placeholder="Nhập tin nhắn..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-btn" onClick={sendChat}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatAssistant
