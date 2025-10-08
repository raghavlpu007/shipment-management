# 🐙 GitHub Repository Setup Guide

This guide will help you create a new GitHub repository and push your code.

## 📋 Prerequisites

- GitHub account (https://github.com)
- Git installed on your computer
- Code already committed locally (✅ Already done!)

---

## 🚀 Step-by-Step Instructions

### Step 1: Create New Repository on GitHub

1. **Go to GitHub**: https://github.com/raghavlpu007
2. **Click** the green **"New"** button (or go to https://github.com/new)
3. **Fill in repository details**:
   - **Repository name**: `shipment-management` (or your preferred name)
   - **Description**: `Comprehensive shipment management system with React, Node.js, and MongoDB`
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. **Click** "Create repository"

### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

**Option A: If you see the "Quick setup" page**

Copy the repository URL shown (it will look like):
```
https://github.com/raghavlpu007/shipment-management.git
```

**Option B: Find the URL manually**

The URL format is:
```
https://github.com/raghavlpu007/REPOSITORY-NAME.git
```

### Step 3: Push Code to GitHub

Open your terminal in the project directory and run:

```bash
# Add the remote repository
git remote add origin https://github.com/raghavlpu007/shipment-management.git

# Verify the remote was added
git remote -v

# Push code to GitHub
git push -u origin master
```

**If you get an authentication error**, you'll need to:

1. **Use Personal Access Token (Recommended)**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name: "Shipment Management Deployment"
   - Select scopes: `repo` (all), `workflow`
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)
   - When pushing, use token as password:
     ```bash
     Username: raghavlpu007
     Password: [paste your token here]
     ```

2. **Or use GitHub CLI** (easier):
   ```bash
   # Install GitHub CLI: https://cli.github.com/
   gh auth login
   # Follow the prompts
   ```

### Step 4: Verify Upload

1. Go to https://github.com/raghavlpu007/shipment-management
2. You should see all your files
3. Check that:
   - ✅ README.md is displayed
   - ✅ DEPLOYMENT.md exists
   - ✅ client/ and server/ folders are present
   - ✅ .gitignore is working (no node_modules, .env files)

---

## 🔐 Security Check

Before proceeding, verify these files are **NOT** in the repository:

- ❌ `node_modules/` folders
- ❌ `.env` files (server/.env, client/.env)
- ❌ `dist/` or `build/` folders
- ❌ `server/uploads/` (except .gitkeep)

If you see any of these, they should be removed. The `.gitignore` file prevents them from being tracked.

---

## 📝 Repository Settings (Optional but Recommended)

### Add Repository Description

1. Go to your repository on GitHub
2. Click the ⚙️ icon next to "About"
3. Add:
   - **Description**: `Full-stack shipment management system with React, TypeScript, Node.js, Express, and MongoDB`
   - **Website**: (add after Vercel deployment)
   - **Topics**: `react`, `typescript`, `nodejs`, `express`, `mongodb`, `shipment-management`, `vite`, `tailwindcss`

### Enable Issues and Discussions

1. Go to Settings → General
2. Under "Features":
   - ✅ Enable Issues
   - ✅ Enable Discussions (optional)

### Add Branch Protection (Optional)

1. Go to Settings → Branches
2. Add rule for `master` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass

---

## 🎯 Next Steps

Now that your code is on GitHub, you can proceed with deployment:

1. ✅ **Code on GitHub** - Done!
2. 📦 **Set up MongoDB Atlas** - See [DEPLOYMENT.md](DEPLOYMENT.md#database-setup-mongodb-atlas)
3. 🖥️ **Deploy Backend to Render** - See [DEPLOYMENT.md](DEPLOYMENT.md#backend-deployment-render)
4. 🌐 **Deploy Frontend to Vercel** - See [DEPLOYMENT.md](DEPLOYMENT.md#frontend-deployment-vercel)

---

## 🔄 Future Updates

When you make changes to your code:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: description"

# Push to GitHub
git push origin master
```

Both Render and Vercel will automatically detect the changes and redeploy! 🚀

---

## 🐛 Troubleshooting

### "Permission denied" error

**Solution**: Use Personal Access Token instead of password (see Step 3 above)

### "Repository not found" error

**Solution**: Check the repository URL is correct:
```bash
git remote -v
# If wrong, update it:
git remote set-url origin https://github.com/raghavlpu007/CORRECT-REPO-NAME.git
```

### "Failed to push some refs" error

**Solution**: Pull first, then push:
```bash
git pull origin master --allow-unrelated-histories
git push origin master
```

### Large files error

**Solution**: Check .gitignore is working:
```bash
git status
# Should NOT show node_modules, dist, .env files
```

---

## ✅ Checklist

- [ ] GitHub repository created
- [ ] Repository is public/private as desired
- [ ] Local git repository connected to GitHub
- [ ] Code pushed successfully
- [ ] All files visible on GitHub
- [ ] No sensitive files (.env, node_modules) in repository
- [ ] Repository description and topics added
- [ ] Ready to proceed with deployment

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- GitHub Support: https://support.github.com

---

**Repository URL**: https://github.com/raghavlpu007/shipment-management

**Next**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions

