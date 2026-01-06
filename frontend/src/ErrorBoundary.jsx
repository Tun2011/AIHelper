import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.log('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#ff6b6b',
                    background: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '12px',
                    margin: '20px'
                }}>
                    <h2>⚠️ Đã xảy ra lỗi</h2>
                    <p>Đã có lỗi khi xử lý ảnh. Vui lòng thử ảnh khác hoặc làm mới trang.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: '16px'
                        }}
                    >
                        🔄 Làm mới trang
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
