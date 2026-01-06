function Translate() {
    return (
        <div className="page translate-page">
            <div className="page-header">
                <h2>🌐 Dịch văn bản</h2>
                <p>Hỗ trợ đa ngôn ngữ</p>
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
    )
}

export default Translate
