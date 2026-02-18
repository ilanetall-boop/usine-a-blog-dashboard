# 🚀 NECLID Real Dashboard - Production Setup

## Status: READY FOR IMPLEMENTATION

Tous les credentials et configs sont trouvés. Le backend et frontend sont prêts.

---

## 📋 Checklist: Qu'est-ce qui est prêt

✅ **Service Account** - `usine-a-blogs@empire-affiliation-api.iam.gserviceaccount.com`
✅ **Credentials JSON** - Located at `/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/google-credentials.json`
✅ **GA4 Properties** - G-ZQGHN8Y56N (bath rugs) + G-PC9GTP4DCP (shower curtains)
✅ **GSC Domains** - sc-domain:bestbathrugs.com + sc-domain:best-shower-curtains.com
✅ **Google Sheets** - IDs for revenue tracking available
✅ **Backend Code** - Express API ready at `/backend/server.js`
✅ **Frontend Code** - Tailwind dashboard ready at `/real-dashboard.html`

---

## 🛠️ Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd /home/ilanetall/.openclaw/workspace/usine-a-blog-dashboard/backend
npm install
```

This installs:
- `express` - Web framework
- `google-auth-library` - OAuth2 authentication
- `googleapis` - Google APIs (Analytics, Search Console, Sheets)
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Step 2: Create .env File

```bash
cd backend
cat > .env << EOF
PORT=3000
CREDS_PATH=/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/google-credentials.json
REGISTRY_PATH=/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/blogs-registry.json
EOF
```

### Step 3: Start Backend

```bash
npm run dev
```

You should see:
```
🚀 NECLID Dashboard API
📍 Running on http://localhost:3000

✅ Credentials loaded: usine-a-blogs@empire-affiliation-api.iam.gserviceaccount.com
✅ Blogs configured: 2

📊 Endpoints ready:
   GET  /health
   GET  /api/dashboard
   GET  /api/analytics/:property_id
   GET  /api/search-console/:domain
   GET  /api/registry
   GET  /api/real-health-check
```

### Step 4: Open Dashboard

Open in browser:
```
file:///home/ilanetall/.openclaw/workspace/usine-a-blog-dashboard/real-dashboard.html
```

The dashboard will:
1. Connect to backend at `http://localhost:3000`
2. Fetch real health check data
3. Display in real-time UI

---

## 📊 What Gets Implemented Next

### Backend API Functions (to implement)

```javascript
// 1. Google Analytics 4
async function fetchGA4Data(propertyId, credentials) {
  // Return: { users, sessions, pageviews, revenue, avgSessionDuration }
}

// 2. Google Search Console  
async function fetchGSCData(domain, credentials) {
  // Return: { impressions, clicks, avgPosition, ctr, topKeywords }
}

// 3. Google Sheets
async function fetchSheetsData(sheetId, credentials) {
  // Return: { revenue, products, conversions, dailyData }
}
```

### Dashboard Real-Time Updates

```javascript
// Every 30 seconds:
1. Fetch /api/dashboard
2. Calculate real health score from GA4 + GSC
3. Identify alerts (low traffic, ranking drops)
4. Update UI with live metrics
```

---

## 🔗 Endpoints Ready

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Full Dashboard Data:**
```bash
curl http://localhost:3000/api/real-health-check
```

**Analytics for Property:**
```bash
curl http://localhost:3000/api/analytics/491845681
```

**Search Console for Domain:**
```bash
curl http://localhost:3000/api/search-console/bestbathrugs.com
```

**Blog Registry:**
```bash
curl http://localhost:3000/api/registry
```

---

## 🚀 Production Deployment

### Option 1: Render (Recommended)

```bash
# 1. Push backend to GitHub
git push origin main

# 2. Connect Render to repo
# https://render.com/

# 3. Create Web Service
# - Build: npm install
# - Start: npm start
# - Environment: Add CREDS_PATH, REGISTRY_PATH

# 4. Get API URL
# https://neclid-api.onrender.com/
```

### Option 2: Vercel Serverless

```bash
# 1. Create vercel.json
# 2. Move server.js to /api/server.js
# 3. Deploy: vercel --prod
```

### Option 3: Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📊 Real Data You'll Get

Once GA4/GSC APIs are integrated, dashboard will show:

**Per Blog:**
- 📈 Traffic (users, sessions, pageviews)
- 🎯 Google Rankings (avg position, impressions, clicks)
- 💰 Revenue (from Sheets tracking)
- ⚡ Health Score (calculated from all metrics)

**Alerts:**
- 🔴 Traffic drop detected
- 🔴 Ranking drop detected
- 🟡 Below target production rate
- 🟡 Images missing or broken

**Summary:**
- 📊 Total network traffic
- 💰 Total revenue
- 📝 Total articles
- 🎯 Avg ranking position
- 📈 Growth trends

---

## 🎯 Next Actions

1. **Run backend**: `npm run dev` in `/backend/`
2. **Open dashboard**: Open `real-dashboard.html` in browser
3. **Test API**: Backend will connect and show real blog status
4. **Implement GA4 API**: Follow template in server.js
5. **Deploy**: Choose Render/Vercel/Docker option

**All credentials are ready. Just need to wire up the API calls.** ✨

---

## 📞 Support

API is running? → You'll see "🟢 EN LIGNE" in dashboard header
Check console for detailed logs.

Questions? Check backend/server.js for endpoint structure.
