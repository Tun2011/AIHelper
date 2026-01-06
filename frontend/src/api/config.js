// API Configuration
// Thay đổi BACKEND_URL khi deploy lên Render

const config = {
  // Development: chạy local
  // Production: thay bằng URL từ Render (ví dụ: https://your-app.onrender.com)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
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
};

export default config;
