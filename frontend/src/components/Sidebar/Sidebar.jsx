function Sidebar({ activeTab, onTabChange, backendStatus, loading, onCheckBackend }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <span className="logo-icon">🤖</span>
                <span className="logo-text">AI Helper</span>
            </div>

            <nav className="nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => onTabChange('home')}
                >
                    <span className="nav-icon">🏠</span>
                    <span>Trang chủ</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => onTabChange('chat')}
                >
                    <span className="nav-icon">💬</span>
                    <span>AI Chat</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'music' ? 'active' : ''}`}
                    onClick={() => onTabChange('music')}
                >
                    <span className="nav-icon">🎵</span>
                    <span>Nhận diện nhạc</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'colorpicker' ? 'active' : ''}`}
                    onClick={() => onTabChange('colorpicker')}
                >
                    <span className="nav-icon">🎨</span>
                    <span>Color Picker</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'translate' ? 'active' : ''}`}
                    onClick={() => onTabChange('translate')}
                >
                    <span className="nav-icon">🌐</span>
                    <span>Dịch văn bản</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="status-btn" onClick={onCheckBackend} disabled={loading}>
                    <span className={`status-dot ${backendStatus?.status === 'UP' ? 'online' : ''}`}></span>
                    <span>{loading ? 'Đang kiểm tra...' : 'Backend Status'}</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
