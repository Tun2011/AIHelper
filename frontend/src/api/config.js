// API Configuration
// Thay đổi BACKEND_URL khi deploy lên Render

const config = {
  // Thay thẳng link Render vào đây (Lưu ý: KHÔNG có dấu / ở cuối cùng)
  // Production: 'https://aihelper-gyb2.onrender.com'
  // Local: 'http://localhost:10000'
  BACKEND_URL: 'http://localhost:10000',
};

// API Helper functions
export const api = {
  // Health check - kiểm tra backend còn sống không
  async healthCheck() {
    const response = await fetch(`${config.BACKEND_URL}/health`);
    return response.json();
  },

  // Generic POST request
  async post(endpoint, data) {
    const response = await fetch(`${config.BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Generic GET request
  async get(endpoint) {
    const response = await fetch(`${config.BACKEND_URL}${endpoint}`);
    return response.json();
  },

  // Music Recognition API
  async recognizeMusic(audioBase64) {
    const response = await fetch(`${config.BACKEND_URL}/api/music/recognize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioBase64 }),
    });
    return response.json();
  },

  // Translation API
  async translate(text, sourceLang, targetLang) {
    const response = await fetch(`${config.BACKEND_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });
    return response.json();
  },
};

export default config;
