# 🚀 LeadFlow AI - Deployment Guide

## Overview
This guide will walk you through deploying your AI Lead Generator SaaS using **completely free** services.

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel (Free) │────▶│  Render (Free)   │────▶│ MongoDB Atlas   │
│   React Frontend│     │  Node.js Backend │     │   (Free Tier)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                               ▲
         │                                               │
         └───────────────────────────────────────────────┘
                    Your Local Computer
                    (Python Scraper)
```

---

## Step 1: MongoDB Atlas (Database)

### 1.1 Create Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up with Google (free, no credit card needed)
3. Create a new **Shared Cluster** (FREE forever)

### 1.2 Configure Database
1. Choose **AWS** as cloud provider
2. Select region closest to your users (e.g., Mumbai `ap-south-1` for India)
3. Click **Create Cluster** (takes 1-3 minutes)

### 1.3 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Username: `leadflow_admin`
3. Password: Generate a strong password (save it!)
4. Role: **Read and Write to Any Database**
5. Click **Add User**

### 1.4 Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (for development)
   - For production, add specific IPs only
3. Click **Confirm**

### 1.5 Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Drivers** → **Node.js**
3. Copy the connection string:
   ```
   mongodb+srv://leadflow_admin:<password>@cluster0.xxxxx.mongodb.net/leadflowai?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. **SAVE THIS** - you'll need it for Render and the scraper

---

## Step 2: Render (Backend API)

### 2.1 Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)

### 2.2 Prepare Your Backend
1. Push your code to GitHub (only the `backend/` folder, or entire repo)
2. Make sure `backend/package.json` has a `start` script

### 2.3 Create Web Service
1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `leadflow-api` (or any name)
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 2.4 Add Environment Variables
Click **Environment** and add:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://leadflow_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leadflowai?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRE=30d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait for build to complete (2-3 minutes)
3. Your API URL will be: `https://leadflow-api.onrender.com`
4. **SAVE THIS URL**

---

## Step 3: Vercel (Frontend)

### 3.1 Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)

### 3.2 Deploy Frontend
1. Click **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)

### 3.3 Add Environment Variables
Click **Environment Variables** and add:
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

### 3.4 Deploy
1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Your frontend URL will be: `https://your-app.vercel.app`

---

## Step 4: Hostinger (Landing Page + Domain)

Since you already have Hostinger Premium Business Hosting:

### 4.1 Point Domain to Vercel
1. In Hostinger hPanel, go to **Domains** → **DNS Zone Editor**
2. Add these records:

   **For root domain (yourdomain.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP)
   TTL: 3600
   ```

   **For www (www.yourdomain.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. In Vercel Dashboard → **Domains** → Add your custom domain
4. Vercel will verify DNS settings (may take up to 24 hours)

### 4.2 Alternative: Use Hostinger for Landing Page Only
If you want to keep your Hostinger site:
1. Upload a simple landing page to Hostinger
2. Add a "Launch App" button linking to your Vercel app
3. This gives you SEO benefits + fast app hosting

---

## Step 5: Scraper Setup (Your Computer)

### 5.1 Install Dependencies
```bash
cd scraper
pip install -r requirements.txt
```

### 5.2 Create .env File
Create `scraper/.env`:
```
MONGODB_URI=mongodb+srv://leadflow_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leadflowai?retryWrites=true&w=majority
API_BASE_URL=https://your-render-app.onrender.com/api
ADMIN_TOKEN=your-admin-jwt-token
```

### 5.3 Get Admin Token
1. Register a user via your app
2. Go to MongoDB Atlas → Browse Collections → `users`
3. Find your user and change `role` from `"user"` to `"admin"`
4. Login again to get a new JWT token (check browser DevTools → Application → Local Storage)
5. Copy that token to your `.env` file

### 5.4 Run Scraper
```bash
# Scrape Google Maps
python google_maps_scraper.py --city "Mumbai" --category "Restaurant" --limit 50

# Or upload from CSV
python bulk_upload.py --file sample_leads.csv --city "Mumbai" --category "Restaurant"
```

---

## Step 6: Payment Integration (Razorpay)

### 6.1 Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up (free, no setup fees)
3. Complete KYC to accept real payments

### 6.2 Get API Keys
1. Dashboard → Settings → API Keys
2. Generate Key ID and Key Secret
3. Add to Render environment variables:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

### 6.3 Test Mode
- Use test keys for development
- Test card: `5267 3181 8797 5449`, any future date, any CVV

---

## Step 7: First Admin User

After deployment, you need to create an admin:

1. Register normally through the app
2. Go to MongoDB Atlas → Browse Collections → `users`
3. Find your document, update:
   ```json
   { "role": "admin" }
   ```
4. Logout and login again
5. You can now access `/admin` route

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your actual Vercel/Hostinger URL
- Add `https://your-domain.com` to CORS origins in `backend/src/server.js`

### MongoDB Connection Failed
- Check if IP is whitelisted in MongoDB Atlas
- Verify password in connection string (special characters must be URL-encoded)

### Render Free Tier Sleeps
- Free tier spins down after 15 min of inactivity
- First request after sleep takes 30-60 seconds to wake up
- For production, consider upgrading to Starter ($7/month)

### Vercel Build Fails
- Make sure `frontend/package.json` has correct dependencies
- Check that `REACT_APP_API_URL` is set in environment variables

---

## Next Steps

1. ✅ Add real payment flow with Razorpay
2. ✅ Set up email notifications (Resend.com - free tier)
3. ✅ Add WhatsApp outreach (Twilio or WhatsApp Business API)
4. ✅ Implement AI cold email generation (OpenAI API - paid)
5. ✅ Add CRM integrations (Zapier webhooks)

---

## Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| MongoDB Atlas | 512 MB storage, shared RAM |
| Render | 750 hours/month, sleeps after 15min |
| Vercel | 100 GB bandwidth, 6,000 build minutes |
| Razorpay | 2% transaction fee (no monthly fee) |

**Total Monthly Cost: $0** (until you scale)

---

## Support

If you get stuck:
1. Check Render logs: Dashboard → your service → Logs
2. Check MongoDB metrics: Atlas → Monitoring
3. Open browser DevTools → Network tab for API errors
