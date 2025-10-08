# 📋 Deployment Checklist

Use this checklist to ensure smooth deployment.

## ✅ Pre-Deployment

### Code Preparation
- [ ] All code committed and pushed to GitHub
- [ ] `.gitignore` configured (node_modules, .env, dist, uploads)
- [ ] `.env.example` files created for both server and client
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] All dependencies listed in package.json
- [ ] Build scripts tested locally (`npm run build`)

### Security
- [ ] Strong JWT_SECRET generated (min 32 characters)
- [ ] MongoDB password is strong and secure
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] File upload limits configured
- [ ] Helmet.js security headers enabled

## 🗄️ Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] Free tier M0 cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained and tested
- [ ] Database name added to connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/shipment-management?retryWrites=true&w=majority
```

## 🖥️ Backend Deployment (Render)

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Root directory set to `server`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added:
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] MONGO_URI (from Atlas)
  - [ ] JWT_SECRET (generated)
  - [ ] BCRYPT_ROUNDS=12
  - [ ] RATE_LIMIT_WINDOW_MS=900000
  - [ ] RATE_LIMIT_MAX_REQUESTS=100
  - [ ] CORS_ORIGIN (will update after Vercel)
  - [ ] UPLOAD_DIR=/opt/render/project/src/uploads
  - [ ] MAX_FILE_SIZE=5242880
  - [ ] ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
- [ ] Persistent disk added for uploads (1GB)
- [ ] Deployment successful
- [ ] Health endpoint tested: `/health`
- [ ] Backend URL saved for frontend configuration

**Backend URL:** `https://shipment-management-api.onrender.com`

## 🌐 Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported
- [ ] Root directory set to `client`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] VITE_API_URL (backend URL + /api)
- [ ] Deployment successful
- [ ] Frontend URL saved
- [ ] Application loads correctly

**Frontend URL:** `https://shipment-management-xyz.vercel.app`

## 🔄 Post-Deployment Configuration

- [ ] Update CORS_ORIGIN in Render with Vercel URL
- [ ] Redeploy backend after CORS update
- [ ] Test API calls from frontend to backend
- [ ] Verify no CORS errors in browser console

## 👤 Initial User Setup

- [ ] First user created (becomes Super Admin automatically)
- [ ] Login tested successfully
- [ ] User credentials saved securely

**Initial User:**
- Email: sesaenterprisesm36@gmail.com
- Password: [Your secure password]
- Role: Super Admin

## 🧪 Testing

### Backend Tests
- [ ] Health endpoint: `GET /health`
- [ ] Register endpoint: `POST /api/auth/register`
- [ ] Login endpoint: `POST /api/auth/login`
- [ ] MongoDB connection working
- [ ] File upload working
- [ ] API responses correct

### Frontend Tests
- [ ] Application loads
- [ ] Login page works
- [ ] Registration works
- [ ] Dashboard displays
- [ ] Create shipment works
- [ ] File upload works
- [ ] Export functionality works
- [ ] All pages accessible
- [ ] No console errors

### Integration Tests
- [ ] Frontend can communicate with backend
- [ ] Authentication flow works end-to-end
- [ ] Data persists in MongoDB
- [ ] File uploads save correctly
- [ ] CORS working properly

## 🔒 Security Verification

- [ ] HTTPS enabled (automatic on Vercel & Render)
- [ ] JWT tokens working
- [ ] Password hashing working (bcrypt)
- [ ] Rate limiting active
- [ ] File upload restrictions working
- [ ] CORS only allows your frontend domain
- [ ] No sensitive data exposed in responses
- [ ] Error messages don't leak sensitive info

## 📊 Monitoring Setup

- [ ] Render dashboard bookmarked
- [ ] Vercel dashboard bookmarked
- [ ] MongoDB Atlas dashboard bookmarked
- [ ] Log monitoring configured
- [ ] Error tracking set up (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)

## 📝 Documentation

- [ ] README.md updated with production URLs
- [ ] DEPLOYMENT.md reviewed
- [ ] Environment variables documented
- [ ] API documentation updated (if applicable)
- [ ] User guide created (if needed)

## 🎯 Final Checks

- [ ] All features working in production
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] No broken links
- [ ] All images loading
- [ ] Favicon displaying

## 🚀 Go Live

- [ ] Share production URL with stakeholders
- [ ] Monitor for first 24 hours
- [ ] Check error logs regularly
- [ ] Verify database backups (MongoDB Atlas auto-backup)
- [ ] Set up alerts for downtime (optional)

## 📞 Emergency Contacts

**Service Status Pages:**
- Render: https://status.render.com
- Vercel: https://www.vercel-status.com
- MongoDB Atlas: https://status.mongodb.com

**Support:**
- Render: https://render.com/docs
- Vercel: https://vercel.com/support
- MongoDB: https://www.mongodb.com/support

## 🔄 Rollback Plan

If something goes wrong:

1. **Frontend Issue:**
   - Go to Vercel → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Backend Issue:**
   - Go to Render → Events
   - Find last working deployment
   - Click "Redeploy"

3. **Database Issue:**
   - MongoDB Atlas has automatic backups
   - Go to Clusters → Backup
   - Restore from snapshot

## 📈 Next Steps After Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure email notifications (optional)
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Set up automated backups
- [ ] Create staging environment
- [ ] Document API endpoints
- [ ] Create user training materials
- [ ] Plan for scaling (when needed)

---

## ✅ Deployment Complete!

**Production URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`
- Database: MongoDB Atlas

**Credentials:**
- Email: sesaenterprisesm36@gmail.com
- Password: [Your secure password]

**Status:** 🟢 Live and Running

---

**Date Deployed:** _______________
**Deployed By:** _______________
**Version:** 1.0.0

