# ⚡ Quick Reference Card

## 🔗 Important URLs

### Accounts to Create
- [ ] GitHub: https://github.com/raghavlpu007
- [ ] MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
- [ ] Render: https://render.com
- [ ] Vercel: https://vercel.com

### Your Production URLs (Fill after deployment)
- **Frontend**: `https://__________________.vercel.app`
- **Backend**: `https://__________________.onrender.com`
- **MongoDB**: `mongodb+srv://shipment-admin:____@____.mongodb.net/shipment-management`

---

## 📝 Environment Variables

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://shipment-admin:PASSWORD@cluster.mongodb.net/shipment-management
JWT_SECRET=<generate-32-char-random-string>
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

## 🚀 Deployment Steps (5-Phase Plan)

### Phase 1: GitHub (5 min)
```bash
git remote add origin https://github.com/raghavlpu007/shipment-management.git
git push -u origin master
```

### Phase 2: MongoDB Atlas (10 min)
1. Create M0 Free cluster
2. Create database user
3. Whitelist 0.0.0.0/0
4. Copy connection string

### Phase 3: Render (15 min)
1. New Web Service
2. Connect GitHub repo
3. Root: `server`
4. Add environment variables
5. Add disk: `/opt/render/project/src/uploads`

### Phase 4: Vercel (10 min)
1. Import project
2. Root: `client`
3. Add `VITE_API_URL`
4. Deploy

### Phase 5: Configure (5 min)
1. Update CORS_ORIGIN in Render
2. Create first user
3. Test application

**Total Time**: ~45 minutes

---

## 🔐 Credentials

### MongoDB Atlas
- Username: `shipment-admin`
- Password: `________________` (save securely!)

### Application Super Admin
- Email: `sesaenterprisesm36@gmail.com`
- Password: `________________` (set during first registration)

### GitHub Personal Access Token
- Token: `________________` (if needed for git push)

---

## ✅ Testing Checklist

After deployment, test these:

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Backend health: `https://your-api.onrender.com/health`
- [ ] User registration works
- [ ] User login works
- [ ] Create shipment works
- [ ] File upload works
- [ ] Export to CSV works
- [ ] No CORS errors in console
- [ ] No 404 errors

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update CORS_ORIGIN in Render to match Vercel URL |
| Can't connect to MongoDB | Check IP whitelist (0.0.0.0/0) and connection string |
| File upload fails | Verify disk mounted at `/opt/render/project/src/uploads` |
| Build fails | Check logs in Render/Vercel dashboard |
| 401 errors | Check JWT_SECRET is set in Render |

---

## 📞 Support Links

- **Render Status**: https://status.render.com
- **Vercel Status**: https://www.vercel-status.com
- **MongoDB Status**: https://status.mongodb.com
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🔄 Update & Redeploy

When you make code changes:

```bash
git add .
git commit -m "Description of changes"
git push origin master
```

Both Render and Vercel will auto-deploy! 🚀

---

## 💡 Pro Tips

1. **Render Free Tier**: Sleeps after 15min inactivity. First request after sleep takes ~30 seconds.
2. **MongoDB Free Tier**: 512MB limit. Monitor usage in Atlas dashboard.
3. **Vercel**: Unlimited deployments, 100GB bandwidth/month.
4. **Logs**: Check Render/Vercel dashboards for error logs.
5. **Backups**: MongoDB Atlas has automatic backups (7 days retention).

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_SUMMARY.md` | Overview & action plan |
| `GITHUB_SETUP.md` | GitHub repository setup |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `QUICK_REFERENCE.md` | This file |
| `README.md` | Project documentation |

---

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ All tests pass
- ✅ No console errors
- ✅ Users can login and create shipments
- ✅ Files upload successfully
- ✅ Export works

---

**Print this page for quick reference during deployment!** 📄

