import { useState } from 'react'
import { api } from './api/config'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkBackendHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.healthCheck()
      setBackendStatus(result)
    } catch (err) {
      setError('Không thể kết nối Backend! Hãy chắc chắn server đang chạy.')
      setBackendStatus(null)
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Helper</h1>
        <p className="subtitle">Personal App - Frontend + Backend Demo</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>🔌 Kiểm tra kết nối Backend</h2>
          <p>Nhấn nút bên dưới để test xem Frontend có gọi được Backend không</p>

          <button
            onClick={checkBackendHealth}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '⏳ Đang kiểm tra...' : '🚀 Test Connection'}
          </button>

          {error && (
            <div className="status error">
              ❌ {error}
            </div>
          )}

          {backendStatus && (
            <div className="status success">
              <h3>✅ Kết nối thành công!</h3>
              <pre>{JSON.stringify(backendStatus, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="card info">
          <h2>📋 Hướng dẫn chạy</h2>
          <div className="instructions">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <strong>Chạy Backend (Terminal 1):</strong>
                <code>cd backend && mvn spring-boot:run</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <strong>Chạy Frontend (Terminal 2):</strong>
                <code>cd frontend && npm run dev</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <strong>Test:</strong>
                <span>Nhấn nút "Test Connection" ở trên</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>🏠 Sảnh: Vercel (React) | 🍳 Bếp: Render (Java Spring Boot)</p>
      </footer>
    </div>
  )
}

export default App

