import { useState } from 'react'
import { api } from './api/config'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const checkBackend = async () => {
    setLoading(true)
    try {
      const result = await api.healthCheck()
      setBackendStatus(result)
    } catch (err) {
      setBackendStatus({ status: 'ERROR', message: 'Không thể kết nối' })
    }
    setLoading(false)
  }

  const sendChat = () => {
    if (!chatMessage.trim()) return
    setChatHistory([...chatHistory, { role: 'user', content: chatMessage }])
    // TODO: Gọi API chat AI
    setChatHistory(prev => [...prev, { role: 'ai', content: 'Tính năng AI Chat đang được phát triển! 🚧' }])
    setChatMessage('')
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">AI Helper</span>
        </div>

        <nav className="nav">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="nav-icon">🏠</span>
            <span>Trang chủ</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="nav-icon">💬</span>
            <span>AI Chat</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            <span className="nav-icon">🎵</span>
            <span>Nhận diện nhạc</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'translate' ? 'active' : ''}`}
            onClick={() => setActiveTab('translate')}
          >
            <span className="nav-icon">🌐</span>
            <span>Dịch văn bản</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="status-btn" onClick={checkBackend} disabled={loading}>
            <span className={`status-dot ${backendStatus?.status === 'UP' ? 'online' : ''}`}></span>
            <span>{loading ? 'Đang kiểm tra...' : 'Backend Status'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'home' && (
          <div className="page home-page">
            <div className="hero">
              <h1>Chào mừng đến với <span className="gradient-text">AI Helper</span></h1>
              <p>Trợ lý AI cá nhân đa năng - Chat, Nhận diện nhạc, Dịch thuật</p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setActiveTab('chat')}>
                <div className="feature-icon">💬</div>
                <h3>AI Chat</h3>
                <p>Trò chuyện với AI thông minh, giải đáp mọi thắc mắc</p>
                <span className="feature-badge">OpenAI</span>
              </div>

              <div className="feature-card" onClick={() => setActiveTab('music')}>
                <div className="feature-icon">🎵</div>
                <h3>Nhận diện nhạc</h3>
                <p>Tìm tên bài hát từ giai điệu bất kỳ</p>
                <span className="feature-badge">Shazam</span>
              </div>

              <div className="feature-card" onClick={() => setActiveTab('translate')}>
                <div className="feature-icon">🌐</div>
                <h3>Dịch văn bản</h3>
                <p>Dịch đa ngôn ngữ nhanh chóng và chính xác</p>
                <span className="feature-badge">AI Translate</span>
              </div>
            </div>

            {backendStatus && (
              <div className={`status-banner ${backendStatus.status === 'UP' ? 'success' : 'error'}`}>
                {backendStatus.status === 'UP' ? '✅' : '❌'} {backendStatus.message}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
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

              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                />
                <button onClick={sendChat}>Gửi</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="page music-page">
            <div className="page-header">
              <h2>🎵 Nhận diện nhạc</h2>
              <p>Tìm tên bài hát từ giai điệu</p>
            </div>

            <div className="music-container">
              <div className="music-recorder">
                <div className="recorder-icon">🎤</div>
                <p>Nhấn để bắt đầu thu âm</p>
                <button className="record-btn">
                  <span>Bắt đầu ghi</span>
                </button>
              </div>
              <p className="coming-soon">🚧 Tính năng đang phát triển...</p>
            </div>
          </div>
        )}

        {activeTab === 'translate' && (
          <div className="page translate-page">
            <div className="page-header">
              <h2>🌐 Dịch văn bản</h2>
              <p>Dịch nhanh giữa các ngôn ngữ</p>
            </div>

            <div className="translate-container">
              <div className="translate-box">
                <label>Văn bản gốc</label>
                <textarea placeholder="Nhập văn bản cần dịch..."></textarea>
              </div>
              <div className="translate-arrow">→</div>
              <div className="translate-box">
                <label>Bản dịch</label>
                <textarea placeholder="Kết quả dịch sẽ hiện ở đây..." readOnly></textarea>
              </div>
              <p className="coming-soon">🚧 Tính năng đang phát triển...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
