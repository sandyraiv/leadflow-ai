# 🔐 MongoDB Atlas IP Whitelisting - Quick Reference

## Why 0.0.0.0/0?

Since you're using **free tier services** (Render, Vercel), their IP addresses change dynamically. 
You cannot predict which IP will connect to your database.

**Solution:** Allow ALL IPs with `0.0.0.0/0` (CIDR notation meaning "every IP address").

⚠️ **Security Note:** This is acceptable for MVP/development. For production with real customer data, 
restrict to specific IPs or use VPC peering (paid feature).

---

## 📸 Step-by-Step (With Exact Clicks)

### Step 1: Open Network Access
```
MongoDB Atlas Dashboard → Security → Network Access
```

### Step 2: Add IP Address
```
Click green button: [+ ADD IP ADDRESS]
```

### Step 3: Configure Access
A popup will appear. You have TWO options:

#### ✅ Option A: Allow from Anywhere (RECOMMENDED for free tier)
```
Click: [ALLOW ACCESS FROM ANYWHERE]

This auto-fills:
  IP Address: 0.0.0.0/0
  Description: (optional) "All IPs - Render + Vercel + Local"
```

#### Option B: Add Current IP Only (NOT recommended)
```
Click: [ADD CURRENT IP ADDRESS]

⚠️ Problem: Only YOUR laptop can connect. 
Render/Vercel will get "IP not whitelisted" errors.
```

### Step 4: Confirm
```
Click: [Confirm]

You should see a new entry:
  0.0.0.0/0    includes your current IP address
```

### Step 5: Wait
```
Status will show: "Active" (takes 1-3 minutes)
```

---

## 🧪 Test Your Connection

After setup, test from your terminal:

```bash
# Using mongosh (MongoDB Shell)
mongosh "mongodb+srv://leadflow_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leadflowai"

# If connected successfully, you'll see:
# > leadflowai>
```

Or test from your backend:
```bash
cd backend
npm install
npm start

# Look for console output:
# ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

---

## ❌ Common Errors & Fixes

### Error: "MongoServerError: bad auth Authentication failed"
**Cause:** Wrong password in connection string
**Fix:** 
- Go to Database Access → leadflow_admin → [EDIT] → [Reset Password]
- Update password in your `.env` files
- **Special characters in password MUST be URL-encoded** (e.g., `@` → `%40`, `#` → `%23`)

### Error: "MongoNetworkError: connection refused"
**Cause:** IP not whitelisted
**Fix:** 
- Double-check Network Access has `0.0.0.0/0`
- If using a specific IP, your ISP may have changed it

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"
**Cause:** MongoDB cluster is paused (free tier pauses after inactivity)
**Fix:**
- Go to Atlas → Clusters → Resume your cluster
- Or create a new cluster (data may be lost if paused too long)

---

## 🔒 Production Security (When You Start Earning)

Once you have paying customers, upgrade your security:

1. **Remove 0.0.0.0/0**
2. **Add Render's outbound IPs:**
   - Render uses dynamic IPs, but you can add their IP ranges
   - Contact Render support or check their docs for ranges
3. **Add your laptop's static IP** (ask your ISP for one)
4. **Enable MongoDB Atlas VPC Peering** (paid M10+ clusters)

---

## 📋 Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created FREE Shared Cluster
- [ ] Created Database User (leadflow_admin)
- [ ] **Set Network Access to 0.0.0.0/0**
- [ ] Copied connection string
- [ ] Replaced `<password>` with actual password
- [ ] URL-encoded special characters in password
- [ ] Tested connection successfully
- [ ] Added MONGODB_URI to Render environment variables
- [ ] Added MONGODB_URI to scraper/.env file

---

## 🎯 One-Liner Summary

> **In MongoDB Atlas → Security → Network Access → Add IP Address → Click "ALLOW ACCESS FROM ANYWHERE" → This sets 0.0.0.0/0 → Click Confirm → Done.**
