import { useState } from 'react'
import { api } from './api/config'
import Sidebar from './components/Sidebar/Sidebar'
import HomePage from './components/pages/HomePage'
import ChatAssistant from './components/pages/ChatAssistant'
import MusicRecognition from './components/pages/MusicRecognition'
import ColorPicker from './components/pages/ColorPicker'
import Translate from './components/pages/Translate'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendStatus={backendStatus}
        loading={loading}
        onCheckBackend={checkBackend}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage onTabChange={setActiveTab} backendStatus={backendStatus} />
        )}
        {activeTab === 'chat' && <ChatAssistant />}
        {activeTab === 'music' && <MusicRecognition />}
        {activeTab === 'colorpicker' && <ColorPicker />}
        {activeTab === 'translate' && <Translate />}
      </main>
    </div>
  )
}

export default App
