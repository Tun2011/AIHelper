function HomePage({ onTabChange, backendStatus }) {
    return (
        <div className="page home-page">
            <div className="hero">
                <h1>Chào mừng đến với <span className="gradient-text">AI Helper</span></h1>
                <p>Trợ lý AI cá nhân đa năng - Chat, Nhận diện nhạc, Dịch thuật</p>
            </div>

            <div className="features-grid">
                <div className="feature-card" onClick={() => onTabChange('chat')}>
                    <div className="feature-icon">💬</div>
                    <h3>AI Chat</h3>
                    <p>Trò chuyện với AI thông minh, giải đáp mọi thắc mắc</p>
                    <span className="feature-badge">OpenAI</span>
                </div>

                <div className="feature-card" onClick={() => onTabChange('music')}>
                    <div className="feature-icon">🎵</div>
                    <h3>Nhận diện nhạc</h3>
                    <p>Tìm tên bài hát từ giai điệu bất kỳ</p>
                    <span className="feature-badge">Shazam</span>
                </div>

                <div className="feature-card" onClick={() => onTabChange('translate')}>
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
    )
}

export default HomePage
