# 🚀 Deployment Guide - Shipment Management System

This guide will help you deploy the Shipment Management System to production.

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Post-Deployment Steps](#post-deployment-steps)
- [Environment Variables](#environment-variables)

---

## 🏗️ Architecture Overview

**Production Stack:**
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express + TypeScript)
- **Database**: MongoDB Atlas (Free Tier)

**Why this stack?**
- ✅ All services have generous free tiers
- ✅ Auto-deployment from GitHub
- ✅ Easy scaling when needed
- ✅ Built-in SSL certificates
- ✅ Global CDN for frontend

---

## 📦 Prerequisites

1. **GitHub Account**: https://github.com
2. **MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas
3. **Render Account**: https://render.com
4. **Vercel Account**: https://vercel.com

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose **Region**: Select closest to your users (e.g., Singapore, Mumbai)
6. Cluster Name: `shipment-management`
7. Click **"Create"**

### Step 2: Configure Database Access

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `shipment-admin`
5. Password: Click **"Autogenerate Secure Password"** (SAVE THIS!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is safe because we use username/password authentication
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://shipment-admin:<password>@shipment-management.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved earlier
7. Add database name at the end:
   ```
   mongodb+srv://shipment-admin:YOUR_PASSWORD@shipment-management.xxxxx.mongodb.net/shipment-management?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING!** You'll need it for Render deployment.

---

## 🖥️ Backend Deployment (Render)

### Step 1: Push Code to GitHub

1. Your code should already be on GitHub at: https://github.com/raghavlpu007/shipment-management
2. Make sure all changes are committed and pushed

### Step 2: Create Render Web Service

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **raghavlpu007/shipment-management**
5. Click **"Connect"**

### Step 3: Configure Web Service

**Basic Settings:**
- **Name**: `shipment-management-api`
- **Region**: Singapore (or closest to your users)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (750 hours/month)

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | `mongodb+srv://shipment-admin:YOUR_PASSWORD@...` (from Atlas) |
| `JWT_SECRET` | Generate random string (use: https://randomkeygen.com/) |
| `BCRYPT_ROUNDS` | `12` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (update after Vercel deployment) |
| `UPLOAD_DIR` | `/opt/render/project/src/uploads` |
| `MAX_FILE_SIZE` | `5242880` |
| `ALLOWED_FILE_TYPES` | `image/jpeg,image/png,image/gif,application/pdf` |

### Step 5: Add Persistent Disk (for file uploads)

1. Scroll to **"Disks"**
2. Click **"Add Disk"**
3. **Name**: `uploads`
4. **Mount Path**: `/opt/render/project/src/uploads`
5. **Size**: `1 GB` (free tier)

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://shipment-management-api.onrender.com`

**SAVE THIS URL!** You'll need it for frontend deployment.

### Step 7: Test Backend

Visit: `https://shipment-management-api.onrender.com/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update API Configuration

Before deploying, we need to update the frontend to use the production API URL.

**Option A: Using Environment Variable (Recommended)**

1. The frontend will use `VITE_API_URL` environment variable
2. We'll set this in Vercel dashboard

**Option B: Update Code Directly**

If you want to hardcode it, update `client/src/utils/api.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
})
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: **raghavlpu007/shipment-management**
4. Click **"Import"**

### Step 3: Configure Project

**Framework Preset**: Vite
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"**

Add:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://shipment-management-api.onrender.com/api` |

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like: `https://shipment-management-xyz.vercel.app`

### Step 6: Update CORS in Backend

1. Go back to Render dashboard
2. Open your web service
3. Go to **"Environment"**
4. Update `CORS_ORIGIN` to your Vercel URL: `https://shipment-management-xyz.vercel.app`
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## ✅ Post-Deployment Steps

### 1. Create Initial User

Since your database is empty, create the first user:

**Option A: Using API directly**

```bash
curl -X POST https://shipment-management-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sesaenterprises",
    "email": "sesaenterprisesm36@gmail.com",
    "password": "admin123"
  }'
```

**Option B: Use the Register page**

1. Go to your Vercel URL
2. Click "Create one now"
3. Register with your email
4. First user automatically becomes Super Admin

### 2. Test the Application

1. Visit your Vercel URL
2. Login with your credentials
3. Test creating a shipment
4. Test file upload
5. Test export functionality

### 3. Set Up Custom Domain (Optional)

**For Vercel (Frontend):**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**For Render (Backend):**
1. Go to Settings → Custom Domain
2. Add your API subdomain (e.g., api.yourdomain.com)
3. Update CORS_ORIGIN and VITE_API_URL accordingly

---

## 🔐 Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend.vercel.app
UPLOAD_DIR=/opt/render/project/src/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🔒 Security Checklist

- ✅ Strong JWT_SECRET (min 32 characters)
- ✅ MongoDB user with strong password
- ✅ CORS configured to allow only your frontend domain
- ✅ Rate limiting enabled
- ✅ Helmet.js security headers enabled
- ✅ File upload size limits configured
- ✅ HTTPS enabled (automatic on Vercel & Render)
- ✅ Environment variables not committed to git

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Check MongoDB Atlas cluster is running

**Problem**: "CORS error"
- Verify CORS_ORIGIN matches your Vercel URL exactly
- Check for trailing slashes
- Redeploy backend after changing CORS_ORIGIN

**Problem**: "File uploads not working"
- Verify disk is mounted correctly in Render
- Check UPLOAD_DIR path matches mount path
- Verify file size limits

### Frontend Issues

**Problem**: "API calls failing"
- Check VITE_API_URL is set correctly
- Verify backend is running (check /health endpoint)
- Check browser console for CORS errors

**Problem**: "Build failing"
- Check all dependencies are in package.json
- Verify Node version compatibility
- Check build logs in Vercel dashboard

---

## 📊 Monitoring

### Render Dashboard
- View logs: Dashboard → Logs
- Monitor metrics: Dashboard → Metrics
- Check deployments: Dashboard → Events

### Vercel Dashboard
- View deployments: Project → Deployments
- Check analytics: Project → Analytics
- Monitor performance: Project → Speed Insights

---

## 🔄 Continuous Deployment

Both Render and Vercel are configured for auto-deployment:

1. Push code to GitHub `main` branch
2. Render automatically rebuilds backend
3. Vercel automatically rebuilds frontend
4. Changes go live in 2-5 minutes

---

## 💰 Cost Breakdown

**Free Tier Limits:**

| Service | Free Tier | Limits |
|---------|-----------|--------|
| MongoDB Atlas | M0 | 512MB storage, Shared CPU |
| Render | Free | 750 hours/month, 512MB RAM, Sleeps after 15min inactivity |
| Vercel | Hobby | 100GB bandwidth/month, Unlimited deployments |

**Total Monthly Cost**: $0 (within free tier limits)

**When to upgrade:**
- MongoDB: When you exceed 512MB data
- Render: When you need 24/7 uptime (no sleep)
- Vercel: When you exceed 100GB bandwidth

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in respective dashboards
2. Verify all environment variables are set correctly
3. Test backend /health endpoint
4. Check MongoDB Atlas connection

---

## 🎉 Congratulations!

Your Shipment Management System is now live in production! 🚀

**Next Steps:**
- Share the URL with your team
- Set up monitoring and alerts
- Configure backups for MongoDB
- Add custom domain
- Set up SSL certificates (if using custom domain)

