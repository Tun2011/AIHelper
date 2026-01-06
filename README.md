# AI Helper 🤖

Personal App với kiến trúc Frontend + Backend tách biệt.

## 🏗️ Cấu trúc

```
├── backend/     🍳 Java Spring Boot (Deploy lên Render)
└── frontend/    🏠 React + Vite (Deploy lên Vercel)
```

## 🚀 Chạy Local

### Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
> Server chạy ở `http://localhost:8080`

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
> App chạy ở `http://localhost:5173`

## 🌐 Deploy

| Service | Platform | Folder |
|---------|----------|--------|
| Backend | Render | `/backend` |
| Frontend | Vercel | `/frontend` |

## 📝 License
MIT
