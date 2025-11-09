# 🚀 SIRAMA Deployment Guide

Panduan lengkap untuk deploy aplikasi SIRAMA dengan frontend di Vercel dan backend di Render.

## 📋 Prerequisites

- Akun GitHub dengan repository SIRAMA
- Akun Vercel (terhubung dengan GitHub)
- Akun Render (terhubung dengan GitHub)
- Domain (opsional, untuk production)

## 🏗️ Struktur Deployment

```
Frontend (Vercel) → https://sirama.vercel.app
Backend (Render)  → https://sirama-backend.onrender.com
Database (Render) → MySQL Database
```

## ⚙️ Konfigurasi Frontend (Vercel)

### 1. Import Project
1. Login ke [Vercel](https://vercel.com)
2. Klik "Import Project"
3. Pilih repository GitHub SIRAMA
4. Pilih branch `main`
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Environment Variables
Setelah project di-import, di Vercel dashboard → Settings → Environment Variables, tambahkan:

```
NEXT_PUBLIC_API_URL=https://sirama-backend.onrender.com
```

### 3. Deploy
Klik "Deploy" dan tunggu proses selesai.

## 🛠️ Konfigurasi Backend (Render)

### 1. Import Project
1. Login ke [Render](https://render.com)
2. Klik "New" → "Web Service"
3. Pilih repository GitHub SIRAMA
4. Configure service:
   - **Name**: `sirama-backend`
   - **Environment**: `Docker`
   - **Branch**: `main`
   - **Root Directory**: (leave empty, Dockerfile is in backend/)

### 2. Environment Variables
Tambahkan environment variables berikut:

```
APP_NAME=SIRAMA
APP_ENV=production
APP_DEBUG=false
FRONTEND_URL=https://sirama.vercel.app
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Database credentials akan otomatis diisi oleh Render.

### 3. Database Setup
1. Di Render dashboard, buat MySQL database baru
2. Connect database ke web service
3. Database akan otomatis migrate saat deploy pertama

## 🔗 Koneksi Frontend-Backend

### Update API Calls
Pastikan frontend menggunakan environment variable:

```javascript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // ... config lainnya
});
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend First
1. Deploy backend ke Render
2. Catat URL backend (contoh: `https://sirama-backend.onrender.com`)
3. Pastikan backend running dan database connected

### Step 2: Deploy Frontend
1. Update `NEXT_PUBLIC_API_URL` di Vercel dengan URL backend
2. Deploy frontend ke Vercel
3. Catat URL frontend (contoh: `https://sirama.vercel.app`)

### Step 3: Update CORS
1. Di Render backend, update `FRONTEND_URL` dengan URL frontend yang sebenarnya
2. Redeploy backend

## 🔍 Troubleshooting

### Build Gagal di Vercel
```bash
# Test build locally
cd frontend
npm run build
```

### API Connection Error
- Pastikan `NEXT_PUBLIC_API_URL` benar
- Check CORS settings di backend
- Verify backend URL accessible

### Database Connection Error
- Check database credentials di Render
- Pastikan migrations sudah run
- Verify database plan (gunakan Starter plan untuk development)

## 📝 Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://sirama-backend.onrender.com
```

### Backend (Render)
```
APP_NAME=SIRAMA
APP_ENV=production
APP_DEBUG=false
FRONTEND_URL=https://sirama.vercel.app
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

## 🎯 Post-Deployment Checklist

- [ ] Frontend accessible via Vercel URL
- [ ] Backend accessible via Render URL
- [ ] API endpoints responding correctly
- [ ] Database connected dan migrations applied
- [ ] CORS configured properly
- [ ] Authentication working
- [ ] All features tested

## 📞 Support

Jika ada masalah deployment, check:
1. Vercel build logs
2. Render service logs
3. Browser developer tools untuk network errors
4. Database connection status

---

**Happy Deploying! 🚀**
