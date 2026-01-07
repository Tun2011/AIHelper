import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/config'

const LANGUAGES = [
    { code: 'vi', name: '[VI] Tiếng Việt' },
    { code: 'en', name: '[EN] English' },
    { code: 'zh', name: '[ZH] 中文' },
    { code: 'ja', name: '[JA] 日本語' },
    { code: 'ko', name: '[KO] 한국어' },
    { code: 'fr', name: '[FR] Français' },
    { code: 'de', name: '[DE] Deutsch' },
    { code: 'es', name: '[ES] Español' },
    { code: 'ru', name: '[RU] Русский' },
    { code: 'th', name: '[TH] ไทย' },
]

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

function Translate() {
    const [sourceText, setSourceText] = useState('')
    const [translatedText, setTranslatedText] = useState('')
    const [sourceLang, setSourceLang] = useState('en')
    const [targetLang, setTargetLang] = useState('vi')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Debounce source text - wait 1 second after user stops typing
    const debouncedText = useDebounce(sourceText, 1000)

    // Auto-translate when debounced text changes
    useEffect(() => {
        const doTranslate = async () => {
            if (!debouncedText.trim()) {
                setTranslatedText('')
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const result = await api.translate(debouncedText, sourceLang, targetLang)

                if (result.success) {
                    setTranslatedText(result.translatedText)
                } else {
                    setError(result.error || 'Có lỗi xảy ra khi dịch')
                }
            } catch (err) {
                setError('Không thể kết nối đến server: ' + err.message)
            } finally {
                setIsLoading(false)
            }
        }

        doTranslate()
    }, [debouncedText, sourceLang, targetLang])

    const swapLanguages = () => {
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setSourceText(translatedText)
        setTranslatedText(sourceText)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(translatedText)
    }

    const clearAll = () => {
        setSourceText('')
        setTranslatedText('')
        setError(null)
    }

    return (
        <div className="page translate-page">
            <div className="page-header">
                <h2>🌐 Dịch văn bản</h2>
                <p>Dịch realtime • Powered by Google Gemini AI</p>
            </div>

            <div className="translate-container">
                <div className="translate-box">
                    <div className="translate-header">
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="lang-select"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                        {sourceText && (
                            <button className="clear-btn" onClick={clearAll} title="Xóa">
                                ✕
                            </button>
                        )}
                    </div>
                    <textarea
                        placeholder="Nhập văn bản cần dịch... (tự động dịch khi gõ)"
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                    />
                </div>

                <div className="translate-controls">
                    <button className="swap-btn" onClick={swapLanguages} title="Hoán đổi ngôn ngữ">
                        ⇄
                    </button>
                </div>

                <div className="translate-box">
                    <div className="translate-header">
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="lang-select"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                        <div className="header-actions">
                            {isLoading && <span className="loading-indicator">⏳</span>}
                            {translatedText && !isLoading && (
                                <button className="copy-btn" onClick={copyToClipboard} title="Sao chép">
                                    📋
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        placeholder={isLoading ? "Đang dịch..." : "Kết quả dịch sẽ hiện ở đây..."}
                        value={translatedText}
                        readOnly
                        className={isLoading ? 'loading' : ''}
                    />
                </div>
            </div>

            {error && (
                <div className="translate-error">
                    ❌ {error}
                </div>
            )}
        </div>
    )
}

export default Translate
